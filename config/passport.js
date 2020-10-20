const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuario = require('../models/usuario');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');

passport.use(new LocalStrategy(
    function(email, password, done){
        Usuario.findOne({email: email}, function(err, usuario){
            if(err) return done(err);
            if(!usuario) return done(null, false, {message: 'No existe una cuenta con esa Email'});
            if(!usuario.validPassword(password)) return done(null, false, {message: 'Password incorrecto.'});
            
            return done(null, usuario);
        });
    }
));

passport.use(new FacebookTokenStrategy({
    clientID: process.env.FACEBOOK_ID,
    clienteSecret: process.env.FAECEBOOK_SECRET,
},
    function(accessToken, refreshToken, profile, done){
        try{
            Usuario.findOneOrCreateByFacebook(profile, function(err, user){
                if (err) console.log('err' + err);
                return done(err, user);
            });
        }catch{
            console.log(err2);
            return done(err2, null());
        }      
    }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clienteSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.HOST + "/auth/google/callback"
},
    function(accessToken, refreshToken, profile,cb){
        console.log(profile);

        Usuario.findOneOrCreateByGoogle(profile, function(err, user){
            return cb(err, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  

  passport.deserializeUser(function(id ,done){
    Usuario.findById(id, function(err, usuario){
        cb(err, usuario);
    });
});
/***
 * passport.deserializeUser(function(user, done) {
    done(null, user);
  });
});**/

module.exports = passport;