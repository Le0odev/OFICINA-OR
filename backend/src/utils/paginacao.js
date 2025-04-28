/**
 * Função para criar a paginação dos resultados
 * @param {Object} req - Objeto de requisição
 * @param {Object} query - Consulta MongoDB
 * @param {Object} modelo - Modelo do Mongoose
 * @param {Object} opcoes - Opções adicionais (populate, select, etc)
 * @returns {Object} Objeto com resultado da consulta paginada
 */
exports.paginacao = async (req, modelo, filtros = {}, opcoes = {}) => {
  try {
    // Parâmetros de paginação
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const skip = (pagina - 1) * limite;
    
    // Ordenação
    const ordenacao = {};
    if (req.query.ordenarPor) {
      ordenacao[req.query.ordenarPor] = req.query.direcao === 'desc' ? -1 : 1;
    }

    // Filtros dinâmicos baseados na query string
    const filtroConsulta = { ...filtros };
    
    // Aplicar busca textual se especificada
    if (req.query.busca) {
      filtroConsulta.$text = { $search: req.query.busca };
    }

    // Contador total com os filtros aplicados
    const total = await modelo.countDocuments(filtroConsulta);
    
    // Consulta principal com paginação
    let query = modelo.find(filtroConsulta)
      .sort(ordenacao)
      .skip(skip)
      .limit(limite);
    
    // Aplicar populate se fornecido
    if (opcoes.populate) {
      query = query.populate(opcoes.populate);
    }
    
    // Aplicar select se fornecido
    if (opcoes.select) {
      query = query.select(opcoes.select);
    }
    
    // Executar consulta
    const resultados = await query;
    
    // Calcular total de páginas
    const totalPaginas = Math.ceil(total / limite);
    
    // Verificar se há próxima página
    const temProxima = pagina < totalPaginas;
    
    // Verificar se há página anterior
    const temAnterior = pagina > 1;
    
    return {
      paginaAtual: pagina,
      itensPorPagina: limite,
      totalItens: total,
      totalPaginas,
      temProxima,
      temAnterior,
      resultados
    };
  } catch (error) {
    throw new Error(`Erro na paginação: ${error.message}`);
  }
}; 