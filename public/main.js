(function() {
  const $loginPage = document.querySelector('#login-page')
  const $chatPage = document.querySelector('#chat-page')
  const $chatBox = document.querySelector('#chat-box')
  const $chatInput = document.querySelector('#chat-input')
  const $sendBtn = document.querySelector('#chat-send')
  const $searchBtn = document.querySelector('#search')
  const $leaveBtn = document.querySelector('#chat-leave')
  const $logoutBtn = document.querySelector('#chat-logout')
  const $typingInfo = document.querySelector('#typing-info')

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
        $leaveBtn.innerHTML = 'stop'
        $sendBtn.disabled = true
        $chatInput.disabled = true
        $logoutBtn.disabled = true
      } else if (value == state.connected) {
        $leaveBtn.innerHTML = 'leave'
        $sendBtn.disabled = false
        $chatInput.disabled = false
        $logoutBtn.disabled = true
        $chatBox.innerHTML = ''
        $chatBox.appendChild($typingInfo)
      } else {
        $leaveBtn.innerHTML = 'search'
        $sendBtn.disabled = true
        $chatInput.disabled = true
        $logoutBtn.disabled = false
      }
    },
    get: () => st
  }

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
  $leaveBtn.addEventListener('click', e => {
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
    socket.typing()
    if (e.key === 'Enter') {
      sendMessage()
    }
  })

  socket.on('join', data => {
    console.log('joined')
    currentState.set(state.connected)
  })

  socket.on('typing', () => {
    $typingInfo.setActive(true)
    setTimeout(() => {
      $typingInfo.setActive(false)
    }, 5000)
  })

  socket.on('message', msg => printMessage(msg, false))
  socket.on('user-left', () => {
    console.log('user left')
    socket.leave()
    currentState.set(state.disconnected)
    // $loginPage.setActive(true)
    // $chatPage.setActive(false)
  })

  function printMessage(data, you) {
    $typingInfo.setActive(false)
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
})()

/**
 * Toggles class 'hidden'
 * @param {boolean} value should be active?
 */
Element.prototype.setActive = function(value) {
  this.classList.toggle('hidden', !value)
}