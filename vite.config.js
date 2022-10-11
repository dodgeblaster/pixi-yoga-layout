import { defineConfig } from 'vite'
// import MagicString from 'magic-string'
// import { parse } from 'node-html-parser'
import yoga from 'yoga-layout-prebuilt'
import * as acorn from 'acorn'
import jsx from 'acorn-jsx'
var JSXParser = acorn.Parser.extend(jsx())

/**
 * Layout
 */
const createNode = (config) => {
    const root = yoga.Node.create()
    if (config.width) {
        root.setWidth(config.width)
    }

    if (config.height) {
        root.setHeight(config.height)
    }

    if (config.justifyCenter) {
        root.setJustifyContent(yoga.JUSTIFY_CENTER)
    }

    if (config.flexRow) {
        root.setFlexDirection(yoga.FLEX_DIRECTION_ROW)
    }

    if (config.flexColumn) {
        root.setFlexDirection(yoga.FLEX_DIRECTION_COLUMN)
    }

    if (config.pt20) {
        root.setPadding(yoga.EDGE_TOP, 20)
    }

    return root
}

const insertNode = (parent, child, index) => {
    parent.insertChild(child, index)
}

const calculateLayout = (root) => {
    return root.calculateLayout(500, 300, yoga.DIRECTION_LTR)
}

/**
 * Parse
 */
const parseStringToJsx = (src) => {
    const x = JSXParser.parse(src, { ecmaVersion: 2020 })
    return x.body[0].expression
}

let state = {}
function walk(el, lvl, index, parent) {
    let result = ''
    // console.log('TYPE: ', el.type)
    if (el.openingElement) {
        const name = el.openingElement.name.name
        //console.log('EL: ', name)

        let style = {}

        if (el.openingElement.attributes) {
            el.openingElement.attributes.forEach((a) => {
                if (a.name.name === 'class') {
                    //console.log('CLASS: ', a.value.value)

                    const classes = a.value.value.split(' ')
                    classes.forEach((c) => {
                        if (c.startsWith('h-')) {
                            const height = Number(c.split('-')[1])
                            style.height = height
                        }
                        if (c.startsWith('w-')) {
                            const width = Number(c.split('-')[1])
                            style.width = width
                        }

                        if (c.startsWith('justify-center')) {
                            style.justifyCenter = true
                        }

                        if (c.startsWith('flex-row')) {
                            style.flexRow = true
                        }

                        if (c.startsWith('flex-column')) {
                            style.flexColumn = true
                        }

                        if (c.startsWith('pt-')) {
                            style.pt20 = true
                        }
                    })
                }
            })
        }

        const n = !parent ? 'root' : `${name}-${lvl}-${index}`

        const theRes = {
            el: createNode(style),
            type: name,
            childIndex: 0
        }
        state[n] = theRes

        result = n

        if (el.children) {
            let list = []
            let i = 0
            for (const ch of el.children) {
                const res = walk(ch, lvl + 1, i, n, n)

                if (res) {
                    list.push(res)
                    //console.log('THE RES:: ', ch)
                    const par = state[n].el
                    const child = state[res].el

                    console.log('I: Parent', n)
                    console.log('I: child', res)

                    insertNode(par, child, i)

                    i++
                }
            }
        }

        return result
    }

    if (el.type === 'JSXText') {
        const v = el.value.replace(/(?:\\[rn])+/g, '').trim()
        if (v.length > 0) {
            console.log('text: ', el.value)
            // const name = `${name}-${lvl}-${index}`

            state[parent].text = el.value
            // const theRes = {
            //     el: createNode(style),
            //     type: name,
            //     childIndex: 0
            // }
            // state[n] = theRes
        }
    }
}
/**
 * My Plugin
 */
const fileRegex = /\.(pixi.html)$/
function replaceKeywordWithImport() {
    return {
        name: 'transform-file',
        transform(src, id) {
            if (fileRegex.test(id)) {
                // console.log('id:: ', id)
                // const s = new MagicString(src)
                // s.prepend('import {msg} from "virtual:something" \n')
                // s.replace(/\$gary/g, 'msg')
                // return {
                //     code: s.toString(),
                //     map: null // provide source map if available
                // }

                const str = parseStringToJsx(src)

                walk(str, 0, 0, null)

                let layoutConfig = []
                if (state.root) {
                    calculateLayout(state.root.el)

                    const l = Object.keys(state).map((k) => {
                        return {
                            id: k,
                            type: state[k].type,
                            text: state[k].text || '',
                            layout: state[k].el.getComputedLayout()
                        }
                    })

                    layoutConfig = l
                }
                return {
                    code: `export default ${JSON.stringify(layoutConfig)}`,
                    map: null
                }
            }
        }
    }
}
// function setupVirtualFile() {
//     const virtualModuleId = 'virtual:something'
//     const resolvedVirtualModuleId = '\0' + virtualModuleId

//     return {
//         name: 'something', // required, will show up in warnings and errors
//         resolveId(id) {
//             if (id === virtualModuleId) {
//                 return resolvedVirtualModuleId
//             }
//         },
//         load(id) {
//             if (id === resolvedVirtualModuleId) {
//                 return `export const msg = "from virtual module"`
//             }
//         }
//     }
// }

/**
 * Setup
 */
export default defineConfig({
    plugins: [
        //setupVirtualFile(),
        replaceKeywordWithImport()
    ]
})
