const vendaController = require('../controllers/vendaController');
const Venda = require('../models/Venda');
const Cliente = require('../models/Cliente');
const Produto = require('../models/Produto');
const { paginacao } = require('../utils/paginacao');

// Mock dos módulos
jest.mock('../models/Venda');
jest.mock('../models/Cliente');
jest.mock('../models/Produto');
jest.mock('../utils/paginacao');

describe('Venda Controller', () => {
  // Limpar todos os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criar', () => {
    it('deve criar uma nova venda com sucesso', async () => {
      // Mock dos dados da requisição
      const req = {
        body: {
          clienteId: 'cliente_id',
          itens: [
            { produtoId: 'produto_id_1', quantidade: 2 },
            { produtoId: 'produto_id_2', quantidade: 1 }
          ],
          formaPagamento: 'cartão',
          observacoes: 'Entrega rápida'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do cliente
      const clienteMock = {
        _id: 'cliente_id',
        nome: 'Cliente Teste'
      };

      // Mock dos produtos
      const produtoMock1 = {
        _id: 'produto_id_1',
        nome: 'Produto 1',
        preco: 10.99,
        estoque: 10,
        save: jest.fn().mockResolvedValue(true)
      };

      const produtoMock2 = {
        _id: 'produto_id_2',
        nome: 'Produto 2',
        preco: 20.99,
        estoque: 5,
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock da venda salva
      const vendaSalva = {
        _id: 'venda_id',
        cliente: 'cliente_id',
        itens: [
          {
            produto: 'produto_id_1',
            quantidade: 2,
            precoUnitario: 10.99,
            subtotal: 21.98
          },
          {
            produto: 'produto_id_2',
            quantidade: 1,
            precoUnitario: 20.99,
            subtotal: 20.99
          }
        ],
        valorTotal: 42.97,
        formaPagamento: 'cartão',
        observacoes: 'Entrega rápida',
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock dos métodos
      Cliente.findById.mockResolvedValue(clienteMock);
      Produto.findById.mockImplementation((id) => {
        if (id === 'produto_id_1') return produtoMock1;
        if (id === 'produto_id_2') return produtoMock2;
        return null;
      });
      Venda.mockImplementation(() => vendaSalva);

      // Chamar o método
      await vendaController.criar(req, res);

      // Verificar se os métodos foram chamados corretamente
      expect(Cliente.findById).toHaveBeenCalledWith('cliente_id');
      expect(Produto.findById).toHaveBeenCalledWith('produto_id_1');
      expect(Produto.findById).toHaveBeenCalledWith('produto_id_2');
      expect(produtoMock1.save).toHaveBeenCalled();
      expect(produtoMock2.save).toHaveBeenCalled();
      expect(vendaSalva.save).toHaveBeenCalled();

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: false,
          mensagem: 'Venda criada com sucesso',
          venda: vendaSalva
        })
      );
    });

    it('deve retornar erro se o cliente não for encontrado', async () => {
      // Mock dos dados da requisição
      const req = {
        body: {
          clienteId: 'cliente_inexistente',
          itens: [
            { produtoId: 'produto_id', quantidade: 2 }
          ]
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do método findById (cliente não existe)
      Cliente.findById.mockResolvedValue(null);

      // Chamar o método
      await vendaController.criar(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: 'Cliente não encontrado'
        })
      );
    });

    it('deve retornar erro se não houver itens', async () => {
      // Mock dos dados da requisição
      const req = {
        body: {
          clienteId: 'cliente_id',
          itens: []
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do cliente
      const clienteMock = {
        _id: 'cliente_id',
        nome: 'Cliente Teste'
      };

      // Mock do método findById
      Cliente.findById.mockResolvedValue(clienteMock);

      // Chamar o método
      await vendaController.criar(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: 'É necessário pelo menos um item para criar uma venda'
        })
      );
    });

    it('deve retornar erro se o produto não for encontrado', async () => {
      // Mock dos dados da requisição
      const req = {
        body: {
          clienteId: 'cliente_id',
          itens: [
            { produtoId: 'produto_inexistente', quantidade: 2 }
          ]
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do cliente
      const clienteMock = {
        _id: 'cliente_id',
        nome: 'Cliente Teste'
      };

      // Mock dos métodos
      Cliente.findById.mockResolvedValue(clienteMock);
      Produto.findById.mockResolvedValue(null);

      // Chamar o método
      await vendaController.criar(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: expect.stringContaining('não encontrado')
        })
      );
    });

    it('deve retornar erro se o estoque for insuficiente', async () => {
      // Mock dos dados da requisição
      const req = {
        body: {
          clienteId: 'cliente_id',
          itens: [
            { produtoId: 'produto_id', quantidade: 10 }
          ]
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do cliente
      const clienteMock = {
        _id: 'cliente_id',
        nome: 'Cliente Teste'
      };

      // Mock do produto com estoque insuficiente
      const produtoMock = {
        _id: 'produto_id',
        nome: 'Produto Teste',
        preco: 10.99,
        estoque: 5 // Quantidade menor que a solicitada
      };

      // Mock dos métodos
      Cliente.findById.mockResolvedValue(clienteMock);
      Produto.findById.mockResolvedValue(produtoMock);

      // Chamar o método
      await vendaController.criar(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: expect.stringContaining('Estoque insuficiente')
        })
      );
    });
  });

  describe('listar', () => {
    it('deve listar vendas com paginação', async () => {
      // Mock dos dados da requisição
      const req = {
        query: {
          pagina: '1',
          limite: '10',
          cliente: 'cliente_id'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Resultado da paginação mockado
      const resultadoPaginacao = {
        paginaAtual: 1,
        itensPorPagina: 10,
        totalItens: 2,
        totalPaginas: 1,
        resultados: [
          { _id: '1', cliente: 'cliente_id', valorTotal: 100.99 },
          { _id: '2', cliente: 'cliente_id', valorTotal: 50.50 }
        ]
      };

      // Mock da função de paginação
      paginacao.mockResolvedValue(resultadoPaginacao);

      // Chamar o método
      await vendaController.listar(req, res);

      // Verificar se a paginação foi chamada corretamente
      expect(paginacao).toHaveBeenCalledWith(
        req, 
        Venda, 
        expect.objectContaining({ cliente: 'cliente_id' }), 
        expect.any(Object)
      );

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: false,
          ...resultadoPaginacao
        })
      );
    });
  });

  describe('obterPorId', () => {
    it('deve retornar uma venda específica', async () => {
      // Mock dos dados da requisição
      const req = {
        params: {
          id: '1'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock da venda encontrada
      const vendaMock = {
        _id: '1',
        cliente: 'cliente_id',
        itens: [
          { produto: 'produto_id', quantidade: 2, precoUnitario: 10.99, subtotal: 21.98 }
        ],
        valorTotal: 21.98,
        populate: jest.fn().mockReturnThis()
      };

      // Mock do método findById
      Venda.findById.mockReturnValue(vendaMock);

      // Chamar o método
      await vendaController.obterPorId(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: false,
          venda: vendaMock
        })
      );
    });

    it('deve retornar erro se a venda não for encontrada', async () => {
      // Mock dos dados da requisição
      const req = {
        params: {
          id: 'id_inexistente'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do método findById com populate (venda não existe)
      const mockPopulate = {
        populate: jest.fn().mockReturnValue(null)
      };
      Venda.findById.mockReturnValue(mockPopulate);

      // Chamar o método
      await vendaController.obterPorId(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: 'Venda não encontrada'
        })
      );
    });
  });
}); 