require('dotenv').config()
const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('../middleware/logger')
const store = require('../store')

const knex = require('knex')
const BookmarksService = require('../bookmarks-service')

const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL,
})

const router = express.Router()
const bodyParser = express.json()




router
    .route('/')
    .get((req, res, next) => {
        // res.json(store.bookmarks)

        const knexInstance = req.app.get('db')

        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks)
            })
            .catch(next)
            
    })
    .post(bodyParser, (req, res) => {
        const { title, url, description, rating = 1 } = req.body

        if (!title) {
            return res.status(400).send(`'title' is required`)
        }
        if (!url) {
            return res.status(400).send(`'url' is required`)
        }
        if (!description) {
            return res.status(400).send(`'rating' is required`)
        }

        const id = uuid();
        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        }
        store.bookmarks.push(bookmark)
        logger.info(`Bookmark with id: ${id} created.`)

        // res.status(204).end()
        res
            .status(201)
            .location(`http//localhost:8000/store.bookmarks/${id}`)
            .json(bookmark)
    })


router
    .route('/:id')
    .get((req, res) => {
        const { id } = req.params
        const bookmark = store.bookmarks.find(b => b.id == id)

        if (!bookmark) {
            logger.error(`Bookmark with id: ${id} not found`)
            return res.status(404).send('Bookmark Not Found')
        }
        res.status(200).json(bookmark)
    })
    .delete((req, res) => {
        const { id } = req.params
        const bookmarkIndex = store.bookmarks.findIndex(b => b.id == id)

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id: ${id} not found`)
            return res.status(404).send('Bookmark Not Found')
        }
        store.bookmarks.splice(bookmarkIndex, 1)
        logger.info(`Bookmark with id: ${id} deleted`)
        res.status(204).end()
    })


module.exports = router