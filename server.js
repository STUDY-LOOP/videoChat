const express = require("express");
const app = express();
const session = require('express-session');
const fileStore = require('session-file-store')(session);
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
  });
const { v4: uuidV4 } = require("uuid");

let studyRoomId;
let Nickname;

app.use('/peerjs', peerServer);

app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(express.urlencoded({extended:false}));      // body-parser

/*
//express-session 세션 - 두 사용자가 한 방에 안 들어오는 문제
app.use(
    session({
        secure: true, 
        secret: 'keyboard cat',
        //secret: process.env.COOKIE_SECRET, //암호화
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            secure: true,
        },
        store: new fileStore() //세션 스토어 적용
    })
);
*/

/*
app.get("/", (req, res) => {
    console.log(req.session);

    if(!req.session.num){
        req.session.num = 1;
    } else {
        req.session.num = req.session.num + 1;
    }
    res.render("studyHome");
});
*/

app.get("/", (req, res) => {
    res.render("studyHome");
});

app.post("/videoChat", (req, res) => {
    console.log("roomId: " + req.body.StudyName); 
    //console.log("userId: " + req.body.userId);
    console.log("nickname: " + req.body.Nickname);
    studyRoomId = req.body.StudyName;
    Nickname = req.body.Nickname;
    res.render("videoChat", {roomId: studyRoomId, nickname: Nickname});   
});

io.on("connection", socket => {

    socket.on("join-room", (roomId, userId) => {  
        //console.log("userId: "+ userId);
        socket.join(roomId);

        socket.on('connection-request',(roomId, userId, nickname) => {
            socket.to(roomId).emit("new-user-connected", userId, nickname);
        });

        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", userId);
        });
    })
});

server.listen(process.env.PORT||3000);