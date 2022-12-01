const express = require('express');
const { ExpressPeerServer } = require('peer');
const app = express();

const server = require("http").Server(app);
const io = require("socket.io")(server);
const session = require("express-session");
const MemoryStore = require('memorystore')(session);
const { v4: uuidV4 } = require("uuid");

const peerServer = ExpressPeerServer(server, {
    debug: true
}); 


let studyRoomId;
let Nickname;

/****** Database ******/

const mysql = require("mysql");
const { connect } = require("http2");
const connectDB = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: "rootpw",
    database: "team12"
});
connectDB.connect();

var dateTime = new Date();
var year = dateTime.getFullYear();
var month = dateTime.getMonth() + 1;
var day = dateTime.getDate();
var time = `${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds()}`;
var formattedDateTime = `${year}-${month}-${day} ${time}`;


/****** view, server setting ******/

app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(express.urlencoded({ extended: false }));      // body-parser
app.use('/peerjs', peerServer);

app.use(session({
    secret: "cse",	// 원하는 문자 입력
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore(),
}));


/****** Rendering ******/

app.get("/", (req, res) => {
    res.render("main");
});   

app.post("/", (req, res) => {
    res.render("main");
});
app.post('/signup', function(req, res) {
    res.render("signup");
});
app.post('/signup_process', function(req, res) {
    let input_id = req.body.input_id;
    let input_pw = req.body.input_pw;

    connectDB.query('SELECT * FROM user WHERE u_id = ?', [input_id], function(error, results, fields) {
        if (error) console.log(error);
        if (results.length == 0) {
            connectDB.query('INSERT INTO `user`(u_id, password) VALUES (?, ?)', [input_id, input_pw], (error, results, fields) => {
                if (error) console.log(error);
                else {
                    console.log("회원가입성공");
                    res.render("main");
                }
                res.end();
            });
        } else {
            res.send('<script type="text/javascript">alert("이미 존재하는 아이디입니다."); document.location.replace("/signup");</script>');
            res.end();
        }
    })
});
app.post('/login', function(req, res) {
    let username = req.body.input_id;
    let password = req.body.input_pw;

    if (username && password) {
        connectDB.query('SELECT * FROM user WHERE u_id = ? AND password = ?', [username, password], function(error, results, fields) {
            console.log(username, password)
            if (error) throw error;
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                res.render("studyList");
                res.end();
            } else {
                res.send('<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); document.location.href="/";</script>');
            }            
        });
    } else {        
        res.send('<script type="text/javascript">alert("username과 password를 입력하세요!"); document.location.href="/";</script>');    
        res.end();
    }
});

app.get("/studyList", (req, res) => {
    res.render("studyList");
});
app.post("/studyHome", (req, res) => {
    studyRoomId = req.body.StudyName;
    //Nickname = req.body.Nickname;
    Nickname = req.session.username;
    res.render("studyHome", { roomID: studyRoomId, nickname: Nickname });

});
app.post('/videoChat', (req, res) => {
  studyRoomId = req.body.StudyName;
  Nickname = req.body.Nickname;
  res.render('videoChat', { roomID: studyRoomId, nickname: Nickname });
});



/****** Chat, Video ******/

io.on("connection", socket => {    
    //msg chat
    socket['nickname'] = 'Anonymous';
    socket.on('enter_chat_room', (chatRoomName, done) => {
        socket.join(chatRoomName);
        done();
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
    
    //video chat
    socket.on("join-room", (roomId, userId) => {

        socket.join(roomId);


        socket.on('connection-request',(roomId, userId, nickname) => {
            socket.to(roomId).emit("new-user-connected", userId, nickname);
        });

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    })
});
const handleListen = () => console.log(`Listening on http://localhost:3000`);
server.listen(process.env.PORT || 3000, handleListen);
