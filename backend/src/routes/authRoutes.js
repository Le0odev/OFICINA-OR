const express = require('express');
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');

const router = express.Router();

// Rota para registrar um novo usuário
router.post('/registrar', authController.registrar);

// Rota para login
router.post('/login', authController.login);

// Rota para obter perfil (protegida)
router.get('/perfil', verificarToken, authController.perfil);

module.exports = router; 