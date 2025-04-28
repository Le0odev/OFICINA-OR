const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true
  },
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório'],
    unique: true,
    trim: true
  },
  telefone: {
    type: String,
    trim: true
  },
  endereco: {
    rua: {
      type: String,
      required: [true, 'Rua é obrigatória']
    },
    numero: {
      type: String,
      required: [true, 'Número é obrigatório']
    },
    complemento: String,
    bairro: {
      type: String,
      required: [true, 'Bairro é obrigatório']
    },
    cidade: {
      type: String,
      required: [true, 'Cidade é obrigatória']
    },
    estado: {
      type: String,
      required: [true, 'Estado é obrigatório']
    },
    cep: {
      type: String,
      required: [true, 'CEP é obrigatório'],
      trim: true
    }
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  },
  dataAtualizacao: {
    type: Date,
    default: Date.now
  }
});

// Atualiza a data de atualização quando o documento é modificado
ClienteSchema.pre('save', function(next) {
  this.dataAtualizacao = Date.now();
  next();
});

module.exports = mongoose.model('Cliente', ClienteSchema); 