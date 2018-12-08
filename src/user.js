class User {
  /**
   * Structure representing user
   * 
   * @param {object} socket user's socket
   * @param {string} gender male or female
   * @param {string[]} searchFor array of male or female
   */
  constructor(socket, gender, searchFor) {
    this.socket = socket
    this.gender = gender
    this.searchFor = searchFor
  }
}

module.exports = User