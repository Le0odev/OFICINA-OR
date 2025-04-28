const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const Produto = require('../models/Produto');
const Cliente = require('../models/Cliente');

// Conexão com MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce-ro')
  .then(() => console.log('Conectado ao MongoDB para seed'))
  .catch(err => console.log('Erro ao conectar ao MongoDB:', err));

// Seed de Usuários
const seedUsuarios = async () => {
  try {
    // Limpa a coleção
    await Usuario.deleteMany({});

    // Cria usuários padrão
    const adminSenha = await bcrypt.hash('admin123', 10);
    const vendedorSenha = await bcrypt.hash('vendedor123', 10);

    await Usuario.insertMany([
      {
        nome: 'Administrador',
        email: 'admin@ecommerce.com',
        senha: adminSenha,
        cargo: 'admin'
      },
      {
        nome: 'Vendedor',
        email: 'vendedor@ecommerce.com',
        senha: vendedorSenha,
        cargo: 'vendedor'
      }
    ]);

    console.log('Usuários criados com sucesso');
  } catch (error) {
    console.error('Erro ao criar usuários:', error);
  }
};

// Seed de Produtos
const seedProdutos = async () => {
  try {
    // Limpa a coleção
    await Produto.deleteMany({});

    // Cria produtos de exemplo
    await Produto.insertMany([
      {
        nome: 'Vela de Ignição NGK',
        descricao: 'Vela de ignição para veículos leves, resistente a altas temperaturas',
        preco: 25.90,
        estoque: 100,
        categoria: 'Motor',
        imagem: 'https://via.placeholder.com/300x200.png?text=Vela+de+Ignição'
      },
      {
        nome: 'Filtro de Óleo Tecfil',
        descricao: 'Filtro de óleo para veículos com motor 1.0 a 2.0',
        preco: 29.90,
        estoque: 80,
        categoria: 'Motor',
        imagem: 'https://via.placeholder.com/300x200.png?text=Filtro+de+Óleo'
      },
      {
        nome: 'Pastilha de Freio Frasle',
        descricao: 'Jogo de pastilhas de freio para veículos leves',
        preco: 89.90,
        estoque: 50,
        categoria: 'Freios',
        imagem: 'https://via.placeholder.com/300x200.png?text=Pastilha+de+Freio'
      },
      {
        nome: 'Óleo Lubrificante 5W30',
        descricao: 'Óleo lubrificante sintético para motores flex',
        preco: 35.90,
        estoque: 120,
        categoria: 'Lubrificantes',
        imagem: 'https://via.placeholder.com/300x200.png?text=Óleo+Lubrificante'
      },
      {
        nome: 'Bateria Moura 60Ah',
        descricao: 'Bateria selada para veículos médios',
        preco: 359.90,
        estoque: 30,
        categoria: 'Elétrica',
        imagem: 'https://via.placeholder.com/300x200.png?text=Bateria+Moura'
      },
      {
        nome: 'Kit Embreagem Sachs',
        descricao: 'Kit completo de embreagem para veículos leves',
        preco: 389.90,
        estoque: 25,
        categoria: 'Transmissão',
        imagem: 'https://via.placeholder.com/300x200.png?text=Kit+Embreagem'
      }
    ]);

    console.log('Produtos criados com sucesso');
  } catch (error) {
    console.error('Erro ao criar produtos:', error);
  }
};

// Seed de Clientes
const seedClientes = async () => {
  try {
    // Limpa a coleção
    await Cliente.deleteMany({});
    
    // Encontrar um usuário para associar aos clientes
    const admin = await Usuario.findOne({ email: 'admin@ecommerce.com' });
    
    if (!admin) {
      console.error('Erro: Nenhum usuário admin encontrado para associar aos clientes');
      return;
    }

    // Cria clientes de exemplo
    await Cliente.insertMany([
      {
        usuario: admin._id,
        nome: 'João Silva',
        email: 'joao@email.com',
        cpf: '123.456.789-00',
        telefone: '(11) 98765-4321',
        endereco: {
          rua: 'Rua das Flores',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01001-000'
        }
      },
      {
        usuario: admin._id,
        nome: 'Maria Oliveira',
        email: 'maria@email.com',
        cpf: '987.654.321-00',
        telefone: '(11) 91234-5678',
        endereco: {
          rua: 'Avenida Paulista',
          numero: '1000',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01310-100'
        }
      },
      {
        usuario: admin._id,
        nome: 'Carlos Souza',
        email: 'carlos@email.com',
        cpf: '456.789.123-00',
        telefone: '(21) 98888-7777',
        endereco: {
          rua: 'Rua do Comércio',
          numero: '500',
          bairro: 'Centro',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          cep: '20010-020'
        }
      }
    ]);

    console.log('Clientes criados com sucesso');
  } catch (error) {
    console.error('Erro ao criar clientes:', error);
  }
};

// Executar seeds
const executarSeeds = async () => {
  await seedUsuarios();
  await seedProdutos();
  await seedClientes();
  
  console.log('Seed concluído com sucesso!');
  mongoose.connection.close();
};

executarSeeds(); 