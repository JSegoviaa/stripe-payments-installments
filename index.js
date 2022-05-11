require('dotenv').config();
const { Server } = require('./src/models/Server');

const server = new Server();

server.listen();
