require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const validateBearerToken = require('./middleware/validateBearerToken')
const fourOhFourErrorHandler = require('./middleware/fourOhFourErrorHandler')
const serverErrorHandler = require('./middleware/serverErrorHandler')

const { NODE_ENV } = require('./config')
const bookmarksRouter = require('./routes/bookmarks.router')

const app = express()

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'dev'))
app.use(helmet())
app.use(cors())
app.use(validateBearerToken)

app.use('/bookmarks', bookmarksRouter)

app.use(fourOhFourErrorHandler)
app.use(serverErrorHandler)


module.exports = app