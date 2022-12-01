// '/'에 접속하면 socket 생성
const socket = io("/");

const videoGrid = document.querySelector("#video-grid");
const muteBtn = document.querySelector("#mute");
const cameraBtn = document.querySelector("#camera");

const myPeer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443"
});
const myDiv = document.createElement("div");
const myVideo = document.createElement("video");
const myNickDiv = document.createElement("span");

myVideo.muted = true;

const peers = [];

let myMicMuted = false;     // 현재 마이크 상태
let myCameraOff = false;    // 현재 카메라 상태

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then( stream => {
    // my stream
    addVideoStream(myVideo, myDiv, myNickDiv, stream, NICKNAME);
    
    myPeer.on("call", call => {
        call.answer(stream);    // peer 의 stream 보냄

        const userDiv = document.createElement("div");
        const video = document.createElement('video')
        const userNickDiv = document.createElement("span");
        call.on("stream", userVideoStream => {
            addVideoStream(video, userDiv, userNickDiv, userVideoStream, stream.id)
        })
    })
    
    //새 유저 오면,
    socket.on('new-user-connected', (userId, NICKNAME) =>{
        if(userId != myPeer.id){
            console.log("new user connected");
            console.log("new user's userId: " + userId);
            console.log("my myPeer.id: " + myPeer.id);
            connectToNewUser(userId, NICKNAME, stream);
        }
    });
    socket.emit('connection-request', ROOM_ID, myPeer.id, NICKNAME);

    // 음소거 버튼
    muteBtn.addEventListener("click", () => {
        handleMuteClick(stream);
    });

    // 카메라 on/off 버튼
    cameraBtn.addEventListener("click", () => {
        handleCameraClick(stream);
    });

    cameraSelect.addEventListener("input", () => {
     handleCameraChange(stream);
    });

})

socket.on("user-disconnected", userId => {
    if(peers[userId]){
        peers[userId].close();
    }
});


myPeer.on("open", userId => {
    // PeerJS 통해서 사용자에게 새로운 ID 할당
    socket.emit("join-room", ROOM_ID, userId);
})


function connectToNewUser(userId, NICKNAME, stream){
    // newPeer의 userID, 나의 stream
    const call = myPeer.call(userId, stream);
    const userDiv = document.createElement("div");
    const video = document.createElement("video");
    const userNickDiv = document.createElement("span");

    // 상대방이 그들의 video stream 보내면 작동
    call.on("stream", userVideoStream => {
        addVideoStream(video, userDiv, userNickDiv, userVideoStream, NICKNAME, stream.id);
    });

    call.on("close", () => {
        userDiv.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video, userDiv, userNickDiv, stream, NICKNAME, userId){
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });
    
    userNickDiv.innerText = NICKNAME;
    userDiv.append(video)
    userDiv.append(userNickDiv);
    videoGrid.append(userDiv);
}




/* 마이크, 카메라 */

function handleMuteClick(stream) {
    // 모든 audio track의 상태를 반대로 만듦
    stream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    if(!myMicMuted){
        muteBtn.innerText = "Unmute";
        myMicMuted = true;
    }else{
        muteBtn.innerText = "Mute";
        myMicMuted = false;
    }
}

function handleCameraClick(stream) {
    // 모든 video track의 상태를 반대로 만듦
    stream
       .getVideoTracks()
       .forEach((track) => (track.enabled = !track.enabled));

    if(!myCameraOff){
        cameraBtn.innerText = "Turn Camera On";
        myCameraOff = true;
    }else{
        cameraBtn.innerText = "Turn Camera Off";
        myCameraOff = false;
    }
}