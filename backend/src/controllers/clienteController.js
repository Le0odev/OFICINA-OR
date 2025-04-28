const Cliente = require('../models/Cliente');
const Usuario = require('../models/Usuario');
const { paginacao } = require('../utils/paginacao');

// Criar um novo cliente
exports.criar = async (req, res) => {
  try {
    const { nome, email, cpf, telefone, endereco, usuarioId } = req.body;
    
    console.log('Dados recebidos na requisição:', req.body);
    console.log('ID do usuário recebido:', usuarioId);

    // Verificar se já existe um cliente com o mesmo CPF
    let clienteExistente = await Cliente.findOne({ cpf });
    if (clienteExistente) {
      return res.status(400).json({
        erro: true,
        mensagem: 'Cliente com este CPF já existe'
      });
    }

    // Verificar se o usuário existe
    const usuario = await Usuario.findById(usuarioId);
    console.log('Usuário encontrado?', !!usuario);
    
    if (!usuario) {
      return res.status(404).json({
        erro: true,
        mensagem: 'Usuário não encontrado'
      });
    }

    // Criar o cliente
    const cliente = new Cliente({
      usuario: usuarioId,
      nome,
      email,
      cpf,
      telefone,
      endereco
    });

    await cliente.save();

    res.status(201).json({
      erro: false,
      mensagem: 'Cliente criado com sucesso',
      cliente
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao criar cliente: ${error.message}`
    });
  }
};

// Obter todos os clientes com paginação
exports.listar = async (req, res) => {
  try {
    console.log('Requisição de listagem recebida:', req.query);
    
    // Aplicar paginação
    const resultado = await paginacao(req, Cliente, {}, {
      populate: 'usuario',
      select: '-senha'
    });
    
    console.log('Total de clientes encontrados:', resultado.totalItens);
    console.log('Número de resultados retornados:', resultado.resultados.length);
    
    res.status(200).json({
      erro: false,
      ...resultado
    });
  } catch (error) {
    console.error('Erro na listagem de clientes:', error);
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao listar clientes: ${error.message}`
    });
  }
};

// Obter um cliente por ID
exports.obterPorId = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).populate('usuario', '-senha');
    
    if (!cliente) {
      return res.status(404).json({
        erro: true,
        mensagem: 'Cliente não encontrado'
      });
    }

    res.status(200).json({
      erro: false,
      cliente
    });
  } catch (error) {
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao buscar cliente: ${error.message}`
    });
  }
};

// Atualizar um cliente
exports.atualizar = async (req, res) => {
  try {
    const { nome, email, telefone, endereco } = req.body;
    
    // Buscar o cliente
    let cliente = await Cliente.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        erro: true,
        mensagem: 'Cliente não encontrado'
      });
    }

    // Atualizar os dados
    cliente.nome = nome || cliente.nome;
    cliente.email = email || cliente.email;
    cliente.telefone = telefone || cliente.telefone;
    
    if (endereco) {
      cliente.endereco = {
        ...cliente.endereco,
        ...endereco
      };
    }

    // Salvar as alterações
    await cliente.save();

    res.status(200).json({
      erro: false,
      mensagem: 'Cliente atualizado com sucesso',
      cliente
    });
  } catch (error) {
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao atualizar cliente: ${error.message}`
    });
  }
};

// Remover um cliente
exports.remover = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        erro: true,
        mensagem: 'Cliente não encontrado'
      });
    }

    res.status(200).json({
      erro: false,
      mensagem: 'Cliente removido com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao remover cliente: ${error.message}`
    });
  }
}; 