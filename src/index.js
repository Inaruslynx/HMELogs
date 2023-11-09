const express = require('express')
let ejs = require('ejs');
const app = express()
const port = 3000
const path = require('path')

app.use(express.static(path.join(__dirname, '/public')))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.get('/', (req, res) => {
  res.render('home')
})

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`)
})