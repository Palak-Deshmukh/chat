const socket = io('/')  //import socket.io

const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

//user enter his/her name so we use prompt

if (messageForm != null) {
  const name = prompt('What is your name?')
  appendMessage('You joined','left')
  socket.emit('new-user', roomName, name)

  messageForm.addEventListener('submit', e => {
    e.preventDefault() //it prevent the page form reload
    const message = messageInput.value
    appendMessage(`You: ${message}`,'right')
    socket.emit('send-chat-message', roomName, message) //emit the event send-chat-message with roomName and message
    messageInput.value = ''
  })
}

// here we define the room-created event, when user created a new room 
socket.on('room-created', room => {
  const roomElement = document.createElement('div')
  roomElement.innerText = room
  const roomLink = document.createElement('a')
  roomLink.href = `/${room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
})

// here we call chat-message event we call appendMessage function
socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`,'left')
})

// here we call user-connected event we call appendMessage function
socket.on('user-connected', name => {
  appendMessage(`${name} connected`,'left')
})

// when user-disconnected this event call
socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`,'left')
})


function appendMessage(message,position) {
  const messageElement = document.createElement('div')
  messageElement.classList.add('message');
  messageElement.classList.add(position);
  // messageElement.innerText = message;
  var d=new Date();
  var hour=d.getHours();
  var min=d.getMinutes();
  // messageElement.innerText = message;
  
  messageElement.insertAdjacentHTML('afterbegin',`<p>${message}</p>`);
  messageContainer.append(messageElement);
  
}


  
  
