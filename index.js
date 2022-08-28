import gen from "@babel/generator"
import { parse as compile } from '@babel/parser'
import * as unist from 'unist-util-inspect'
export const generate = 'default' in gen ? gen.default : gen
export { compile as parse }

const options = {
    inspect: true,
    source: true,
    tree: false,
    removal: false,
    JSONfilter: true,
    generate: false
}
const orange = "\u001b[38;2;255;165;0m"
const clear = "\u001b[0m"

// util
function log(message, object) {
    const formatter = '%s[%s]:%s\n' + (typeof object === 'string' ? '%s' : '%o')
    return console.log(
        formatter,
        orange,
        message,
        clear,
        object
    )
}

export function inspect(source, option = {}) {
    const opt = Object.assign(options, option)
    let tree = compile(source, { sourceType: 'module' })
    if (opt.source) log('source', source)
    if (opt.removal === true) {
        tree = removal(tree, ['start', 'end', 'loc'], opt.JSONfilter)
    } else if (Array.isArray(opt.removal)) {
        tree = removal(tree, opt.removal, opt.JSONfilter)
    }
    if (opt.inspect) log('inspect', unist.inspect(tree))
    if (opt.tree) log('tree', tree)
    if (opt.generate) log('generate', generate(tree).code)
    console.log('')
}

export function removal(code, exclusions = [], JSONfilter = true) {
    const node = JSONfilter ? JSON.parse(JSON.stringify(code)) : code

    return walk(node)

    function walk(elm) {
        if (
            elm == null ||
            typeof elm === 'string' ||
            typeof elm === 'number' ||
            typeof elm === 'boolean'
        ) return elm
        if (Array.isArray(elm)) return elm.map(child => {
            return walk(child)
        })
        const res = {}
        for (let key in elm) {
            if (!exclusions.includes(key)) res[key] = walk(elm[key])
        }
        return res
    }
}

export function visit(node, callback) {
    const Node = node.constructor
    const ancestor = []
    walk(node, null, null)

    function walk(curr, key, index) {
        if (curr.constructor === Node) {
            callback(curr, key, index, ancestor)
            ancestor.push(curr)
        }
        if (Array.isArray(curr)) {
            curr.forEach((child, i) => {
                walk(child, key, i)
            })
        } else Object.keys(curr).forEach(key => {
            const child = curr[key]
            if (
                child == null ||
                typeof child === 'string' ||
                typeof child === 'number' ||
                typeof child === 'boolean' ||
                typeof child === 'function'
            ) { } else walk(child, key, null)
        })
        if (curr.constructor === Node) ancestor.pop()
    }
}
