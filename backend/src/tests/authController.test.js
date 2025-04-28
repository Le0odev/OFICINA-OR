const authController = require('../controllers/authController');
const Usuario = require('../models/Usuario');

// Mock do modelo Usuario
jest.mock('../models/Usuario');

describe('Auth Controller', () => {
  // Limpar todos os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registrar', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      // Mock dos dados da requisição
      const req = {
        body: {
          nome: 'Usuário Teste',
          email: 'teste@example.com',
          senha: 'senha123',
          cargo: 'cliente'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do método findOne do modelo
      Usuario.findOne.mockResolvedValue(null);

      // Mock do método save
      const usuarioSalvo = {
        _id: 'id_mockado',
        nome: req.body.nome,
        email: req.body.email,
        cargo: req.body.cargo,
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock da criação do usuário
      Usuario.mockImplementation(() => usuarioSalvo);

      // Chamar o método
      await authController.registrar(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: false,
          mensagem: 'Usuário registrado com sucesso',
          usuario: expect.objectContaining({
            nome: req.body.nome,
            email: req.body.email
          }),
          token: expect.any(String)
        })
      );
    });

    it('deve retornar erro se o usuário já existir', async () => {
      // Mock dos dados da requisição
      const req = {
        body: {
          nome: 'Usuário Teste',
          email: 'teste@example.com',
          senha: 'senha123'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do método findOne (usuário já existe)
      Usuario.findOne.mockResolvedValue({ email: req.body.email });

      // Chamar o método
      await authController.registrar(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: 'Usuário com este email já existe'
        })
      );
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      // Mock dos dados da requisição
      const req = {
        body: {
          email: 'teste@example.com',
          senha: 'senha123'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do usuário encontrado
      const usuarioMock = {
        _id: 'id_mockado',
        nome: 'Usuário Teste',
        email: req.body.email,
        cargo: 'cliente',
        verificarSenha: jest.fn().mockResolvedValue(true)
      };

      // Mock do método findOne
      Usuario.findOne.mockResolvedValue(usuarioMock);

      // Chamar o método
      await authController.login(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: false,
          mensagem: 'Login realizado com sucesso',
          usuario: expect.objectContaining({
            nome: usuarioMock.nome,
            email: usuarioMock.email
          }),
          token: expect.any(String)
        })
      );
    });

    it('deve retornar erro se o email não existir', async () => {
      // Mock dos dados da requisição
      const req = {
        body: {
          email: 'naoexiste@example.com',
          senha: 'senha123'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do método findOne (usuário não existe)
      Usuario.findOne.mockResolvedValue(null);

      // Chamar o método
      await authController.login(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: 'Credenciais inválidas'
        })
      );
    });

    it('deve retornar erro se a senha estiver incorreta', async () => {
      // Mock dos dados da requisição
      const req = {
        body: {
          email: 'teste@example.com',
          senha: 'senha_errada'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock do usuário encontrado
      const usuarioMock = {
        _id: 'id_mockado',
        email: req.body.email,
        verificarSenha: jest.fn().mockResolvedValue(false) // senha incorreta
      };

      // Mock do método findOne
      Usuario.findOne.mockResolvedValue(usuarioMock);

      // Chamar o método
      await authController.login(req, res);

      // Verificar se o status e json foram chamados com os parâmetros corretos
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: true,
          mensagem: 'Credenciais inválidas'
        })
      );
    });
  });
}); 