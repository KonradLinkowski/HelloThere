(function() {
  const $loginPage = document.querySelector('#login-page')
  const $chatPage = document.querySelector('#chat-page')
  const $chatBox = document.querySelector('#chat-box')
  const $chatInput = document.querySelector('#chat-input')
  const $sendBtn = document.querySelector('#chat-send')
  const $searchBtn = document.querySelector('#search')

  const socket = new Socket('/chat')

  $searchBtn.addEventListener('click', login)
  $sendBtn.addEventListener('click', e => {
    socket.sendMessage($chatInput.value, msg => printMessage(msg, true))
  })
  $chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      socket.sendMessage($chatInput.value, msg => printMessage(msg, true))
    }
  })

  socket.on('join', data => {
    console.log('joined')
  })

  socket.on('message', msg => printMessage(msg, false))
  socket.on('user-left', () => {
    socket.leave()
    $chatBox.innerHTML = ''
    $loginPage.setActive(true)
    $chatPage.setActive(false)
  })

  function printMessage(message, you) {
    let mes = document.createElement('p')
    mes.innerHTML = (you ? 'You: ' : 'Stranger: ') + message
    $chatBox.appendChild(mes)
  }

  function login() {
    const $myGender = document.querySelector('#my-gender')
    const $searchGender = document.querySelector('#search-gender')
    const myGender = document.querySelector('input[name=my-gender]:checked').dataset.gender
    const checkboxes = document.querySelectorAll('input[name=search-gender]:checked')
    const searchFor = []
    for (let e of checkboxes) {
      searchFor.push(e.dataset.gender)
    }
    socket.login(myGender, searchFor, succes => {
      if (succes) {
        socket.search()
        $loginPage.setActive(false)
        $chatPage.setActive(true)
      } else {
        console.log('Login failure')
      }
    })
  }
})()

/**
 * Toggles class 'hidden'
 * @param {boolean} value should be active?
 */
Element.prototype.setActive = function(value) {
  this.classList.toggle('hidden', !value)
}