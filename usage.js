import {
    generate,
    inspect,
    parse,
    removal,
    visit
} from './index.js'

const source = 'var one = 1;'

inspect(
    source,
    {
        tree: true,
        JSONfilter: true,
        removal: ['start', 'end', 'loc', 'extra'],
        generate: true
    }
)

const file = parse(source, { sourceType: "module" })

visit(file, (node, key, i, ancestor) => {
    if (node.type === "VariableDeclarator") {
        node.id.name = "two"
        node.init.value = 2
    }
})

console.log(generate(file).code)