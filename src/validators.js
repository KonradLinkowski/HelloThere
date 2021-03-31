const genders = ['male', 'female']

function validate(...validators) {
  return data => validators.every(v => v(data))
}

function loginValidator({ gender, searchFor}) {
  console.log(gender, searchFor)
  return genders.includes(gender)
    && searchFor.length >= 1 && searchFor.length <= 2 && searchFor.every(g => genders.includes(g))
}


function booleanValidator(data) {
  return typeof data == 'boolean'
}

function messageValidator(message) {
  return message.length > 0 && message.length <= 1024
}

module.exports = {
  validate,
  loginValidator,
  booleanValidator,
  messageValidator
}
