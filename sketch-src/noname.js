const canvasSketch = require('canvas-sketch')
// const random = require('canvas-sketch-util/random')
// const palettes = require('nice-color-palettes')

const settings = {
  dimensions: [ 576, 1024 ],
  scaleToView: true,
  animate: true,
}

const runtimeParams = { opacity: 0.77 };

const sketch = ({ width, height }) => {
  const centerX = width >> 1
  const centerY = height >> 1
  return ({ context, time }) => {
    context.shadowBlur = 16
    context.lineWidth = 2
    const ms = time * 1000
    context.globalAlpha = runtimeParams.opacity ?? 0.77
    context.strokeStyle = 'rgba(0,0,0,0.8)'
    context.fillRect(0, 0, width, height)
    context.globalAlpha = 1
    context.setTransform(1, 0, 0, 1, centerX, centerY) // for easier centering
    context.beginPath()
    context.shadowColor = `hsl(${ms*.1}, 100%, 75%)`
    context.rotate(0.025)
    const step = Math.PI / ((ms % 200) + 50)
    let angle = 0
    while (angle < Math.PI * 2) {
      context.moveTo(0, 0)
      const tan = Math.tan(ms * 0.00025)
      const cos = Math.cos(ms * 0.0001500 * angle * tan)
      const sin = Math.sin(ms * .01)
      const len = 150 + 150 * cos * sin
      context.lineTo(len * Math.cos(angle), len * Math.sin(angle))
      angle += step
    }
    context.stroke()
    context.shadowBlur = 0
    context.globalCompositeOperation = 'lighter'
    context.drawImage(context.canvas, -centerX, -centerY);
    context.drawImage(context.canvas, -centerX, -centerY);
    context.globalCompositeOperation = 'source-over'

  }
}

const managerPromise = canvasSketch(sketch, settings);
require('./s33d-params').setupParamsListener(managerPromise, runtimeParams);
