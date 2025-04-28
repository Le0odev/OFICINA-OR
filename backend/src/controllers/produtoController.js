const Produto = require('../models/Produto');
const { paginacao } = require('../utils/paginacao');

// Criar um novo produto
exports.criar = async (req, res) => {
  try {
    const { nome, descricao, preco, estoque, categoria, imagem } = req.body;

    // Criar o produto
    const produto = new Produto({
      nome,
      descricao,
      preco,
      estoque,
      categoria,
      imagem
    });

    await produto.save();

    res.status(201).json({
      erro: false,
      mensagem: 'Produto criado com sucesso',
      produto
    });
  } catch (error) {
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao criar produto: ${error.message}`
    });
  }
};

// Obter todos os produtos com paginação
exports.listar = async (req, res) => {
  try {
    // Filtros opcionais por categoria
    const filtros = {};
    if (req.query.categoria) {
      filtros.categoria = req.query.categoria;
    }
    
    // Filtrar por ativos/inativos
    if (req.query.ativo) {
      filtros.ativo = req.query.ativo === 'true';
    }

    // Aplicar paginação
    const resultado = await paginacao(req, Produto, filtros);

    res.status(200).json({
      erro: false,
      ...resultado
    });
  } catch (error) {
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao listar produtos: ${error.message}`
    });
  }
};

// Obter um produto por ID
exports.obterPorId = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);
    
    if (!produto) {
      return res.status(404).json({
        erro: true,
        mensagem: 'Produto não encontrado'
      });
    }

    res.status(200).json({
      erro: false,
      produto
    });
  } catch (error) {
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao buscar produto: ${error.message}`
    });
  }
};

// Atualizar um produto
exports.atualizar = async (req, res) => {
  try {
    const { nome, descricao, preco, estoque, categoria, imagem, ativo } = req.body;
    
    // Buscar o produto
    let produto = await Produto.findById(req.params.id);
    
    if (!produto) {
      return res.status(404).json({
        erro: true,
        mensagem: 'Produto não encontrado'
      });
    }

    // Atualizar os dados
    produto.nome = nome || produto.nome;
    produto.descricao = descricao || produto.descricao;
    produto.categoria = categoria || produto.categoria;
    produto.imagem = imagem || produto.imagem;
    
    // Atualizar apenas se valores numéricos forem fornecidos
    if (preco !== undefined) produto.preco = preco;
    if (estoque !== undefined) produto.estoque = estoque;
    if (ativo !== undefined) produto.ativo = ativo;

    // Salvar as alterações
    await produto.save();

    res.status(200).json({
      erro: false,
      mensagem: 'Produto atualizado com sucesso',
      produto
    });
  } catch (error) {
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao atualizar produto: ${error.message}`
    });
  }
};

// Remover um produto
exports.remover = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndDelete(req.params.id);
    
    if (!produto) {
      return res.status(404).json({
        erro: true,
        mensagem: 'Produto não encontrado'
      });
    }

    res.status(200).json({
      erro: false,
      mensagem: 'Produto removido com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao remover produto: ${error.message}`
    });
  }
}; 