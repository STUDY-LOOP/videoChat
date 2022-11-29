import http from 'http';
import SocketIO from 'socket.io';
import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on('connection', (socket) => {
  socket['nickname'] = 'Anonymous';
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on('enter_room', (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit('welcome', socket.nickname);
  });
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit('bye', socket.nickname)
    );
  });
  socket.on('new_message', (msg, room, done) => {
    socket.to(room).emit('new_message', `${socket.nickname}: ${msg}`);
    done(); //triggers function located at frontend
  });
  socket.on('nickname', (nickname) => (socket['nickname'] = nickname));
  socket.on('new_notice', (msg, room, done) => {
    socket.to(room).emit('new_notice', `NOTICE: ${msg}`);
    done();
  });
});

/*
const wss = new WebSocket.Server({ server }); 
const wss = new WebSocket.Server({ server });
//listen for connection events that happen on specific sockets. not the server
wss.on('connection', (socket) => {
  sockets.push(socket);
  socket['nickname'] = 'anonymous';
  console.log('Connected to Browser ✅');
  socket.on('close', () => console.log('Disconnected from Browser ❌'));
  socket.on('message', (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case 'new_message':
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
      case 'nickname':
        socket['nickname'] = message.payload;
    }
  });
}); */
const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
