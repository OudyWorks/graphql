import Case from 'case'

export function key(key) {
  if (key.match(/^[A-Z]+s?$/))
    key = key.toLowerCase()
  return Case.camel(key)
}