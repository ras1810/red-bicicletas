var mongoose = require('mongoose');
var Bicicleta = require('../../models/bicicleta');
var Usuario = require('../../models/usuario');
var Reserva = require('../../models/reserva');

describe('Testing Usuarios',()=>{
    beforeAll((done) => { mongoose.connection.close(done) });

    beforeEach((done)=>{
        var mongoDB ='mongodb://localhost/testdb';        
        const db = mongoose.connection;
        mongoose.connect(mongoDB,{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}); 
        db.on('error',console.error.bind(console,'MongoDB connection error: '));
        db.once('open',()=>{
            console.log('We are connected to test database');            
            done();
        }); 

    });
    
    afterEach((done)=>{
        Reserva.deleteMany({}, (err,success)=>{
            if (err) console.log(err);
            Usuario.deleteMany({},(err,success)=>{
                if (err) console.log(err);      
                mongoose.connection.close(done);
            });
        });
    });
    
    
    describe('Cuando un usuario reserva una bici',()=>{
        it('debe existir la reserva',(done) =>{
            const usuario = new Usuario({nombre: 'Ali'});
            usuario.save();
            const bicicleta = new Bicicleta({code: 1, color: "verde", modelo: "montañera"});
            bicicleta.save();
            var hoy = new Date();
            var mañana = new Date();
            mañana.setDate(hoy.getDate() + 1);
            usuario.reservar(bicicleta.id, hoy, mañana, (err,reserva)=>{
                Reserva.find({}).populate('bicicleta').populate('usuario').exec((err,reservas)=>{                    
                    expect(reservas.length).toBe(1);
                    expect(reservas[0].diasDeReserva()).toBe(2);
                    expect(reservas[0].bicicleta.code).toBe(1);
                    expect(reservas[0].usuario.nombre).toBe(usuario.nombre);
                    done();
                });
            });
        });
    });
});