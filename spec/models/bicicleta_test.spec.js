var mongoose = require('mongoose');
var Bicicleta = require('../../models/bicicleta');

describe('Testing Bicicleta', () => {
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

  describe('Bicicleta.createInstance', () => {
    it('crea instancia de bicicleta', () => {
      var bici = Bicicleta.createInstance(1, 'verde', 'urbana', [-34.5, -54.1]);

      expect(bici.code).toBe(1);
      expect(bici.color).toBe('verde');
      expect(bici.modelo).toBe('urbana');
      expect(bici.ubicacion[0]).toEqual(-34.5);
      expect(bici.ubicacion[1]).toEqual(-54.1);
    });
  });

  describe('Bicicleta.allBicis', () => {
    it('comienza vacia', done => {
      Bicicleta.allBicis((err, bicis) => {
        expect(bicis.length).toBe(0);
        done();
      })
    });
  });

  describe('Bicicleta.add', () => {
    it('agrega solo una bici', done => {
      var a = new Bicicleta({ code: 1, color: "rojo", modelo: "urbana" });

      Bicicleta.add(a, (err, newBici) => {
        if (err) console.log(err);
        Bicicleta.allBicis((err, bicis) => {
          expect(bicis.length).toEqual(1);
          expect(bicis[0].code).toEqual(a.code);
          done();
        });
      });
    });
  });

  describe('Bicicleta.findByCode', () => {
    it('debe devolver bici con code 1', done => {
      Bicicleta.allBicis((err, bicis) => {
        expect(bicis.length).toBe(0);

        var a = new Bicicleta({ code: 1, color: "verde", modelo: "urbana" });
        Bicicleta.add(a, (err, newBici) => {
          if (err) console.log(err);

          var b = new Bicicleta({ code: 2, color: "rojo", modelo: "urbana" });
          Bicicleta.add(b, (err2, newBici2) => {
            if (err2) console.log(err2);

            Bicicleta.findByCode(a.code, (error, targetBici) => {
              expect(targetBici.code).toBe(a.code);
              expect(targetBici.color).toBe(a.color);
              expect(targetBici.modelo).toBe(a.modelo);

              done();
            })

          })
        })

      });
    });
  });
})

