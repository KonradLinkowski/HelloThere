const path = require('path')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const port = process.env.PORT || 3000

require('./server')(io)

server.listen(port, () => {
  console.log(`Server port: ${port}`)
})

app.use('/', express.static(path.join(__dirname, 'public')))