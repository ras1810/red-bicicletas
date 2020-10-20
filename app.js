require('dotenv').config();
//***** importaciones de modulos y frameworks *****/
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const passport = require('./config/passport');
const session = require('express-session');
const Usuario = require('./models/usuario');
const Token = require('./models/token');
const jwt = require('jsonwebtoken');
const MongoDBStore = require('connect-mongodb-session')(session);


//*****  creacion de la app *****/
var app = express();
var mongoose = require('mongoose');

//***** importaciones de controller *****/
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var bicicletasRouter = require('./routes/bicicletas');
var bicicletasAPIRouter = require('./routes/api/bicicletas');
var usuariosAPIRouter = require('./routes/api/usuarios');
var usuariosRouter = require('./routes/usuarios');
var tokenRouter = require('./routes/token');
var authApiRouter = require('./routes/api/auth');

let store;
if (process.env.NODE_ENV === 'development'){
  store = new session.MemoryStore;
}else{
  store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'sessions' 
  });
  store.on('error', function(error){
    asssert.ifError(error);
    assert.ok(false);
  });
}

// autenticacion de token
app.set('secretKey', 'jwt_pwd_!!223344');

app.use(session({
  cookie: { maxAge: 240 * 60 * 60 * 1000},
  store: store,
  saveUninitialized: true,
  resave: 'true',
  secret:'red_bicis_!!!***!".!".!".!".!".!".123123'
}));

//***** base de datos mongodb *****/
// si estoy en el ambiente de desarrollo usar mongoDB de manera local
//const mongoDB = 'mongodb://localhost/red_bicicletas';
// si mi proyecto esta en produccion usar mongo Atlas
//const mongoDB = 'mongodb://localhost/mongodb+srv://admin:<password>@cluster0.kdkdt.mongodb.net/<dbname>?retryWrites=true&w=majority';
//const mongoDB = 'mongodb://localhost/mongodb+srv://admin:zh3DkJJFUOywcClo@cluster0.kdkdt.mongodb.net/red-bicicletas?retryWrites=true&w=majority';
/*** aqui usamos dotenv quien automaticamente no conecta la base de datos mongo en desarrollo o produccion */
var mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));
db.once('open', () => {
  console.log("Conectado a "+ mongoDB);
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


// ***** middleware ******/
function loggeIn(req, res, next){
  if (req.user){
    next();
  }else{
    console.log('Usuario no logueado');
    res.redirect('/login');
  }

}

function validarUsuario(req, res, next){
  jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), function(err, decoded){
    if(err){
      res.json({status:"error", message: err.message, data: null});
    }else{
      req.body.userId = decoded.id;
      console.log('jwt verify: ' + decoded);

      next();
    }
  });
}

// ****** mis rutas *****/
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/bicicletas',loggeIn, bicicletasRouter);
app.use('/usuarios', usuariosRouter);
// TOKEN
app.use('/token', tokenRouter);
// API
app.use('/api/auth', authApiRouter);
app.use('/api/bicicletas',validarUsuario, bicicletasAPIRouter);
app.use('/api/usuarios', usuariosAPIRouter);
// privacy policy
app.use('/privacy_policy', function(req, res){
  res.sendFile('public/privacy_policy.html');
});
// GOOGLE AUTH
app.use('/google0ecc3d9a5c194a13', function(req, res){
  res.sendFile('public/google0ecc3d9a5c194a13.html');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/plus.profile.emails.read'
  ]})
);

app.get('/auth/google/callback', passport.authenticate('google', 
  {
  successRedirect: '/',
  failureRedirect: '/error'
  }
));


app.get('/login', function(req, res){
  res.render('session/login');
});

app.post('/login', function(req, res, next){
  // passport
  passport.authenticate('local', function(err, usuario, info){
    if(err) return next(err);
    if(!usuario) return res.render('session/login', {info});
    req.logIn(usuario, function(err){
      if(err) return next(err);

      return res.redirect('/');
    });
  })(req, res, next); // aqui estamos llamando a la funcion despues de inicializarla y le pasamos tres argumentos
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/forgotPassword', function(req, res){
  res.render('session/forgotPassword');
});

app.post('/forgotPassword', function(req, res){
  Usuario.findOne({ email: req.body.email }, function(err, usuario){
    if(!usuario) return res.render('session/forgotPassword', {info: {message: "No existe un usuario con ese email."}});
  });
  Usuario.resetPassword(function(err){
    if(err) return next(err);
    console.log('session/forgotPasswordMessage');
  });

  res.render('session/forgotPasswordMessage');
});

app.get('/resetPassword/:token', function(req, res, next){
  Token.findOne({ token: req.params.token }, function(err, token){
    if(!token) return res.status(400).send({ type: 'not-verified', msg: 'No existe un usuario asociado al token.'});
  });

  Usuario.findById(token._userId, function(err, usuario){
    if(!usuario) return res.status(400).send({msg: 'No existe un usuario asociado al token./Usuario'});
    res.render('session/resetPassword', {errors:{}, usuario: usuario});
  });
});

app.post('/resetPassword', function(req, res){
  if (req.body.password != req.body.confirm_password){
    res.render('session/resetPassword', {errors: {confirm_password: {message: 'No coinciden con el password ingresado'} }, usuario: new Usuario({email: req.body.email})});
    return;
  }
  Usuario.findOne({ email: req.body.email }, function(err, usuario) {
    usuario.password = req.body.password;
    usuario.save(function(err){
      if (err){
        res.render('session/restPassword', {errors: err.errors, usuario: new Usuario({email: req.body.email})});
      }else{
        res.redirect('/login');
      }
    });
  });
});

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
