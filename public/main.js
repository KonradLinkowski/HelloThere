(function() {
  const $loginPage = document.querySelector('#login-page')
  const $chatPage = document.querySelector('#chat-page')
  const $chatBox = document.querySelector('#chat-box')
  const $chatInput = document.querySelector('#chat-input')
  const $sendBtn = document.querySelector('#chat-send')
  const $searchBtn = document.querySelector('#search')
  const $logoutBtn = document.querySelector('#chat-logout')
  const $typingInfo = document.querySelector('#typing-info')
  const $actionBtn = document.querySelector('#chat-action')
  const $leave = $actionBtn.querySelector('#action-leave'),
        $search = $actionBtn.querySelector('#action-search'),
        $stop =  $actionBtn.querySelector('#action-stop')

  const $infoUsers = document.querySelector('#info-users')

  const socket = new Socket('/chat')

  const state = {
    searching: 0,
    connected: 1,
    disconnected: 2
  }
  let currentState = {
    st: state.disconnected,
    set: value => {
      st = value
      if (value == state.searching) {
        $stop.setActive(true)
        $leave.setActive(false)
        $search.setActive(false)
        $sendBtn.disabled = true
        $chatInput.disabled = true
        $logoutBtn.disabled = true
      } else if (value == state.connected) {
        $stop.setActive(false)
        $leave.setActive(true)
        $search.setActive(false)
        $sendBtn.disabled = false
        $chatInput.disabled = false
        $logoutBtn.disabled = true
        $chatBox.innerHTML = ''
        $chatBox.appendChild($typingInfo)
      } else {
        $stop.setActive(false)
        $leave.setActive(false)
        $search.setActive(true)
        $sendBtn.disabled = true
        $chatInput.disabled = true
        $logoutBtn.disabled = false
      }
    },
    get: () => st
  }

  let typingTimeout = null
  let messageInterval = null

  window.addEventListener('focus', () => {
    if (messageInterval) {
      document.title = window.rendVars.title
      clearInterval(messageInterval)
      messageInterval = null
    }
    socket.read()
  })

  $chatBox.addEventListener('click', () => {
    $chatInput.focus()
  })
  $searchBtn.addEventListener('click', login)
  $sendBtn.addEventListener('click', e => {
    sendMessage()
  })
  $logoutBtn.addEventListener('click', e => {
    socket.leave()
    socket.logout()
    currentState.set(state.disconnected)
    $loginPage.setActive(true)
    $chatPage.setActive(false)
  })
  $actionBtn.addEventListener('click', e => {
    if (currentState.get() == state.connected) {
      socket.leave()
      currentState.set(state.disconnected)
    } else if (currentState.get() == state.disconnected) {
      socket.search(true)
      currentState.set(state.searching)
    } else {
      socket.search(false)
      currentState.set(state.disconnected)
    }
  })
  $chatInput.addEventListener('keydown', e => {
    socket.typing(true)
    if (e.key === 'Enter') {
      sendMessage()
    }
  })

  $chatInput.addEventListener('keyup', e => {
    if ($chatInput.value === '') {
      socket.typing(false)
    }
  })

  socket.on('join', data => {
    console.log('joined')
    currentState.set(state.connected)
    $chatInput.focus()
    printSystemMessage(`${window.rendVars.connectedMessage} ${data.gender}`)
    printSystemMessage(window.rendVars.sayHello)
  })

  socket.on('typing', start => {
    if (start) {
      if (typingTimeout) clearTimeout(typingTimeout)
      $typingInfo.setActive(true)
      $chatBox.scrollTop = $chatBox.scrollHeight
      typingTimeout = setTimeout(() => {
        $typingInfo.setActive(false)
      }, 5000)
    } else {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
        $typingInfo.setActive(false)
        typingTimeout = null
      }
    }
  })

  socket.on('read', () => {
    console.log('read')
  })

  socket.on('server-info', data => {
    $infoUsers.innerText = data.online
  })

  socket.on('message', msg => {
    if (typingTimeout) {
      clearTimeout(typingTimeout)
      $typingInfo.setActive(false)
      typingTimeout = null
    }
    if (!document.hasFocus()) {
      messageInterval = setInterval(blinkTitle, 3000, 1500)
    }
    printMessage(msg, false)
  })
  socket.on('user-left', () => {
    console.log('user left')
    currentState.set(state.disconnected)
    printSystemMessage('User left')
    // $loginPage.setActive(true)
    // $chatPage.setActive(false)
  })

  function printSystemMessage(msg) {
    $chatBox.insertBefore(createSystemMessageElement(msg), $typingInfo)
    $chatBox.scrollTop = $chatBox.scrollHeight
  }

  function printMessage(data, you) {
    if (data.error) {
      return
    }
    $chatBox.insertBefore(createMessageElement(data.msg, you), $typingInfo)
    $chatBox.scrollTop = $chatBox.scrollHeight
  }

  function sendMessage() {
    if ($chatInput.value === '') {
      return
    }
    socket.sendMessage($chatInput.value, msg => printMessage(msg, true))
    $chatInput.value = ''
  }

  function login() {
    const myGender = document.querySelector('input[name=my-gender]:checked').dataset.gender
    const checkboxes = document.querySelectorAll('input[name=search-gender]:checked')
    const searchFor = []
    for (let e of checkboxes) {
      searchFor.push(e.dataset.gender)
    }
    socket.login(myGender, searchFor, succes => {
      if (succes) {
        socket.search(true)
        currentState.set(state.searching)
        $loginPage.setActive(false)
        $chatPage.setActive(true)
      } else {
        console.log('Login failure')
      }
    })
  }

  function blinkTitle(int) {
    document.title = window.rendVars.titleMessage
    setTimeout(() => {
      document.title = window.rendVars.title
    }, int)
  }

  function createMessageElement(message, you) {
    let wrapper = document.createElement('div')
    wrapper.classList.add('message-wrapper')
    wrapper.classList.add(you ? 'message-wrapper--right' : 'message-wrapper--left')
    let mes = document.createElement('span')
    mes.classList.add('message')
    mes.classList.add(you ? 'message--right' : 'message--left')
    mes.innerText = message
    wrapper.appendChild(mes)
    return wrapper
  }

  function createSystemMessageElement(message) {
    let wrapper = document.createElement('div')
    wrapper.classList.add('message-wrapper')
    let mes = document.createElement('span')
    mes.classList.add('message')
    mes.classList.add('message--system')
    mes.innerText = message
    wrapper.appendChild(mes)
    return wrapper
  }
})()

/**
 * Toggles class 'hidden'
 * @param {boolean} value should be active?
 */
Element.prototype.setActive = function(value) {
  this.classList.toggle('hidden', !value)
}