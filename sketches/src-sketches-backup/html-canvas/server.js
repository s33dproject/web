const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const fs = require('fs')

const PORT = 8081

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

wss.on('connection', (ws) => {
  ws.on('message', (dataUrl) => {
    // strip off the data: url prefix to get just the base64-encoded bytes
    const data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
    const buf = Buffer.from(data, 'base64')
    const now = Date.now()
    fs.writeFile(`./snapshots/${now}.png`, buf, (err) => {
      if(err) return console.log(err)
      console.log(`File saved ${now}`)
    })
  })
  ws.send('Connected!')
})

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
