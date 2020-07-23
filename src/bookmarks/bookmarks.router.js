require('dotenv').config()
const express = require('express')
const logger = require('../middleware/logger')

const knex = require('knex')
const BookmarksService = require('./bookmarks-service')

const router = express.Router()
const bodyParser = express.json()

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

        // DRY (don't repeat yourself) validation logic
        for (const [key, value] of Object.entries(newBookmark)) {
            if (value == null && key !== 'description') {
                return res.status(400).json({
                    error: { message: `'${key}' is required`}
                })
            }
        }

        BookmarksService.insertBookmark(knexInstance, newBookmark)
            .then(bookmark => {
                res .status(201)
                    .location(`/bookmarks/${bookmark.id}`)
                    .json(bookmark)
            })
            .catch(next)
    })


router
    .route('/:id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        const { id } = req.params;
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
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db');
        const { id } = req.params;
        BookmarksService.deleteBookmark(knexInstance, id)
            .then(bookmark => {
                if (!bookmark) {
                    logger.error(`Bookmark with id ${id} not found.`)
                    return res.status(404).send('Bookmark Not Found')
                }
                res.status(204).end()
            })
            .catch(next)
    })


module.exports = router