'use strict'
const { booleanValidator, validate, loginValidator, messageValidator } = require('./validators')

/**
 * Every logged in user
 */
const users = []

/**
 * Users waiting for match
 */
const chatQueue = []

setInterval(matchUsers, 100)

let chat = null

function serv(io) {
  chat = io.of('/chat')
  chat.on('connection', handleConnection)
  return {
    getUserCount: () => users.length,
    getQueueLength: () => chatQueue.length
  }
}

function handleConnection(socket) {
  console.log(`${socket.id} connected`)

  bind('login', [loginValidator], ({ gender, searchFor }) => {
    socket.gender = gender
    socket.searchFor = searchFor
    users.push(socket)
    console.log(`${socket.id} logged in`)
  })

  bind('logout', [], () => {
    console.log(`${socket.id} logged out`)
    const index = users.findIndex(u => u.id == socket.id)
    if (index == -1) return
    users.splice(index)
  })

  bind('search', [booleanValidator], data => {
    console.log('search', data)
    const user = users.find(user => user.id == socket.id)
    if (data === true) {
      if (user) {
        chatQueue.push(user)
        console.log(`${socket.id} (${user.gender}) is looking for ${user.searchFor}`)
      } else {
        console.log('no such user')
      }
    } else {
      console.log(`${socket.id} stopped looking for someone`)
      chatQueue.splice(chatQueue.indexOf(user), 1)
    }
  })

  bind('leave', [], () => {
    console.log(`${socket.id} left the room`)
    if (socket.stranger) {
      chat.to(socket.stranger.id).emit('user-left')
      delete socket.stranger.stranger
      delete socket.stranger
    }
  })

  bind('typing', [booleanValidator], start => {
    if (socket.stranger) {
      chat.to(socket.stranger.id).emit('typing', start)
    }
  })

  bind('read', [], () => {
    if (socket.stranger) {
      chat.to(socket.stranger.id).emit('read')
    }
  })

  bind('message', [messageValidator], msg => {
    console.log(`${socket.id} sent message: ${msg}`)
    chat.to(socket.stranger.id).emit('message', msg)
    return msg
  })

  bind('disconnect', [], () => {
    console.log(`${socket.id} is disconnecting`)
    const user = users.find(user => user.id == socket.id)
    if (!user) return
    if (user.stranger) {
      chat.to(user.stranger.id).emit('user-left')
      delete user.stranger.stranger
      delete user.stranger
    }
    const usersIndex = users.indexOf(user)
    if (usersIndex != -1) users.splice(usersIndex, 1)
    const queueIndex = chatQueue.indexOf(user)
    if (queueIndex != -1) chatQueue.splice(queueIndex, 1)
  })

  function bind(event, validators, handler) {
    socket.on(event, (data, cb) => {
      if (!validate(...validators)(data)) {
        cb && cb(false)
        return
      }
      const value = handler(data)
      cb && cb(value || true)
    })
  }
}

/**
 * Matches two users
 */
function matchUsers() {
  // console.log(chatQueue.length)
  if (chatQueue.length < 2) return
  // for each user in the chat queue
  for (const user of chatQueue) {
    // find other users that fulfill the current user's requirements
    const availableUsers = chatQueue.filter(otherUser => {
      if (user == otherUser) return false
      return matches(user, otherUser)
    })
    // if there is no such user return
    if (availableUsers.length == 0) continue
    // connect with random user from availables
    const index = Math.floor(Math.random() * availableUsers.length)
    const otherUser = availableUsers[index]
    user.stranger = otherUser
    otherUser.stranger = user
    chat.to(user.id).emit('join', { gender: otherUser.gender })
    chat.to(otherUser.id).emit('join', { gender: user.gender })
    chatQueue.splice(chatQueue.indexOf(user), 1)
    chatQueue.splice(chatQueue.indexOf(otherUser), 1)
  }
}

function matches(user1, user2) {
  return user1.searchFor.includes(user2.gender) && user2.searchFor.includes(user1.gender)
}

module.exports = serv