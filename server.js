//importing all apis

const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('views', './views') // use to connect ejs files in views directory

app.set('view engine', 'ejs') // change default template engine to ejs
app.use(express.static('public')) //connect all static files in public folder
app.use(express.urlencoded({ extended: true }))  //The express.urlencoded() function is a built-in middleware function in Express. It parses incoming requests with urlencoded payloads and is based on body-parser.

const rooms = { }


app.get('/', (req, res) => {
  res.render('index', { rooms: rooms })
})

// when post request of '/room'is generated and if the entered room is already present then redirect user to that room else create a new room.
app.post('/room', (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: {} }
  res.redirect(req.body.room)
  // Send message that new room was created
  io.emit('room-created', req.body.room)
})

//when user created a new room
app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }
  res.render('room', { roomName: req.params.room })
})

server.listen(process.env.PORT||4000)

//it makes connection to socket
io.on('connection', socket => {
  //when new-user event call then we join room using socket and broadcast it to every other user connected to same room
  socket.on('new-user', (room, name) => {
    socket.join(room)
    rooms[room].users[socket.id] = name
    socket.to(room).broadcast.emit('user-connected', name)
  })
  // this send-chat-message event called when anyone send the message and this event will broadcast that message to everyone 
  socket.on('send-chat-message', (room, message) => {
    socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
  })

  // this event disconnect the user from the room and broadcast it to everyone
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}