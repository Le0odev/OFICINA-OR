const { paginacao } = require('../utils/paginacao');

// Modelo mockado para testes
const ModeloMock = {
  countDocuments: jest.fn(),
  find: jest.fn(),
  sort: jest.fn(),
  skip: jest.fn(),
  limit: jest.fn(),
  populate: jest.fn(),
  select: jest.fn()
};

describe('Utilitário de Paginação', () => {
  // Limpar todos os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuração padrão para os mocks
    ModeloMock.countDocuments.mockResolvedValue(15);
    ModeloMock.find.mockReturnValue(ModeloMock);
    ModeloMock.sort.mockReturnValue(ModeloMock);
    ModeloMock.skip.mockReturnValue(ModeloMock);
    ModeloMock.limit.mockReturnValue(ModeloMock);
    ModeloMock.populate.mockReturnValue(ModeloMock);
    ModeloMock.select.mockResolvedValue([
      { id: '1', nome: 'Item 1' },
      { id: '2', nome: 'Item 2' },
      { id: '3', nome: 'Item 3' },
      { id: '4', nome: 'Item 4' },
      { id: '5', nome: 'Item 5' }
    ]);
  });

  it('deve paginar resultados corretamente', async () => {
    // Criar requisição mock
    const req = {
      query: {
        pagina: '2',
        limite: '5',
        ordenarPor: 'nome',
        direcao: 'asc'
      }
    };

    // Chamar a função de paginação
    const resultado = await paginacao(req, ModeloMock, {}, {});

    // Verificar se os métodos foram chamados corretamente
    expect(ModeloMock.countDocuments).toHaveBeenCalledWith({});
    expect(ModeloMock.find).toHaveBeenCalledWith({});
    expect(ModeloMock.sort).toHaveBeenCalledWith({ nome: 1 });
    expect(ModeloMock.skip).toHaveBeenCalledWith(5);
    expect(ModeloMock.limit).toHaveBeenCalledWith(5);

    // Verificar o resultado
    expect(resultado).toEqual({
      paginaAtual: 2,
      itensPorPagina: 5,
      totalItens: 15,
      totalPaginas: 3,
      temProxima: true,
      temAnterior: true,
      resultados: expect.any(Array)
    });
  });

  it('deve aplicar filtros corretamente', async () => {
    // Criar requisição mock
    const req = {
      query: {
        pagina: '1',
        limite: '10',
        busca: 'termo de busca'
      }
    };

    // Filtros personalizados
    const filtros = {
      categoria: 'categoria_teste'
    };

    // Chamar a função de paginação
    await paginacao(req, ModeloMock, filtros, {});

    // Verificar se os filtros foram aplicados corretamente
    expect(ModeloMock.find).toHaveBeenCalledWith({
      categoria: 'categoria_teste',
      $text: { $search: 'termo de busca' }
    });
    expect(ModeloMock.skip).toHaveBeenCalledWith(0);
    expect(ModeloMock.limit).toHaveBeenCalledWith(10);
  });

  it('deve usar valores padrão quando não fornecidos', async () => {
    // Criar requisição mock sem parâmetros de paginação
    const req = {
      query: {}
    };

    // Chamar a função de paginação
    const resultado = await paginacao(req, ModeloMock, {}, {});

    // Verificar se valores padrão foram usados
    expect(ModeloMock.skip).toHaveBeenCalledWith(0); // Primeira página (pagina - 1) * limite
    expect(ModeloMock.limit).toHaveBeenCalledWith(10); // Limite padrão
    expect(ModeloMock.sort).toHaveBeenCalledWith({});

    // Verificar o resultado
    expect(resultado).toEqual({
      paginaAtual: 1,
      itensPorPagina: 10,
      totalItens: 15,
      totalPaginas: 2,
      temProxima: true,
      temAnterior: false,
      resultados: expect.any(Array)
    });
  });

  it('deve aplicar opções populate e select corretamente', async () => {
    // Criar requisição mock
    const req = {
      query: {
        pagina: '1',
        limite: '5'
      }
    };

    // Opções adicionais
    const opcoes = {
      populate: 'campo_relacionado',
      select: 'campo1 campo2'
    };

    // Chamar a função de paginação
    await paginacao(req, ModeloMock, {}, opcoes);

    // Verificar se as opções foram aplicadas corretamente
    expect(ModeloMock.populate).toHaveBeenCalledWith('campo_relacionado');
    expect(ModeloMock.select).toHaveBeenCalledWith('campo1 campo2');
  });

  it('deve lidar com erros corretamente', async () => {
    // Criar requisição mock
    const req = {
      query: {
        pagina: '1',
        limite: '10'
      }
    };

    // Simular erro
    ModeloMock.countDocuments.mockRejectedValue(new Error('Erro de teste'));

    // Chamar a função de paginação e verificar se o erro é lançado
    await expect(paginacao(req, ModeloMock, {}, {})).rejects.toThrow('Erro na paginação: Erro de teste');
  });
}); 