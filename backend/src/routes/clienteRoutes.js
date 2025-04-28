const express = require('express');
const clienteController = require('../controllers/clienteController');
const { verificarToken, verificarCargo } = require('../middlewares/auth');

const router = express.Router();

// Middleware para proteger todas as rotas
router.use(verificarToken);

// Rotas para administradores e vendedores
router.post('/', verificarCargo('admin', 'vendedor'), clienteController.criar);
router.get('/', verificarCargo('admin', 'vendedor'), clienteController.listar);
router.get('/:id', verificarCargo('admin', 'vendedor'), clienteController.obterPorId);
router.put('/:id', verificarCargo('admin', 'vendedor'), clienteController.atualizar);
router.delete('/:id', verificarCargo('admin'), clienteController.remover);

module.exports = router; 