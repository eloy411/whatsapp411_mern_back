const socketIo = require('socket.io');
const http = require('http');
const express = require('express');
const path = require('path');
const cors = require('cors');
const { connection } = require('./socket.js');
require('./config/dbConnect');

/** CONFIG SOCKET */
const app = express();
app.set('port', process.env.PORT || 8000);
const server = http.createServer(app);

// Configurar opciones de CORS para Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*', // Configura el origen permitido. Reemplaza con tu dominio específico si es necesario.
    methods: ['GET', 'POST'], // Configura los métodos HTTP permitidos.
    allowedHeaders: ['Content-Type', 'Authorization'], // Configura los encabezados permitidos.
  },
});

/** CONFIG */
app.use(cors());
app.use(express.json());

/** ROUTES */

app.use(require('./routes/user.routes'));

connection(io);

server.listen(app.get('port'), () => {
  console.log(`Servidor activo`);
});