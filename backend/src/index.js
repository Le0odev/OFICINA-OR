const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Configuração de ambiente com caminho explícito
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Rotas
const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const vendaRoutes = require('./routes/vendaRoutes');

// Inicialização do app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-ro';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.log('Erro ao conectar ao MongoDB:', err));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/vendas', vendaRoutes);

// Rota padrão
app.get('/', (req, res) => {
  res.send('API de E-commerce da Rota das Oficinas');
});

// Iniciar servidor
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const alternativePort = PORT + 1;
    console.log(`Porta ${PORT} em uso, tentando porta alternativa: ${alternativePort}`);
    app.listen(alternativePort, () => {
      console.log(`Servidor rodando na porta alternativa ${alternativePort}`);
    });
  } else {
    console.error('Erro ao iniciar o servidor:', err);
  }
});

module.exports = app; // Para testes 