import * as PIXI from 'pixi.js'
import str from './ListItem.pixi.html'

/**
 * PIXI Setup
 */
let app = new PIXI.Application({ width: 640, height: 360, antialias: true })
document.body.appendChild(app.view)

function drawBox(x: number, y: number, width: number, height: number) {
    var graphics = new PIXI.Graphics()

    graphics.beginFill(0x444444)

    // set the line style to have a width of 5 and set the color to red
    graphics.lineStyle(2, 0x888888)

    // draw a rectangle
    graphics.drawRect(x, y, width, height)

    app.stage.addChild(graphics)
    // Add a ticker callback to move the sprite back and forth
}
function drawText(x: number, y: number, text: string) {
    const basicText = new PIXI.Text(text)
    basicText.x = x
    basicText.y = y
    app.stage.addChild(basicText)
}

/**
 * Draw from HTML instructions
 */
str.forEach((c: any) => {
    const l = c.layout
    if (c.text) {
        drawText(l.left, l.top, c.text)
    } else {
        drawBox(l.left, l.top, l.width, l.height)
    }
})
