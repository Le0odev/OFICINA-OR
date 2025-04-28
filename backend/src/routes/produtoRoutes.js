const express = require('express');
const produtoController = require('../controllers/produtoController');
const { verificarToken, verificarCargo } = require('../middlewares/auth');

const router = express.Router();

// Rotas públicas
router.get('/', produtoController.listar);
router.get('/:id', produtoController.obterPorId);

// Rotas protegidas
router.post('/', verificarToken, verificarCargo('admin', 'vendedor'), produtoController.criar);
router.put('/:id', verificarToken, verificarCargo('admin', 'vendedor'), produtoController.atualizar);
router.delete('/:id', verificarToken, verificarCargo('admin'), produtoController.remover);

module.exports = router; 