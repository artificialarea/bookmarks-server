require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const winston = require('winston')
const { bookmarks } = require('../store')
const { v4: uuid } = require('uuid')


const app = express()

const morganOption = (NODE_ENV === 'production') 
  ? 'tiny' 
  : 'dev';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json());

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'info.log' })
  ]
});

if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

app.get('/bookmarks', (req, res) => {
  res.send(bookmarks)
})

app.get('/bookmarks/:id', (req, res) => {
  const { id } = req.params

  const bookmark = bookmarks.find(b => b.id == id)
  
  if(!bookmark){
    logger.error(`Bookmark with id: ${id} not found`)
    return res.status(404).send('bookmark not found')
  }
  res.status(200).json(bookmark)
})

app.post('/bookmarks', (req, res) =>{
  const { title, url, description, rating = 1 } = req.body

  if(!title){
    return res.status(400).send('Invalid! title required.')
  }
  if(!url){
    return res.status(400).send('Invalid! url required.')
  }
  if(!description){
    return res.status(400).send('Invalid! description required.')
  }
  const id = uuid();

  const bookmark ={
    id,
    title,
    url,
    description,
    rating
  }
  bookmarks.push(bookmark)
  logger.info(`Bookmark with id: ${id} created.`)
  // res.status(204).end()
  res
   .status(201)
   .location(`http//localhost:8000/bookmarks/${id}`)
   .json(bookmark)
})

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app