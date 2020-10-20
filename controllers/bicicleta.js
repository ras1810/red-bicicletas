// guardamos un objeto Bicicleta importado de la carpeta models
let Bicicleta = require('../models/bicicleta');

// creamos una funcion de renderizado 
exports.bicicleta_list = function(req, res){
    // enviamos el renderizado la plantilla index de la carpeta view - bicicletas
    res.render('bicicletas/index', { bicis : Bicicleta.allBicis } );
    // enviamos un arreglo de todas las bicicletas
}

// GET 
exports.bicicleta_create_get = function(req, res){
    res.render('bicicletas/create')
}

// POST Enviar bici nueva
exports.bicicleta_create_post = function(req, res){
    var bici = new Bicicleta(req.body.id, req.body.color, req.body.modelo);
    bici.ubicacion = [req.body.lat, req.body.lng];
    Bicicleta.add(bici)

    res.redirect('/bicicletas');
    
}

// GET UPDATE
exports.bicicleta_update_get = function(req, res){
    var bici = Bicicleta.findById(req.params.id);

    res.render('bicicletas/update', {bici});
}

// POST Enviar bici nueva
exports.bicicleta_update_post = function(req, res){
    var bici = Bicicleta.findById(req.params.id);
    bici.id = req.body.id;
    bici.color = req.body.color;
    bici.modelo = req.body.modelo;
    bici.ubicacion = [req.body.lat, req.body.lng];

    res.redirect('/bicicletas');
    
}

// Eliminar bici
exports.bicicleta_delete_post = function(req, res){
    
    Bicicleta.removeById(req.body.id);
    res.redirect('/bicicletas');
}