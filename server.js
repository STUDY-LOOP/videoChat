const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

let studyRoomId;
let Nickname;

app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(express.urlencoded({extended:false}));      // body-parser

app.get("/", (req, res) => {
    res.render("studyHome");
});
app.post("/videoChat", (req, res) => {
    studyRoomId = req.body.StudyName;
    Nickname = req.body.Nickname;
    res.render("videoChat", { roomID: studyRoomId, nickname: Nickname });
});


io.on("connection", socket => {


    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        // version A
        socket.to(roomId).emit("user-connected", userId);

        /*
        // version B
        socket.on('connection-request',(roomId, userId) => {
            socket.to(roomId).emit("new-user-connected", userId);
        });
        */

        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", userId);
        });
    })
});

server.listen(3000);