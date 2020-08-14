const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

// socket.emit              -> only for the client connected
// socket.broadcast.emit    -> for everyone, except the client connected
// io.emit                  -> for everyone
// io.to.emit               -> emit the event to everyone in a specific room
// socket.broadcast.to.emit -> emit the event to everyone in a specific room, except sender

io.on('connection', (socket) => {
    console.log('New WebSocket connection!')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        const sala = user.room.charAt(0).toUpperCase() + user.room.slice(1)
        socket.emit('message', generateMessage('Admin',`Bem vindo(a) à sala ${sala}!`))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} entrou na sala!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        filter.addWords('bosta', 'merda', 'porra', 'caralho', 'pau', 'cu', 'buceta')
        const user = getUser(socket.id)

        if (filter.isProfane(message)) {
            socket.emit('message', generateMessage('Apenas linguagem apropriada!'))
            callback()
        } else {
            io.to(user.room).emit('message', generateMessage(user.username, message))
            callback()
        }
    })

    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} saiu da sala!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        } 
    })

    socket.on('index', () => {
        console.log('index access!')
        socket.emit('rooms', [
            getUsersInRoom('geral').length, 
            getUsersInRoom('tecnologia').length, 
            getUsersInRoom('games').length, 
            getUsersInRoom('desenvolvimento').length
        ])
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})