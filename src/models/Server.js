const express = require('express');
const cors = require('cors');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.payments = '/api/payments';

    //Middlewares
    this.middlewares();

    //Rutas
    this.routes();
  }

  middlewares() {
    //Cors
    this.app.use(cors());

    //Lectura y parse del body
    this.app.use(express.json());

    //Carpeta pública
    this.app.use(express.static('public'));
  }

  routes() {
    this.app.use(this.payments, require('../routes/payments'));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }
}

module.exports = { Server };
