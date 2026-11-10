var createError = require('http-errors');
var express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session'); 
// Conexão com o MongoDB Atlas
const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://Cristiano:1977senha@cluster0.zpojfeq.mongodb.net/';
/*
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Conectado com sucesso ao MongoDB Atlas!'))
  .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));
*/

// Substitua o bloco do mongoose.connect pelo código abaixo:
mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000, // Desiste de esperar se não conectar em 5 segundos
})
.then(() => console.log('✅ Conectado com sucesso ao MongoDB Atlas!'))
.catch(err => {
  console.error('❌ Erro crítico ao conectar ao MongoDB Atlas:');
  console.error('Verifique o seu IP no Network Access do Atlas ou a senha na string de conexão.');//err.message
});

// Desativa globalmente a fila de espera para que os comandos falhem rápido se não houver rede
mongoose.set('bufferCommands', false);



var blogRouter = require('./routes/blog');
var tutorialRouter = require('./routes/tutorial');
var indexRouter = require('./routes/index');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Permite que o Express entenda os dados enviados pelos formulários (POST)
app.use(express.urlencoded({ extended: true }));

// Configuração da Sessão (obrigatório para o login funcionar)
app.use(session({
  secret: 'sua-chave-secreta',
  resave: false,
  saveUninitialized: true,
  cookie:{
    secure: false,
    samesite: 'lax'
  }
}));

app.use('/', indexRouter);       
app.use('/tutorial', tutorialRouter); 
app.use('/blog', blogRouter);
    

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;