const config = require('./utils/config')
const express = require('express')
const app = express()

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch(error => {
    logger.error('Error connection to MongoDB:', error.message)
  })

// Ennen routeja rekisteröidään käyttöön:
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

// Sitten routet mukaan, kun ylläolevat on käytössä
app.use('/api/login', loginRouter)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)

// Viimeiseksi väärä-url ja virheiden käsittely, jos
// oikeaa routea ei löytynyt tai heitettiin virhe
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
