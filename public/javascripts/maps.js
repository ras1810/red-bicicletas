var mymap = L.map('mapid').setView([-28.470326, -65.787779], 13);

// demos pasarle los estilos o nuestro mapa no se va mostrar
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

// AQUI VAMOS HACER LAS PETICIONES A LA API EN FORMATO EN JSON
// NO UTILIZAMOS LOS ATRIBUTOS DE LOS OBJETOS DE ALLBICIS SINO QUE UTILIZAMOS LOS DATOS JSON DE LA API api/bicicletas
$.ajax({
    
    dataType: "json",
    url: "api/bicicletas",
    success: function(resultado){
        console.log(resultado);
        resultado.bicicletas.forEach(bici => {
            L.marker(bici.ubicacion, {title: bici.id}).addTo(mymap);
        });
    },
})