const express = require('express');
const router = express.Router();

// Middleware que bloqueia quem não estiver logado
function garantirAutenticacao(req, res, next) {
    if (req.session && req.session.usuario) {
        return next(); 
    }
    res.redirect('/'); 
}

// Rota protegida do tutorial
router.get('/', garantirAutenticacao, function(req, res, next) {
    res.render('tutorial', { 
        titulo: 'Tutorial', 
        usuario: req.session.usuario // Opcional: passa os dados para a página
    }); 
});

module.exports = router;