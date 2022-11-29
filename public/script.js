// '/'에 접속하면 socket 생성
const socket = io("/");

const videoGrid = document.querySelector("#video-grid");
const muteBtn = document.querySelector("#mute");
const cameraBtn = document.querySelector("#camera");

const myPeer = new Peer(undefined, {
    host: "/",
    port: "3001"
});
const myVideo = document.createElement("video");
myVideo.muted = true;

const peers = [];

let myMicMuted = false;     // 현재 마이크 상태
let myCameraOff = false;    // 현재 카메라 상태

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then( stream => {
    // my stream
    addVideoStream(myVideo, stream, NICKNAME);
    
    myPeer.on("call", call => {
        call.answer(stream);    // peer 의 stream 보냄

        const video = document.createElement('video')
        call.on("stream", userVideoStream => {
            addVideoStream(video, userVideoStream, stream.id)
        })
    })
    
    // version A
    socket.on("user-connected", userId => {
        //connectToNewUser(userId, stream);
        setTimeout(connectToNewUser, 1000, userId, stream);
    });

    /*
    // version B
    socket.emit('connection-request', ROOM_ID, myPeer.peerId);
    socket.on('new-user-connected', userId =>{
        if(userId != myPeer.peerId){
            console.log("New user: "+userId);
            connectToNewUser(userId,stream);
        }
    });
    */

    // 음소거 버튼
    muteBtn.addEventListener("click", () => {
        handleMuteClick(stream);
    });

    // 카메라 on/off 버튼
    cameraBtn.addEventListener("click", () => {
        handleCameraClick(stream);
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

function connectToNewUser(userId, stream){
    // newPeer의 userID, 나의 stream
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");

    // 상대방이 그들의 video stream 보내면 작동
    call.on("stream", userVideoStream => {
        addVideoStream(video, userVideoStream, stream.id);
    });

    call.on("close", () => {
        video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video, stream, userId){
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });
    
    const userDiv = document.createElement("div");
    const userNickDiv = document.createElement("div");
    userNickDiv.innerText = userId;
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