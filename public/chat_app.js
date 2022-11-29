const socket = io();

const room = document.getElementById('chatRoom');

let userName = NICKNAME;
let roomName = ROOM_ID;

//functions
function addMessage(message) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = message;
  ul.appendChild(li);
}

function addNotice(message) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#msg input');
  const value = input.value;
  socket.emit('new_message', input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = '';
}

function handleNoticeSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#notice input');
  const value = input.value;
  socket.emit('new_notice', input.value, roomName, () => {
    addNotice(`NOTICE: ${value}`);
  });
  input.value = '';
}

function startChat() {
  const h1 = document.querySelector("h1");
  h1.innerText = `TEAM12 - STUDY HOME : ${roomName}`;
  const msgForm = room.querySelector('#msg');
  const noticeForm = room.querySelector('#notice');
  msgForm.addEventListener('submit', handleMessageSubmit);
  noticeForm.addEventListener('submit', handleNoticeSubmit);
}

// socket
socket.emit('enter_chat_room', roomName, startChat);
socket.emit('nickname', userName);

socket.on('new_message', addMessage);
socket.on('new_notice', addNotice);
