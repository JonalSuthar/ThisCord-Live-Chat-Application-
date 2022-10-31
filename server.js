const express = require('express')
const path = require('path');
const http = require('http');
const app = express();
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);
const formatMessage = require('./utils/messages')
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/user')

const botName = 'JonalBot'
//Set static folder
app.use(express.static(path.join(__dirname,'public')));

//Run when client connects
io.on('connection',socket=>{
    socket.on('joinRoom',({username, room})=>{
        const user = userJoin(socket.id,username,room);
        socket.join(user.room);
         //Welcome current user
        socket.emit('message', formatMessage(botName,"Hi I am JonalBot, You can chat here now."));

        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message',formatMessage(botName, `${user.username} has joined the chat`));
        //Send users and room Info
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users: getRoomUsers(user.room)
        })
    })
    console.log("New WS connection..");
    //Listen that chatMessage
    socket.on('chatMessage',function(msg){
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })
      //When a user disconnects 
      socket.on('disconnect',function(){
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat!`));
            //Send users and room Info
            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users: getRoomUsers(user.room)
            })
        }
        
    })
})
const PORT = process.env.PORT;
server.listen(PORT, function(){
    console.log(`Server is running on port ${PORT} `);
})