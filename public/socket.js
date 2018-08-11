class Socket {
  /**
   * Creates new socket
   * 
   * @param {string} namespace where to connect
   */
  constructor (namespace) {
    this.socket = io.connect(namespace)
  }

  /**
   * Logs in new user
   * 
   * @param {string} myGender male or female
   * @param {string[]} searchFor array of male or female
   * @param {function} cb what to do when server will log user in
   */
  login(myGender, searchFor, cb) {
    this.socket.emit('login', {
      myGender: myGender,
      searchFor: searchFor
    }, cb)
  }

  /**
   * Leaves current conversation
   */
  leave() {
    this.socket.emit('leave')
  }

  /**
   * Sends message to a current connected user
   * 
   * @param {string} message your message
   * @param {functiion} cb what to do when server process the message
   */
  sendMessage(message, cb) {
    this.socket.emit('message', message, cb)
  }

  /**
   * Starts searching for new user
   */
  search() {
    this.socket.emit('search')
  }

  /**
   * Overrides event's behaviour
   * 
   * @param {string} event name of the event
   * @param {function} fn what to do
   */
  on(event, fn) {
    this.socket.on(event, fn)
  }
}