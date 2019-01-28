const Case = require('case')

module.exports = function key(key) {
  if (key.match(/^[A-Z]+s?$/))
    key = key.toLowerCase()
  return Case.camel(key)
}