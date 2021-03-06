'use strict';

const net = require('net');
const EE = require('events');
const Client = require('./model/client.js');
// const PORT = process.env.PORT || 3000;

// Random Port;
const PORT = process.env.PORT || 8000;

const server = net.createServer();
const ee = new EE();

const pool = [];

ee.on('@all', function(client, string) {
  pool.forEach(c => {
    c.socket.write(`${client.nickname}: ` + string)
  });
});

ee.on('@dm', function(client, string) {
  let nickname = string.split(' ').shift().trim();
  let message = string.split(' ').slice(1).join(' ').trim();

  pool.forEach(c => {
    console.log('client:', c.nickname);
    console.log('nickname:', nickname);

    if (c.nickname === nickname) {
      c.socket.write(`${client.nickname}: ${message}`);
    }
  });
});

ee.on('@newname', function(client, string) {
  let newName = string.split(' ').shift().trim();
  client.nickname = newName;
});

ee.on('@close', function(client) {
  client.socket.destroy();
});

ee.on('default', function(client, string) {
  client.socket.write('not a command \n');
});

server.on('connection', function(socket) {
  var client = new Client(socket);
  pool.push(client);
  // console.log(client);
  socket.on('data', function(data) {
    const command = data.toString().split(' ').shift().trim(' ');
    console.log('command:', command);

    if (command.startsWith('@')) {
        ee.emit(command, client, data.toString().split(' ').slice(1).join(' '));
        return;
    }

    ee.emit('default', client, data.toString());

  });
});

server.listen(PORT, function() {
  console.log('server up:', PORT);
})
