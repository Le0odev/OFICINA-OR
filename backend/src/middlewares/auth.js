const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Definir JWT_SECRET diretamente se não existir
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'segredo_jwt_super_secreto';
}

// Middleware para verificar token
exports.verificarToken = async (req, res, next) => {
  try {
    // Obter o token do header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        erro: true, 
        mensagem: 'Acesso negado. Token não fornecido.'
      });
    }

    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar o usuário pelo ID
    const usuario = await Usuario.findById(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({ 
        erro: true, 
        mensagem: 'Token inválido: usuário não encontrado.'
      });
    }

    // Adicionar o usuário ao objeto de requisição
    req.usuario = usuario;
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      erro: true, 
      mensagem: 'Token inválido ou expirado.'
    });
  }
};

// Middleware para verificar o cargo do usuário
exports.verificarCargo = (...cargos) => {
  return (req, res, next) => {
    if (!cargos.includes(req.usuario.cargo)) {
      return res.status(403).json({
        erro: true,
        mensagem: 'Acesso negado. Você não tem permissão para acessar este recurso.'
      });
    }
    next();
  };
}; 