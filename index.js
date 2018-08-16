'use strict'
const path = require('path')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const mustacheExpress = require('mustache-express')
const locale = require('locale')
const supported = ['en', 'pl']

const lang = require('./lang/lang')

const port = process.env.PORT || 3000

const socket = require('./server')(io)

server.listen(port, () => {
  console.log(`Server port: ${port}`)
})

app.use(locale(supported))

app.engine('mustache', mustacheExpress())

app.set('view engine', 'mustache')
app.set('views', path.join(__dirname, '/views'))

app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.render('main', {
    userCount: socket.getUserCount(),
    whoAreYou: lang.whoAreYou[req.locale],
    whoAreYouLookingFor: lang.whoAreYouLookingFor[req.locale],
    female: lang.female[req.locale],
    male: lang.male[req.locale],
    saySomething: lang.saySomething[req.locale]
  })
})