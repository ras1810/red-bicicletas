const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const bicicletaSchema = new Schema({

    code: Number,
    color: String,
    modelo: String,
    ubicacion: {
        type: [Number], index: { type: '2dsphere', sparse: true  }
    }, 

});


// creamos los metodos que usaremos con nuestra base de datos
// createInstance
bicicletaSchema.statics.createInstance = function(code, color, modelo, ubicacion){
    return new this({
        code: code,
        color: color,
        modelo: modelo,
        ubicacion: ubicacion
    });
};
// toString
bicicletaSchema.methods.toString = function() {
    return 'code: '+ this.code + ' | color: ' + this.color;
};
// allBicis
bicicletaSchema.statics.allBicis = function(cb){
    return this.find({}, cb);
};
// add
bicicletaSchema.statics.add = function(aBicis, callback){
    this.create(aBicis, callback); 
};
// findByCode
bicicletaSchema.statics.findByCode = function(aCode, cb){
    return this.findOne({code: aCode}, cb);
};
// removeByCode
bicicletaSchema.statics.removeByCode = function(aCode, cb){
    return this.deleteOne({code: aCode}, cb);
};

// exportamos el modelo de base de datos
module.exports = mongoose.model('Bicicleta', bicicletaSchema);