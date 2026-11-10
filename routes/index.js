/*


const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 1. CRIANDO A ESTRUTURA DO USUÁRIO NO MONGODB
const UsuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    tipo: { type: String, enum: ['aluno', 'professor'], required: true } // Garante apenas esses dois tipos
});

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);

// ROTA DA PÁGINA DE LOGIN (Rendiza a tela inicial)
router.get('/', (req, res) => {
    res.render('index', { error: null }); // Altere para o nome da sua view de login (ex: 'index' ou 'login')
});

// 2. ROTA DE AUTENTICAÇÃO (Quando clica no botão "Entrar")
router.post('/index', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Busca o usuário no MongoDB real pelo e-mail
        const usuarioEncontrado = await Usuario.findOne({ email: email });

        // Verifica se o usuário existe e se a senha bate
      // Verifica se o usuário existe e se a senha bate
        if (usuarioEncontrado && usuarioEncontrado.senha === senha) {
            
            // Salva os dados dele na sessão do Express
            req.session.usuario = {
                nome: usuarioEncontrado.nome,
                tipo: usuarioEncontrado.tipo,
                email: usuarioEncontrado.email
            };

            // Salva a sessão com segurança e redireciona apenas uma vez
            req.session.save((err) => {
                if (err) {
                    console.error("Erro ao salvar a sessão:", err);
                }
                return res.redirect('/tutorial');
            });

        } else {
            // Se os dados estiverem errados, recarrega a página com erro
            return res.render('index', { error: 'E-mail ou senha incorretos!' });
        }
    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).send("Erro interno no servidor.");
    }
});

// ROTA PARA ABRIR A TELA DE CADASTRO
router.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

// 3. ROTA DE CADASTRO (Para criar novos Alunos/Professores no banco)
router.post('/cadastrar', async (req, res) => {
    const { nome, email, senha, tipo } = req.body;

    try {
        const novoUsuario = new Usuario({ nome, email, senha, tipo });
        await novoUsuario.save(); // Salva o aluno ou professor no MongoDB Atlas
        res.redirect('/'); // Redireciona para a tela de login
    } catch (err) {
        console.error("Erro ao cadastrar:", err);
        res.status(500).send("Erro ao criar conta. O e-mail já pode estar em uso.");
    }
});

// ROTA DE LOGOUT (Sair da conta)
router.get('/sair', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// ROTA TEMPORÁRIA PARA CRIAR SEU PRIMEIRO USUÁRIO
// Acesse no navegador: https://github.dev
router.get('/criar-usuario-teste', async (req, res) => {
    try {
        // Criando um usuário aluno de teste direto no banco
        const novoUsuario = new Usuario({
            nome: "Cristiano Aluno",
            email: "teste@email.com",
            senha: "123",
            tipo: "aluno"
        });

        await novoUsuario.save();
        res.send("✅ Usuário de teste criado com sucesso! E-mail: teste@email.com | Senha: 123. Agora volte para a página inicial e faça o login.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao criar usuário ou ele já existe.");
    }
});

module.exports = router;
*/




const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// ==========================================
// 1. MODELO DO USUÁRIO (Professor ou Aluno)
// ==========================================
const UsuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    tipo: { type: String, enum: ['aluno', 'professor'], required: true }
});

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);

// ==========================================
// 2. MODELO DO POEMA (Com a "Chave Estrangeira")
// ==========================================
const PoemaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    conteudo: { type: String, required: true },
    
    // CHAVE ESTRANGEIRA: Guarda o ID do Usuário do MongoDB que escreveu o poema
    autor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', // Deve ter exatamente o mesmo nome do model de usuários
        required: true 
    },
    dataCriacao: { type: Date, default: Date.now }
});

const Poema = mongoose.models.Poema || mongoose.model('Poema', PoemaSchema);

/*
// ROTA DA PÁGINA DE LOGIN (Renderiza a tela inicial)
router.get('/', (req, res) => {
    res.render('index', { erro: null }); 
});
*/

// ROTA DA PÁGINA DE LOGIN (Atualizada com a API de Frases)
router.get('/', async (req, res) => {
    let fraseInspiradora = "A poesia é a música da alma.";

    try {
        // Busca uma frase aleatória da mesma API usada no blog
        const respostaFrase = await fetch('https://adviceslip.com');
        if (respostaFrase.ok) {
            const dadosFrase = await JSON.parse(await respostaFrase.text());
            fraseInspiradora = dadosFrase.slip.advice; 
        }
    } catch (erroApi) {
        console.error("Aviso: Falha ao buscar frase para o login, usando padrão.", erroApi.message);
    }

    // Passa a frase para o arquivo index.ejs
    res.render('index', { erro: null, fraseDia: fraseInspiradora }); 
});


// 2. ROTA DE AUTENTICAÇÃO (CORRIGIDA: Ajustado de '/index' para '/' para alinhar com o formulário)
router.post('/', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Busca o usuário no MongoDB real pelo e-mail
        const usuarioEncontrado = await Usuario.findOne({ email: email });

        // Verifica se o usuário existe e se a senha bate
        if (usuarioEncontrado && usuarioEncontrado.senha === senha) {
            
            // Salva os dados dele na sessão do Express
            req.session.usuario = {
                id: usuarioEncontrado._id,
                nome: usuarioEncontrado.nome,
                tipo: usuarioEncontrado.tipo,
                email: usuarioEncontrado.email
            };

            // Salva a sessão com segurança e redireciona apenas uma vez
            req.session.save((err) => {
                if (err) {
                    console.error("Erro ao salvar a sessão:", err);
                }
                return res.redirect('/tutorial');
            });

        } else {
            // CORREÇÃO: Variável padronizada para 'erro' para não quebrar o EJS
            return res.render('index', { erro: 'E-mail ou senha incorretos!' });
        }
    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).send("Erro interno no servidor. Verifique a conexão com o banco de dados.");
    }
});

// ROTA PARA ABRIR A TELA DE CADASTRO
router.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

// 3. ROTA DE CADASTRO
router.post('/cadastrar', async (req, res) => {
    const { nome, email, senha, tipo } = req.body;

    try {
        const novoUsuario = new Usuario({ nome, email, senha, tipo });
        await novoUsuario.save(); 
        res.redirect('/'); 
    } catch (err) {
        console.error("Erro ao cadastrar:", err);
        res.status(500).send("Erro ao criar conta. O e-mail já pode estar em uso.");
    }
});

// ROTA DE LOGOUT (Sair da conta)
router.get('/sair', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// ROTA TEMPORÁRIA PARA CRIAR SEU PRIMEIRO USUÁRIO
router.get('/criar-usuario-teste', async (req, res) => {
    try {
        const novoUsuario = new Usuario({
            nome: "Cristiano Aluno",
            email: "teste@email.com",
            senha: "123",
            tipo: "aluno"
        });

        await novoUsuario.save();
        res.send("✅ Usuário de teste criado com sucesso! E-mail: teste@email.com | Senha: 123. Agora volte para a página inicial e faça o login.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao criar usuário ou ele já existe.");
    }
});

module.exports = router;
