const Venda = require('../models/Venda');
const Cliente = require('../models/Cliente');
const Produto = require('../models/Produto');
const { paginacao } = require('../utils/paginacao');

// Criar uma nova venda
exports.criar = async (req, res) => {
  try {
    const { clienteId, itens, formaPagamento, observacoes } = req.body;
    
    console.log('Dados recebidos para criação de venda:', req.body);
    console.log('ID do cliente:', clienteId);
    console.log('Itens recebidos:', itens);

    // Verificar se o cliente existe
    const cliente = await Cliente.findById(clienteId);
    console.log('Cliente encontrado?', !!cliente);
    
    if (!cliente) {
      return res.status(404).json({
        erro: true,
        mensagem: 'Cliente não encontrado'
      });
    }

    // Verificar e processar os itens da venda
    if (!itens || itens.length === 0) {
      return res.status(400).json({
        erro: true,
        mensagem: 'É necessário pelo menos um item para criar uma venda'
      });
    }

    // Array para armazenar os itens processados
    const itensProcessados = [];
    let totalVenda = 0;

    // Processar cada item
    for (const item of itens) {
      console.log('Processando item:', item);
      
      // Buscar o produto
      const produto = await Produto.findById(item.produtoId);
      console.log('Produto encontrado?', !!produto);
      
      if (!produto) {
        return res.status(404).json({
          erro: true,
          mensagem: `Produto com ID ${item.produtoId} não encontrado`
        });
      }

      // Verificar se há estoque suficiente
      if (produto.estoque < item.quantidade) {
        return res.status(400).json({
          erro: true,
          mensagem: `Estoque insuficiente para o produto ${produto.nome}`
        });
      }

      // Calcular subtotal
      const subtotal = produto.preco * item.quantidade;
      
      // Adicionar item processado
      itensProcessados.push({
        produto: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: produto.preco,
        subtotal
      });

      // Adicionar ao total da venda
      totalVenda += subtotal;

      // Atualizar o estoque do produto
      produto.estoque -= item.quantidade;
      await produto.save();
    }

    // Criar a venda
    const venda = new Venda({
      cliente: clienteId,
      itens: itensProcessados,
      valorTotal: totalVenda,
      formaPagamento: formaPagamento || 'dinheiro', // Valor padrão se não for fornecido
      observacoes
    });

    await venda.save();
    console.log('Venda criada com sucesso:', venda);

    res.status(201).json({
      erro: false,
      mensagem: 'Venda criada com sucesso',
      venda
    });
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao criar venda: ${error.message}`
    });
  }
};

// Obter todas as vendas com paginação
exports.listar = async (req, res) => {
  try {
    // Filtros opcionais
    const filtros = {};
    
    // Filtrar por cliente
    if (req.query.cliente) {
      filtros.cliente = req.query.cliente;
    }
    
    // Filtrar por status
    if (req.query.status) {
      filtros.status = req.query.status;
    }

    console.log('Listando vendas com filtros:', filtros);

    // Aplicar paginação
    const resultado = await paginacao(req, Venda, filtros, {
      populate: [
        { path: 'cliente', select: 'nome email cpf telefone' },
        { path: 'itens.produto', select: 'nome preco descricao categoria imagem' }
      ]
    });

    console.log(`Foram encontradas ${resultado.resultados.length} vendas`);
    
    // Verificar se os itens estão sendo populados corretamente
    if (resultado.resultados.length > 0) {
      console.log('Exemplo de itens na primeira venda:', resultado.resultados[0].itens);
    }

    res.status(200).json({
      erro: false,
      ...resultado
    });
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao listar vendas: ${error.message}`
    });
  }
};

// Obter uma venda por ID
exports.obterPorId = async (req, res) => {
  try {
    const venda = await Venda.findById(req.params.id)
      .populate('cliente', 'nome email cpf telefone')
      .populate('itens.produto', 'nome preco descricao categoria imagem');
    
    if (!venda) {
      return res.status(404).json({
        erro: true,
        mensagem: 'Venda não encontrada'
      });
    }

    console.log('Venda encontrada com itens:', venda.itens);

    res.status(200).json({
      erro: false,
      venda
    });
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao buscar venda: ${error.message}`
    });
  }
};

// Atualizar o status de uma venda
exports.atualizarStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        erro: true,
        mensagem: 'Status é obrigatório'
      });
    }
    
    // Buscar a venda
    let venda = await Venda.findById(req.params.id);
    
    if (!venda) {
      return res.status(404).json({
        erro: true,
        mensagem: 'Venda não encontrada'
      });
    }

    // Atualizar o status
    venda.status = status;
    
    // Salvar as alterações
    await venda.save();

    res.status(200).json({
      erro: false,
      mensagem: 'Status da venda atualizado com sucesso',
      venda
    });
  } catch (error) {
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao atualizar status da venda: ${error.message}`
    });
  }
};

// Cancelar uma venda
exports.cancelar = async (req, res) => {
  try {
    // Buscar a venda
    let venda = await Venda.findById(req.params.id)
      .populate('itens.produto');
    
    if (!venda) {
      return res.status(404).json({
        erro: true,
        mensagem: 'Venda não encontrada'
      });
    }

    // Verificar se a venda já está cancelada
    if (venda.status === 'cancelado') {
      return res.status(400).json({
        erro: true,
        mensagem: 'Venda já está cancelada'
      });
    }

    // Devolver os produtos ao estoque
    for (const item of venda.itens) {
      const produto = await Produto.findById(item.produto);
      if (produto) {
        produto.estoque += item.quantidade;
        await produto.save();
      }
    }

    // Atualizar o status da venda
    venda.status = 'cancelado';
    
    // Salvar as alterações
    await venda.save();

    res.status(200).json({
      erro: false,
      mensagem: 'Venda cancelada com sucesso',
      venda
    });
  } catch (error) {
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao cancelar venda: ${error.message}`
    });
  }
};

// Análise de vendas por período
exports.analisarPeriodo = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    
    console.log('Analisando vendas do período:', dataInicio, 'a', dataFim);
    
    if (!dataInicio || !dataFim) {
      return res.status(400).json({
        erro: true,
        mensagem: 'Data de início e fim são obrigatórias'
      });
    }

    // Converter as datas para objetos Date
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    // Ajustar data final para incluir todo o dia
    fim.setHours(23, 59, 59, 999);

    // Consultar vendas no período
    const vendas = await Venda.find({
      dataCriacao: { $gte: inicio, $lte: fim },
      status: { $ne: 'cancelado' }
    }).populate('itens.produto', 'nome preco categoria');

    console.log(`Encontradas ${vendas.length} vendas no período.`);

    // Calcular estatísticas
    const totalVendas = vendas.length;
    const rendaTotal = vendas.reduce((total, venda) => total + venda.valorTotal, 0);
    const ticketMedio = totalVendas > 0 ? rendaTotal / totalVendas : 0;
    
    // Contadores para análise mais detalhada
    let totalProdutos = 0;
    const produtosVendidos = {};
    const categorias = {};
    
    // Processar vendas para análise
    vendas.forEach(venda => {
      venda.itens.forEach(item => {
        // Contar total de produtos vendidos
        totalProdutos += item.quantidade;
        
        // Análise por produto
        const produtoId = item.produto._id.toString();
        const produtoNome = item.produto.nome;
        const produtoCategoria = item.produto.categoria || 'Sem categoria';
        
        if (!produtosVendidos[produtoId]) {
          produtosVendidos[produtoId] = {
            id: produtoId,
            nome: produtoNome,
            categoria: produtoCategoria,
            quantidade: 0,
            valorTotal: 0
          };
        }
        
        produtosVendidos[produtoId].quantidade += item.quantidade;
        produtosVendidos[produtoId].valorTotal += item.subtotal;
        
        // Análise por categoria
        if (!categorias[produtoCategoria]) {
          categorias[produtoCategoria] = {
            categoria: produtoCategoria,
            quantidade: 0,
            valorTotal: 0
          };
        }
        
        categorias[produtoCategoria].quantidade += item.quantidade;
        categorias[produtoCategoria].valorTotal += item.subtotal;
      });
    });

    // Transformar objetos em arrays e ordenar
    const produtosMaisVendidos = Object.values(produtosVendidos)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10); // Top 10 produtos mais vendidos
      
    const produtosPorCategoria = Object.values(categorias)
      .sort((a, b) => b.valorTotal - a.valorTotal);

    console.log('Análise concluída com sucesso.');

    res.status(200).json({
      erro: false,
      dados: {
        periodo: {
          inicio: dataInicio,
          fim: dataFim
        },
        totalVendas,
        rendaTotal,
        ticketMedio,
        totalProdutos,
        produtosMaisVendidos,
        produtosPorCategoria
      }
    });
  } catch (error) {
    console.error('Erro ao analisar vendas:', error);
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao analisar vendas: ${error.message}`
    });
  }
}; 