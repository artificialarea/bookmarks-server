require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const validateBearerToken = require('./middleware/validate-bearer-token')
const errorHandlerFourOhFour = require('./middleware/error-handler-four-oh-four')
const errorHandler = require('./middleware/error-handler')

const { NODE_ENV } = require('./config')
const bookmarksRouter = require('./bookmarks/bookmarks.router')

const app = express()

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'dev'))
app.use(helmet())
app.use(cors())
app.use(validateBearerToken)

app.use('/api/bookmarks', bookmarksRouter)

app.use(errorHandlerFourOhFour)
app.use(errorHandler)


module.exports = app