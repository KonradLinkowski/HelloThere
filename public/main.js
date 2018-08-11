(function() {
  const $loginPage = document.querySelector('#login-page')
  const $chatPage = document.querySelector('#chat-page')
  const $chatBox = document.querySelector('#chat-box')
  const $chatInput = document.querySelector('#chat-input')
  const $sendBtn = document.querySelector('#chat-send')
  const $searchBtn = document.querySelector('#search')

  $searchBtn.addEventListener('click', search)
  $sendBtn.addEventListener('click', e => {

  })
  $chatInput.addEventListener('keydown', e => {

  })

  function search() {
    const $myGender = document.querySelector('#my-gender')
    const $searchGender = document.querySelector('#search-gender')
    $loginPage.setActive(false)
    $chatPage.setActive(true)
  }
})()

/**
 * Toggles class 'hidden'
 * @param {boolean} value should be active?
 */
Element.prototype.setActive = function(value) {
  this.classList.toggle('hidden', !value)
}