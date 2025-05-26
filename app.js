const config = require('./utils/config')
const express = require('express')
const app = express()

const blogsRouter = require('./controllers/blogs')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })

app.use(express.json())

app.use('/api/blogs', blogsRouter)

module.exports = app
