const vendaController = require('../controllers/vendaController');
const Venda = require('../models/Venda');

// Mock dos módulos
jest.mock('../models/Venda');

describe('Análise de Vendas', () => {
  // Limpar todos os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analisarVendas', () => {
    it('deve analisar vendas por período com sucesso', async () => {
      // Mock dos dados da requisição
      const req = {
        query: {
          dataInicio: '2023-01-01',
          dataFim: '2023-12-31'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock das vendas encontradas
      const vendasMock = [
        {
          _id: '1',
          valorTotal: 100.50,
          data: new Date('2023-05-20'),
          itens: [
            { produto: { _id: 'p1', nome: 'Produto 1' }, quantidade: 2, precoUnitario: 25.00, subtotal: 50.00 },
            { produto: { _id: 'p2', nome: 'Produto 2' }, quantidade: 1, precoUnitario: 50.50, subtotal: 50.50 }
          ]
        },
        {
          _id: '2',
          valorTotal: 75.00,
          data: new Date('2023-07-15'),
          itens: [
            { produto: { _id: 'p1', nome: 'Produto 1' }, quantidade: 1, precoUnitario: 25.00, subtotal: 25.00 },
            { produto: { _id: 'p3', nome: 'Produto 3' }, quantidade: 1, precoUnitario: 50.00, subtotal: 50.00 }
          ]
        }
      ];

      // Mock do método find
      const mockFind = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockGte = jest.fn().mockReturnThis();
      const mockLte = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockReturnThis();
      const mockExec = jest.fn().mockResolvedValue(vendasMock);

      Venda.find = mockFind;
      Venda.find().where = mockWhere;
      Venda.find().where().gte = mockGte;
      Venda.find().where().gte().lte = mockLte;
      Venda.find().where().gte().lte().populate = mockPopulate;
      Venda.find().where().gte().lte().populate().exec = mockExec;

      // Chamar o método
      await vendaController.analisarVendas(req, res);

      // Verificar se os métodos de busca foram chamados com os parâmetros corretos
      expect(mockFind).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('data');
      expect(mockGte).toHaveBeenCalledWith(new Date('2023-01-01T00:00:00.000Z'));
      expect(mockLte).toHaveBeenCalledWith(new Date('2023-12-31T23:59:59.999Z'));
      expect(mockPopulate).toHaveBeenCalledWith('itens.produto');
      expect(mockExec).toHaveBeenCalled();

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: false,
          analise: expect.objectContaining({
            periodo: {
              dataInicio: expect.any(String),
              dataFim: expect.any(String)
            },
            quantidadeVendas: 2,
            valorTotal: 175.50,
            produtosVendidos: expect.arrayContaining([
              expect.objectContaining({
                produto: expect.objectContaining({
                  _id: 'p1',
                  nome: 'Produto 1'
                }),
                quantidade: 3,
                valorTotal: 75.00
              }),
              expect.objectContaining({
                produto: expect.objectContaining({
                  _id: 'p2',
                  nome: 'Produto 2'
                }),
                quantidade: 1,
                valorTotal: 50.50
              }),
              expect.objectContaining({
                produto: expect.objectContaining({
                  _id: 'p3',
                  nome: 'Produto 3'
                }),
                quantidade: 1,
                valorTotal: 50.00
              })
            ])
          })
        })
      );
    });

    it('deve retornar erro se as datas não forem fornecidas', async () => {
      // Mock dos dados da requisição
      const req = {
        query: {}
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Chamar o método
      await vendaController.analisarVendas(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: expect.stringContaining('obrigatórias')
        })
      );
    });

    it('deve retornar análise vazia se não houver vendas no período', async () => {
      // Mock dos dados da requisição
      const req = {
        query: {
          dataInicio: '2023-01-01',
          dataFim: '2023-12-31'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do método find retornando array vazio
      const mockFind = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockGte = jest.fn().mockReturnThis();
      const mockLte = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockReturnThis();
      const mockExec = jest.fn().mockResolvedValue([]);

      Venda.find = mockFind;
      Venda.find().where = mockWhere;
      Venda.find().where().gte = mockGte;
      Venda.find().where().gte().lte = mockLte;
      Venda.find().where().gte().lte().populate = mockPopulate;
      Venda.find().where().gte().lte().populate().exec = mockExec;

      // Chamar o método
      await vendaController.analisarVendas(req, res);

      // Verificar se os métodos de busca foram chamados com os parâmetros corretos
      expect(mockFind).toHaveBeenCalled();
      expect(mockExec).toHaveBeenCalled();

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: false,
          analise: expect.objectContaining({
            periodo: expect.any(Object),
            quantidadeVendas: 0,
            valorTotal: 0,
            produtosVendidos: []
          })
        })
      );
    });
  });
}); 