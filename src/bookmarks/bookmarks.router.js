require('dotenv').config()
const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('../middleware/logger')
const store = require('../store')

const knex = require('knex')
const BookmarksService = require('./bookmarks-service')

const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL,
})

const router = express.Router()
const bodyParser = express.json()

// NOTE 
// at this stage of this assignment, app will be using a mix of both the database and in-memory JavaScript storage.
// GET requests refactored to fetch from bookmarks database
// POST, DELETE remain associated with store.bookmarks for now.

router
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks)
            })
            .catch(next)

    })
    .post(bodyParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { title, url, description, rating } = req.body
        const newBookmark = { title, url, description, rating }

        if (!title) {
            return res.status(400).send(`'title' is required`)
        }
        if (!url) {
            return res.status(400).send(`'url' is required`)
        }
        if (!description) {
            return res.status(400).send(`'rating' is required`)
        }

        BookmarksService.insertBookmark(
            knexInstance,
            newBookmark
        )
            .then(bookmark => {
                console.log('bookmark: ', bookmark)
                res .status(201)
                    .location(`/bookmarks/${bookmark.id}`)
                    .json(bookmark)
            })
            .catch(next)
    })


router
    .route('/:id')
    .get((req, res, next) => {
        // res.json({ 'requested_id': req.params.bookmarks_id, this: 'should fail'})
        const knexInstance = req.app.get('db')
        const { id } = req.params
        BookmarksService.getById(knexInstance, id)
            .then(bookmark => {
                if (!bookmark) {
                    logger.error(`Bookmark with id ${id} not found.`)
                    return res.status(404).send('Bookmark Not Found')
                  }
                res.json(bookmark)
            })
            .catch(next)
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