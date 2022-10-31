const chatForm = document.getElementById('chat-form');
const socket = io();
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users')
const chatMessages = document.querySelector('.chat-messages');

//Get username and room from URL 
const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true
})
//Join ChatRoom
socket.emit('joinRoom',{username,room});

// Get room and Users
socket.on('roomUsers',({room,users})=>{
    outputRoomName(room);
    outputUserName(users);
})
console.log(username,room)
//Message from server
socket.on('message',function(message){
    console.log(message);
    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
})
//Message submit
chatForm.addEventListener('submit',function(e){
    e.preventDefault();
    //get message text
    const msg = e.target.elements.msg.value;
    //Emit message to server.
    socket.emit('chatMessage',msg);
    //Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.value.focus();
})
//Output message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div);
}

//Add roomname to dom
function outputRoomName(room){
    roomName.innerText = room;
}

//Add users to DOM
function outputUserName(users){
     userList.innerHTML = `
     ${users.map(user => `<li>${user.username}</li>`).join('')}
     `;
}