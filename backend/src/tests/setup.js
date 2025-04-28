// Define variáveis de ambiente para testes
process.env.JWT_SECRET = 'segredo_para_testes';
process.env.JWT_EXPIRATION = '1h';
process.env.NODE_ENV = 'test'; 