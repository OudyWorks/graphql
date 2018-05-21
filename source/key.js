import Case from 'case'

export default function key(key) {
    if(key.match(/^[A-Z]+s?$/))
        key = key.toLowerCase()
    return Case.camel(key)
}