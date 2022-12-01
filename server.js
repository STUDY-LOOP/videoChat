const express = require('express');
const { ExpressPeerServer } = require('peer');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const mysql = require('mysql');

const connectDB = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'rootpw',
  database: 'chatdb',
});
connectDB.connect();

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

let studyRoomId;
let Nickname;

var dateTime = new Date();
//console.log(dateTime);
var year = dateTime.getFullYear();
var month = dateTime.getMonth() + 1;
var day = dateTime.getDate();
var time = `${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds()}`;
//console.log(`year: ${year}, month: ${month}, day: ${day}, time: ${time}`);
var formattedDateTime = `${year}-${month}-${day} ${time}`;
//console.log(formattedDateTime);

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false })); // body-parser
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  res.render('studyList');
});
app.post('/studyHome', (req, res) => {
  studyRoomId = req.body.StudyName;
  Nickname = req.body.Nickname;
  res.render('studyHome', { roomID: studyRoomId, nickname: Nickname });
});
app.post('/videoChat', (req, res) => {
  studyRoomId = req.body.StudyName;
  Nickname = req.body.Nickname;
  res.render('videoChat', { roomID: studyRoomId, nickname: Nickname });
});

io.on('connection', (socket) => {
  //msg chat
  socket['nickname'] = 'Anonymous';
  // socket.onAny((event) => {
  //     console.log(`Socket Event: ${event}`);
  // });
  socket.on('enter_chat_room', (chatRoomName, done) => {
    socket.join(chatRoomName);
    done();
    //socket.to(roomName).emit('welcome', socket.nickname);
  });
  // socket.on('disconnecting', () => {
  //     socket.rooms.forEach((room) =>
  //     socket.to(room).emit('bye', socket.nickname)
  //     );
  // });
  socket.on('new_message', (msg, room, done) => {
    connectDB.query(
      `INSERT INTO chat (room_id, u_id, notice, content, datetime) VALUES (${studyRoomId}, '${Nickname}', 0, '${msg}', '${formattedDateTime}')`
    );
    socket.to(room).emit('new_message', `${socket.nickname}: ${msg}`);
    done(); //triggers function located at frontend
  });
  socket.on('nickname', (nickname) => (socket['nickname'] = nickname));
  socket.on('new_notice', (msg, room, done) => {
    socket.to(room).emit('new_notice', `NOTICE: ${msg}`);
    done();
  });

  //video chat
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    // version A
    socket.to(roomId).emit('user-connected', userId);

    /*
        // version B
        socket.on('connection-request',(roomId, userId) => {
            socket.to(roomId).emit("new-user-connected", userId);
        });
        */

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });
});
const handleListen = () => console.log(`Listening on http://localhost:3000`);
server.listen(process.env.PORT || 3000, handleListen);
