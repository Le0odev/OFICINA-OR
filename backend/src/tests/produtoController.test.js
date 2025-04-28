const produtoController = require('../controllers/produtoController');
const Produto = require('../models/Produto');
const { paginacao } = require('../utils/paginacao');

// Mock dos módulos
jest.mock('../models/Produto');
jest.mock('../utils/paginacao');

describe('Produto Controller', () => {
  // Limpar todos os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criar', () => {
    it('deve criar um novo produto com sucesso', async () => {
      // Mock dos dados da requisição
      const req = {
        body: {
          nome: 'Produto Teste',
          preco: 29.99,
          descricao: 'Descrição do produto teste',
          categoria: 'categoria teste',
          estoque: 50,
          imagem: 'url-da-imagem'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do produto salvo
      const produtoSalvo = {
        _id: 'id_mockado',
        ...req.body,
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock da criação do produto
      Produto.mockImplementation(() => produtoSalvo);

      // Chamar o método
      await produtoController.criar(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: false,
          mensagem: 'Produto criado com sucesso',
          produto: expect.objectContaining({
            nome: req.body.nome,
            preco: req.body.preco
          })
        })
      );
    });
  });

  describe('listar', () => {
    it('deve listar produtos com paginação', async () => {
      // Mock dos dados da requisição
      const req = {
        query: {
          pagina: '1',
          limite: '10',
          categoria: 'eletrônicos'
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
          { _id: '1', nome: 'Produto 1', preco: 19.99, categoria: 'eletrônicos' },
          { _id: '2', nome: 'Produto 2', preco: 29.99, categoria: 'eletrônicos' }
        ]
      };

      // Mock da função de paginação
      paginacao.mockResolvedValue(resultadoPaginacao);

      // Chamar o método
      await produtoController.listar(req, res);

      // Verificar se a paginação foi chamada corretamente
      expect(paginacao).toHaveBeenCalledWith(
        req, 
        Produto, 
        expect.objectContaining({ categoria: 'eletrônicos' }), 
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
    it('deve retornar um produto específico', async () => {
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

      // Mock do produto encontrado
      const produtoMock = {
        _id: '1',
        nome: 'Produto Teste',
        preco: 29.99,
        descricao: 'Descrição do produto teste'
      };

      // Mock do método findById
      Produto.findById.mockResolvedValue(produtoMock);

      // Chamar o método
      await produtoController.obterPorId(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: false,
          produto: produtoMock
        })
      );
    });

    it('deve retornar erro se o produto não for encontrado', async () => {
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

      // Mock do método findById (produto não existe)
      Produto.findById.mockResolvedValue(null);

      // Chamar o método
      await produtoController.obterPorId(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: 'Produto não encontrado'
        })
      );
    });
  });

  describe('atualizar', () => {
    it('deve atualizar um produto com sucesso', async () => {
      // Mock dos dados da requisição
      const req = {
        params: {
          id: '1'
        },
        body: {
          nome: 'Produto Atualizado',
          preco: 39.99
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do produto antes da atualização
      const produtoExistente = {
        _id: '1',
        nome: 'Produto Antigo',
        preco: 29.99,
        descricao: 'Descrição antiga',
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock do produto depois da atualização
      const produtoAtualizado = {
        _id: '1',
        nome: req.body.nome,
        preco: req.body.preco,
        descricao: 'Descrição antiga',
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock do método findById
      Produto.findById.mockResolvedValue(produtoExistente);

      // Mock do método save para retornar o produto atualizado
      produtoExistente.save.mockResolvedValue(produtoAtualizado);

      // Chamar o método
      await produtoController.atualizar(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: false,
          mensagem: 'Produto atualizado com sucesso',
          produto: expect.any(Object)
        })
      );
    });

    it('deve retornar erro se o produto não for encontrado', async () => {
      // Mock dos dados da requisição
      const req = {
        params: {
          id: 'id_inexistente'
        },
        body: {
          nome: 'Produto Atualizado'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do método findById (produto não existe)
      Produto.findById.mockResolvedValue(null);

      // Chamar o método
      await produtoController.atualizar(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: 'Produto não encontrado'
        })
      );
    });
  });

  describe('remover', () => {
    it('deve remover um produto com sucesso', async () => {
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

      // Mock do método findByIdAndDelete
      Produto.findByIdAndDelete.mockResolvedValue({
        _id: '1',
        nome: 'Produto Teste'
      });

      // Chamar o método
      await produtoController.remover(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: false,
          mensagem: 'Produto removido com sucesso'
        })
      );
    });

    it('deve retornar erro se o produto não for encontrado', async () => {
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

      // Mock do método findByIdAndDelete (produto não existe)
      Produto.findByIdAndDelete.mockResolvedValue(null);

      // Chamar o método
      await produtoController.remover(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: 'Produto não encontrado'
        })
      );
    });
  });
}); 