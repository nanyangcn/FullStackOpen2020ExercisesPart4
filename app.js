const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controller/blogs')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const morgan = require('morgan')

const connectMongoDb = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    logger.info('connected to MongoDB')
  } catch (error) {
    logger.error('error connection to MongoDB:', error.message)
  }
}
connectMongoDb()

app.use(cors())
app.use(express.json())
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('tiny'))
}
app.use('/api/blogs', blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
