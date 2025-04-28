const clienteController = require('../controllers/clienteController');
const Cliente = require('../models/Cliente');
const { paginacao } = require('../utils/paginacao');

// Mock dos módulos
jest.mock('../models/Cliente');
jest.mock('../utils/paginacao');

describe('Cliente Controller', () => {
  // Limpar todos os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criar', () => {
    it('deve criar um novo cliente com sucesso', async () => {
      // Mock dos dados da requisição
      const req = {
        body: {
          nome: 'Cliente Teste',
          email: 'cliente@example.com',
          cpf: '12345678900',
          telefone: '999999999',
          endereco: {
            rua: 'Rua Teste',
            numero: '123',
            bairro: 'Centro',
            cidade: 'Cidade Teste',
            estado: 'Estado Teste',
            cep: '12345678'
          }
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do método findOne do modelo
      Cliente.findOne.mockResolvedValue(null);

      // Mock do cliente salvo
      const clienteSalvo = {
        _id: 'id_mockado',
        ...req.body,
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock da criação do cliente
      Cliente.mockImplementation(() => clienteSalvo);

      // Chamar o método
      await clienteController.criar(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: false,
          mensagem: 'Cliente criado com sucesso',
          cliente: expect.objectContaining({
            nome: req.body.nome,
            email: req.body.email
          })
        })
      );
    });

    it('deve retornar erro se o cliente com o mesmo email já existir', async () => {
      // Mock dos dados da requisição
      const req = {
        body: {
          nome: 'Cliente Teste',
          email: 'cliente@example.com',
          cpf: '12345678900'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do método findOne (cliente já existe)
      Cliente.findOne.mockResolvedValue({ email: req.body.email });

      // Chamar o método
      await clienteController.criar(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: 'Cliente com este email já existe'
        })
      );
    });
  });

  describe('listar', () => {
    it('deve listar clientes com paginação', async () => {
      // Mock dos dados da requisição
      const req = {
        query: {
          pagina: '1',
          limite: '10'
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
          { _id: '1', nome: 'Cliente 1', email: 'cliente1@example.com' },
          { _id: '2', nome: 'Cliente 2', email: 'cliente2@example.com' }
        ]
      };

      // Mock da função de paginação
      paginacao.mockResolvedValue(resultadoPaginacao);

      // Chamar o método
      await clienteController.listar(req, res);

      // Verificar se a paginação foi chamada corretamente
      expect(paginacao).toHaveBeenCalledWith(req, Cliente, expect.any(Object), expect.any(Object));

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
    it('deve retornar um cliente específico', async () => {
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

      // Mock do cliente encontrado
      const clienteMock = {
        _id: '1',
        nome: 'Cliente Teste',
        email: 'cliente@example.com'
      };

      // Mock do método findById
      Cliente.findById.mockResolvedValue(clienteMock);

      // Chamar o método
      await clienteController.obterPorId(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: false,
          cliente: clienteMock
        })
      );
    });

    it('deve retornar erro se o cliente não for encontrado', async () => {
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

      // Mock do método findById (cliente não existe)
      Cliente.findById.mockResolvedValue(null);

      // Chamar o método
      await clienteController.obterPorId(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: 'Cliente não encontrado'
        })
      );
    });
  });

  describe('atualizar', () => {
    it('deve atualizar um cliente com sucesso', async () => {
      // Mock dos dados da requisição
      const req = {
        params: {
          id: '1'
        },
        body: {
          nome: 'Cliente Atualizado',
          telefone: '888888888'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do cliente antes da atualização
      const clienteExistente = {
        _id: '1',
        nome: 'Cliente Antigo',
        email: 'cliente@example.com',
        telefone: '999999999',
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock do cliente depois da atualização
      const clienteAtualizado = {
        _id: '1',
        nome: req.body.nome,
        email: 'cliente@example.com',
        telefone: req.body.telefone,
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock do método findById
      Cliente.findById.mockResolvedValue(clienteExistente);

      // Mock do método save para retornar o cliente atualizado
      clienteExistente.save.mockResolvedValue(clienteAtualizado);

      // Chamar o método
      await clienteController.atualizar(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: false,
          mensagem: 'Cliente atualizado com sucesso',
          cliente: expect.any(Object)
        })
      );
    });

    it('deve retornar erro se o cliente não for encontrado', async () => {
      // Mock dos dados da requisição
      const req = {
        params: {
          id: 'id_inexistente'
        },
        body: {
          nome: 'Cliente Atualizado'
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
      await clienteController.atualizar(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: 'Cliente não encontrado'
        })
      );
    });
  });

  describe('remover', () => {
    it('deve remover um cliente com sucesso', async () => {
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
      Cliente.findByIdAndDelete.mockResolvedValue({
        _id: '1',
        nome: 'Cliente Teste'
      });

      // Chamar o método
      await clienteController.remover(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: false,
          mensagem: 'Cliente removido com sucesso'
        })
      );
    });

    it('deve retornar erro se o cliente não for encontrado', async () => {
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

      // Mock do método findByIdAndDelete (cliente não existe)
      Cliente.findByIdAndDelete.mockResolvedValue(null);

      // Chamar o método
      await clienteController.remover(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: 'Cliente não encontrado'
        })
      );
    });
  });
}); 