const path = require('path')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const port = process.env.PORT || 3000

server.listen(port, () => {
  console.log("Server started at port " + port)
})

app.use('/', express.static(path.join(__dirname, 'public')))

io.on('connection', socket => {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', data => {
    console.log(data)
  })
})