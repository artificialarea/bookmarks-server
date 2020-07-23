require('dotenv').config()
const express = require('express')
const xss = require('xss');
const { isWebUri } = require('valid-url')
const logger = require('../middleware/logger')

const knex = require('knex')
const BookmarksService = require('./bookmarks-service')

const router = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    description: xss(bookmark.description),
    rating: Number(bookmark.rating),
})

router
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
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

        if (!(rating >= 1 && rating <= 5)) {
            return res.status(400).send(`'rating' must be a number between 0 and 5`) 
        }

        if (!isWebUri(url)) {
            logger.error(`Invalid url ${url} supplied`);
            return res.status(400).send(`'url' must be a valid URL`) 
        }

        BookmarksService.insertBookmark(knexInstance, newBookmark)
            .then(bookmark => {
                res .status(201)
                    .location(`/bookmarks/${bookmark.id}`)
                    .json(serializeBookmark(bookmark))
            })
            .catch(next)
    })


router
    .route('/:id')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db');
        const { id } = req.params;
        BookmarksService.getById(knexInstance, id)
            .then(bookmark => {
                if (!bookmark) {
                    logger.error(`Bookmark with id ${id} not found.`)
                    return res.status(404).json({
                        error: { message: `Bookmark Not Found`}
                    })
                  }
                
                res.bookmark = bookmark // save the bookmark for the next middleware test
                next() // don't forget to  call next so the next middleware test happens!
            })
            .catch(next)

    })
    .get((req, res, next) => {
        res.json(serializeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
        BookmarksService.deleteBookmark(
            req.app.get('db'), 
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })


module.exports = router