const mongoose = require('mongoose');

const ItemVendaSchema = new mongoose.Schema({
  produto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produto',
    required: true
  },
  quantidade: {
    type: Number,
    required: true,
    min: [1, 'Quantidade mínima é 1']
  },
  precoUnitario: {
    type: Number,
    required: true,
    min: [0, 'Preço não pode ser negativo']
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const VendaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  itens: [ItemVendaSchema],
  valorTotal: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pendente', 'processando', 'enviado', 'entregue', 'cancelado'],
    default: 'pendente'
  },
  formaPagamento: {
    type: String,
    enum: ['cartao', 'boleto', 'pix', 'dinheiro'],
    required: true
  },
  observacoes: String,
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
VendaSchema.pre('save', function(next) {
  this.dataAtualizacao = Date.now();
  next();
});

// Método para calcular o total da venda
VendaSchema.methods.calcularTotal = function() {
  return this.itens.reduce((total, item) => total + item.subtotal, 0);
};

module.exports = mongoose.model('Venda', VendaSchema); 