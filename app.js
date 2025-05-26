const config = require('./utils/config')
const express = require('express')
const app = express()

const blogsRouter = require('./controllers/blogs')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })

// Ennen routeja rekisteröidään käyttöön:
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

// Sitten routet mukaan, kun ylläolevat on käytössä
app.use('/api/blogs', blogsRouter)

// Viimeiseksi väärä-url ja virheiden käsittely, jos
// oikeaa routea ei löytynyt tai heitettiin virhe
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
