var mongoose = require('mongoose');
var Reserva = require('./reserva');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt'); // modulo para encriptar npm install bcrypt --savea
const crypto = require('crypto');
const Token = require('../models/token')
const mailer = require('../mailer/mailer');

const saltRounds = 10; // salt hace un salto para la encriptacion como un random 10
var Schema = mongoose.Schema;

const validateEmail = function(email){
    // patron regex
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3,4})+$/;
    // retorna true si se cumple el patron ade arriba
    return re.test(email);
}

var usuarioSchema = new Schema({
    nombre: {
        type: String,
        trim: true, // esto borra los espacios vacios
        required: [true, 'El nombre es obligatorio.'], // es requerido
    },
    email:{
        type: String,
        trim: true, // esto borra los espacios vacios
        required: [true, 'El email es obligatorio.'], // es requerido
        lowercase: true, // convierte el string a minusculas
        // solo validas del lado del cliente
        unique: true, // npm install mongoose-unique-validator --save
        //validate: [validateEmail, 'Por favor, ingrese un email valido.'],
       // match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3,4})+$/] // mongoDB valida  
    },
    password: {
        type: String,
        required: [true, 'El password es obligatorio.']
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    verificado: {
        type: Boolean,
        default: true
    },
    googleId: String,
    facebookId: String
});


// agregamos el plugin unique a mongoose
usuarioSchema.plugin(uniqueValidator, {message: 'El {path} ya existe con otro usuario.'});

// funcion pre - antes del save-> evento quiero que ejecutes lo sig
usuarioSchema.pre('save', function(next) {
    //encryptar password
    if(this.isModified('password')){
        this.password = bcrypt.hashSync(this.password, saltRounds);
    }
    next();
});

usuarioSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
}

usuarioSchema.methods.reservar =  function(biciId, desde, hasta, cb){
    var reserva = new Reserva({usuario: this._id, bicicleta: biciId, desde: desde, hasta: hasta});
    console.log(reserva);
    reserva.save(cb);
};

usuarioSchema.methods.enviar_email_bienvenida = function(cb){
    const token = new Token({_userId: this.id, token: crypto.randomBytes(16).toString('hex')});
    const email_destination = this.email;
    token.save(function(err) {
        if(err) 
            { return console.log(err.message); };

        const mailOptions = {
            from: 'no-reply@redBicicletas.com',
            to: email_destination,
            subject: 'Verificacion de cuenta',
            text: 'Hola, \n\n'+ 'Por favor, para verificar su cuenta haga click en el siguiente enlace.\n' + 'http://localhost:5000' + '\/token/confirmation\/' + token.token + '.\n'
        }
        console.log('antes de mailer');

        mailer.sendMail(mailOptions, function(err){
            if(err) { return err.message; }

            console.log('Se ha enviado un email de confirmacion a: ' + email_destination + '.');
        });
        // verify connection configuration
        mailer.verify(function(error, success) {
            if (error) {
            console.log(error);
            } else {
            console.log("Server is ready to take our messages");
            }
        });
        console.log('despues de mailer');

    });
}

usuarioSchema.methods.resetPassword = function(cb){
    const token = new Token({_userId: this.id, token: crypto.randomBytes(16).toString('hex')});
    const email_destination = this.email;
    token.save(function(err){
        if(err) { return cd(err); }

        const mailOptions = {

            from: 'no-reply@redBicicletas.com',
            to: email_destination,
            subject: 'Reseteo de password de cuenta',
            text: 'Hola, \n\n'+ 'Por favor, para resetear el password de su cuenta haga click en el siguiente enlace.\n' + 'http://localhost:5000' + '\/token/confirmation\/' + token.token + '.\n'
        }
        mailer.sendMail(mailOptions, function(err){
            if(err) { return cb(err); }

            console.log('Se envio un email para resetear el password');
        });
        cb(null);
    });
}

usuarioSchema.statics.findOneOrCreateByGoogle = function findOneCreate(condition, callback){
    const self = this;
    console.log(condition);
    self.findOne({
        $or: [
            {'googleId': condition.id}, {'email': condition.emails[0].value}
        ]}, (err, result) => {
            if (result) {
                callback(err, result);
            }else{
                console.log('------------- CONDITION -----------');
                console.log(condition);
                let values = {};
                values.googleId = condition.id;
                values.email = condition.email[0].value;
                values.nombre = condition.displayName || 'SIN NOMBRE';
                values.verificado = true;
                values.password = condition._json.etag;
                console.log('------------- VALUES ----------------');
                console.log(values);
                self.create(values, (err, result) => {
                    if (err) {console.log(err);}
                    return callback(err, result)
                });
            }
        });
}

usuarioSchema.statics.findOneOrCreateByFacebook = function findOneCreate(condition, callback){
    const self = this;
    console.log(condition);
    self.findOne({
        $or: [
            {'facebookId': condition.id}, {'email': condition.emails[0].value}
        ]}, (err, result) => {
            if (result) {
                callback(err, result);
            }else{
                console.log('------------- CONDITION -----------');
                console.log(condition);
                let values = {};
                values.facebookId = condition.id;
                values.email = condition.email[0].value;
                values.nombre = condition.displayName || 'SIN NOMBRE';
                values.verificado = true;
                values.password = crypto.randomBytes(16).toString('hex');
                console.log('------------- VALUES ----------------');
                console.log(values);
                self.create(values, (err, result) => {
                    if (err) {console.log(err);}
                    return callback(err, result)
                });
            }
        });
}

module.exports = mongoose.model('Usuario',usuarioSchema);





















