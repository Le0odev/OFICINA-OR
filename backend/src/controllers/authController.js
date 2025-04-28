const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Definir JWT_SECRET diretamente se não existir
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'segredo_jwt_super_secreto';
}

// Definir expiração do token se não existir
if (!process.env.JWT_EXPIRATION) {
  process.env.JWT_EXPIRATION = '24h';
}

// Função para criar o token JWT
const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION
  });
};

// Registrar novo usuário
exports.registrar = async (req, res) => {
  try {
    const { nome, email, senha, cargo } = req.body;

    // Verificar se já existe um usuário com o mesmo email
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(400).json({
        erro: true,
        mensagem: 'Usuário com este email já existe'
      });
    }

    // Criar novo usuário
    usuario = new Usuario({
      nome,
      email,
      senha,
      cargo: cargo || 'cliente' // Define como cliente se não especificado
    });

    await usuario.save();

    // Gerar token
    const token = gerarToken(usuario._id);

    res.status(201).json({
      erro: false,
      mensagem: 'Usuário registrado com sucesso',
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao registrar usuário: ${error.message}`
    });
  }
};

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificar se o email está fornecido
    if (!email || !senha) {
      return res.status(400).json({
        erro: true,
        mensagem: 'Por favor, forneça email e senha'
      });
    }

    // Buscar usuário pelo email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({
        erro: true,
        mensagem: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const senhaCorreta = await usuario.verificarSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({
        erro: true,
        mensagem: 'Credenciais inválidas'
      });
    }

    // Gerar token
    const token = gerarToken(usuario._id);

    res.status(200).json({
      erro: false,
      mensagem: 'Login realizado com sucesso',
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao fazer login: ${error.message}`
    });
  }
};

// Obter o perfil do usuário logado
exports.perfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-senha');
    
    if (!usuario) {
      return res.status(404).json({
        erro: true,
        mensagem: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      erro: false,
      usuario
    });
  } catch (error) {
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao buscar perfil: ${error.message}`
    });
  }
}; 