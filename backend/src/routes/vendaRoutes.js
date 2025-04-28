const express = require('express');
const vendaController = require('../controllers/vendaController');
const { verificarToken, verificarCargo } = require('../middlewares/auth');

const router = express.Router();

// Middleware para proteger todas as rotas
router.use(verificarToken);

// Rotas para criação e listagem de vendas
router.post('/', verificarCargo('admin', 'vendedor'), vendaController.criar);
router.get('/', verificarCargo('admin', 'vendedor'), vendaController.listar);
router.get('/analise', verificarCargo('admin', 'vendedor'), vendaController.analisarPeriodo);
router.get('/:id', verificarCargo('admin', 'vendedor'), vendaController.obterPorId);
router.put('/:id/status', verificarCargo('admin', 'vendedor'), vendaController.atualizarStatus);
router.put('/:id/cancelar', verificarCargo('admin', 'vendedor'), vendaController.cancelar);

module.exports = router; 