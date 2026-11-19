/* const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// =======================================================
// DEFINIÃ‡ÃƒO DO MODELO DE POEMA (Garante o registro correto do Schema)
// =======================================================
const PoemaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    conteudo: { type: String, required: true },
    
    // CHAVE ESTRANGEIRA: Aponta para a coleÃ§Ã£o de UsuÃ¡rios
    autor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    feedbacks: [String], // MantÃ©m sua lista de feedbacks dos professores
    dataCriacao: { type: Date, default: Date.now }
});

// Registra ou reaproveita o modelo com a estrutura correta
const Poema = mongoose.models.Poema || mongoose.model('Poema', PoemaSchema);


// Middleware que bloqueia quem nÃ£o estiver logado
function garantirAutenticacao(req, res, next) {
    if (req.session && req.session.usuario) {
        return next(); 
    }
    res.redirect('/'); 
}

// =======================================================
// 2. ROTA PRINCIPAL: Busca os poemas reais resolvendo a chave estrangeira
// =======================================================
router.get('/', garantirAutenticacao, async function(req, res, next) {
    try {
        // O .populate('autor') faz o JOIN automÃ¡tico trazendo nome e tipo do autor
        const poemasDoBancoReal = await Poema.find({}).populate('autor', 'nome tipo');

        res.render('blog', { 
            titulo: 'Blog', 
            usuario: req.session.usuario,
            poemas: poemasDoBancoReal
        }); 
    } catch (err) {
        console.error("Erro ao buscar poemas no MongoDB:", err);
        res.status(500).send("Erro interno ao carregar a pÃ¡gina.");
    }
});

// =======================================================
// 3. ROTA PARA O ALUNO POSTAR UM NOVO POEMA NO BANCO
// =======================================================
router.post('/postar', garantirAutenticacao, async function(req, res) {
    try {
        const { titulo, conteudo } = req.body;
        
        const novoPoema = new Poema({
            titulo: titulo,
            conteudo: conteudo,
            autor: req.session.usuario.id, // Vincula o ID do usuÃ¡rio da sessÃ£o como chave estrangeira
            feedbacks: []
        });

        // Salva permanentemente no MongoDB Atlas
        await novoPoema.save();
        res.redirect('/blog'); 
    } catch (err) {
        console.error("Erro ao salvar poema:", err);
        res.status(500).send("Erro ao publicar o poema.");
    }
});

// =======================================================
// 4. ROTA PARA O PROFESSOR ENVIAR UM FEEDBACK NO BANCO
// =======================================================
router.post('/feedback/:id', garantirAutenticacao, async function(req, res) {
    try {
        const idPoema = req.params.id;
        const { textoFeedback } = req.body;
        const nomeProfessor = req.session.usuario.nome;

        // Formata o texto juntando o nome do professor com a avaliaÃ§Ã£o
        const feedbackFormatado = `${nomeProfessor}: ${textoFeedback}`;

        // Procura pelo ID gerado pelo MongoDB e insere o feedback na lista
        await Poema.findByIdAndUpdate(idPoema, {
            $push: { feedbacks: feedbackFormatado }
        });

        res.redirect('/blog'); 
    } catch (err) {
        console.error("Erro ao salvar feedback:", err);
        res.status(500).send("Erro ao enviar a avaliaÃ§Ã£o.");
    }
});

module.exports = router; */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// =======================================================
// DEFINIÇÃO DO MODELO DE POEMA (Garante o registro correto do Schema)
// =======================================================
const PoemaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    conteudo: { type: String, required: true },
    
    // CHAVE ESTRANGEIRA: Aponta para a coleção de Usuários
    autor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    feedbacks: [String], // Mantém sua lista de feedbacks dos professores
    dataCriacao: { type: Date, default: Date.now }
});

// Registra ou reaproveita o modelo com a estrutura correta
const Poema = mongoose.models.Poema || mongoose.model('Poema', PoemaSchema);


// Middleware que bloqueia quem não estiver logado
function garantirAutenticacao(req, res, next) {
    if (req.session && req.session.usuario) {
        return next(); 
    }
    res.redirect('/'); 
}

// =======================================================
// 2. ROTA PRINCIPAL: Busca os poemas do banco E os clássicos da API
// =======================================================
router.get('/', garantirAutenticacao, async function(req, res, next) {
    let listaFeedExterno = [];

    try {
        // Busca 3 poemas aleatórios da API PoetryDB para a barra lateral
        const respostaApi = await fetch('https://poetrydb.org/random/3');
        
        if (respostaApi.ok) {
            const poemasApi = await respostaApi.json();
            
            // Formata os dados para o padrão que o blog.ejs espera (titulo, autor, conteudo)
            listaFeedExterno = poemasApi.map(p => ({
                titulo: p.title,
                autor: p.author,
                // Pega os primeiros 8 versos e junta com quebras de linha (<br>)
                conteudo: p.lines.slice(0, 8).join('<br>') + (p.lines.length > 8 ? '<br>...' : '')
            }));
        }
    } catch (erroApi) {
        console.error("Aviso: Falha ao carregar poemas da PoetryDB na barra lateral.", erroApi.message);
    }

    try {
        // O .populate('autor') faz o JOIN automático trazendo nome e tipo do autor
        const poemasDoBancoReal = await Poema.find({}).populate('autor', 'nome tipo').sort({ dataCriacao: -1 });

        res.render('blog', { 
            titulo: 'Blog', 
            usuario: req.session.usuario,
            poemas: poemasDoBancoReal,
            feedExterno: listaFeedExterno // Envia os poemas clássicos da API para o EJS
        }); 
    } catch (err) {
        console.error("Erro ao buscar poemas no MongoDB:", err);
        res.status(500).send("Erro interno ao carregar a página.");
    }
});

// =======================================================
// 3. ROTA PARA O ALUNO POSTAR UM NOVO POEMA NO BANCO
// =======================================================
router.post('/postar', garantirAutenticacao, async function(req, res) {
    try {
        const { titulo, conteudo } = req.body;
        
        const novoPoema = new Poema({
            titulo: titulo,
            conteudo: conteudo,
            autor: req.session.usuario.id, // Vincula o ID do usuário da sessão como chave estrangeira
            feedbacks: []
        });

        // Salva permanentemente no MongoDB Atlas
        await novoPoema.save();
        res.redirect('/blog'); 
    } catch (err) {
        console.error("Erro ao salvar poema:", err);
        res.status(500).send("Erro ao publicar o poema.");
    }
});

// =======================================================
// 4. ROTA PARA O PROFESSOR ENVIAR UM FEEDBACK NO BANCO
// =======================================================
router.post('/feedback/:id', garantirAutenticacao, async function(req, res) {
    try {
        const idPoema = req.params.id;
        const { textoFeedback } = req.body;
        const nomeProfessor = req.session.usuario.nome;

        // Formata o texto juntando o nome do professor com a avaliação
        const feedbackFormatado = `${nomeProfessor}: ${textoFeedback}`;

        // Procura pelo ID gerado pelo MongoDB e insere o feedback na lista
        await Poema.findByIdAndUpdate(idPoema, {
            $push: { feedbacks: feedbackFormatado }
        });

        res.redirect('/blog'); 
    } catch (err) {
        console.error("Erro ao salvar feedback:", err);
        res.status(500).send("Erro ao enviar a avaliação.");
    }
});

module.exports = router;