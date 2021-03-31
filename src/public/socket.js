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
   * @param {string} gender male or female
   * @param {string[]} searchFor array of male or female
   * @param {function} cb what to do when server will log user in
   */
  login(gender, searchFor, cb) {
    this.socket.emit('login', {
      gender,
      searchFor
    }, cb)
  }

  /**
   * Leaves current conversation
   */
  leave() {
    this.socket.emit('leave')
  }

  /**
   * Logs user out
   */
  logout() {
    this.socket.emit('logout')
  }

  /**
   * Sends information that user is typing
   * 
   * @param {boolean} start started or stopped typing
   */
  typing(start) {
    this.socket.emit('typing', start)
  }

  /**
   * Sends information that user read the message
   */
  read() {
    this.socket.emit('read')
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
   * 
   * @param {boolean} start true if you want to start, false if stop
   */
  search(start) {
    this.socket.emit('search', start)
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