
let nameToSymbol = {
    'p': '+',
    'm': '-',
    't': '*',
    'e': '!',
    'h': '#',
    'd': '$',
    'o': '.',
    'q': '=',
    'a': "'",
    'c': '%',
    'b': '|',
    'r': '~',
    'i': ':',
    'f': '&',
    's': '/',
    'u': '\\',
    'l': '<',
    'g': '>',
    'n': '@',
    'k': '?',
    'j': '^'}

export function decodeName (name: string): string{
    if (name.slice(0,2) === "XO") {
        return "(" + name.slice(2).split("").map(c => nameToSymbol[c]).join("") + ")"
    }
    if (name.slice(0,2) === "XP") {
        let numberOfPrimes : number = parseInt(name[2], 10)
        let rest = name.slice(3)
        // @ts-ignore
        let primes = "'".repeat(numberOfPrimes)
        return `${rest}${primes}`
    }
    return name
}

export function decode (input: string) : [string, string] {
    let firstUnderscoreAt = input.indexOf('_')
    let modulePart = input.slice(0, firstUnderscoreAt)
    let namePart = input.slice(firstUnderscoreAt+1)
    return [modulePart, decodeName(namePart)]
}