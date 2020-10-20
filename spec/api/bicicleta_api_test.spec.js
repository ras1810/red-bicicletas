var mongoose = require('mongoose');
var request = require('request');
var server = require('../../bin/www')
var Bicicleta = require('../../models/bicicleta');

const baseUrl = 'http://localhost:3000/api/bicicletas';

const aBici = {
  id: 10,
  color: "rojo",
  modelo: "urbana",
  latitud: -34,
  longitud: -54
};

const headers = { 'content-type': 'application/json' };

describe('Bicicleta API', () => {
  beforeAll(done => {
    var mongoDB = 'mongodb://localhost/testdb';
    mongoose.connect(mongoDB, { useNewUrlParser: true })
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB Connection Error: '));
    db.once('open', () => {
      console.log("Connected to test db");
      done();
    })
  });

  afterEach(done => {
    Bicicleta.deleteMany({}, (err, success) => {
      if (err) console.log(err);
      done();
    })
  });

  describe('GET BICICLETAS /', () => {
    it('Status 200', done => {
      request.get(baseUrl, function (err, res, body) {
        var result = JSON.parse(body);
        expect(res.statusCode).toBe(200);
        expect(result.bicicletas.length).toBe(0);
        done();
      })
    })
  });

  describe('POST BICICLETAS /create', () => {
    it('Status 200', done => {
      request.post({
        headers,
        body: JSON.stringify(aBici),
        url: `${baseUrl}/create`
      }, function (err, res, body) {
        expect(res.statusCode).toBe(200);
        var bici = JSON.parse(body).bicicleta;
        console.log(bici);
        expect(bici.color).toBe(aBici.color);
        expect(bici.ubicacion[0]).toBe(aBici.latitud);
        expect(bici.ubicacion[1]).toBe(aBici.longitud);
        done();
      });
    })
  });

  describe('POST BICICLETAS /create', () => {
    it('Status 200', done => {
      Bicicleta.add(aBici, function () {
        request.delete({
          headers,
          body: JSON.stringify({ id: aBici.id }),
          url: `${baseUrl}/delete`
        }, function (err, res, body) {
          expect(res.statusCode).toBe(204);
          Bicicleta.findByCode(aBici.id, (err, target) => {
            expect(!target).toBe(true);
            done();
          })
        });
      });
    })
  });
});