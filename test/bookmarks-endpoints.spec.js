const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const supertest = require('supertest');
const fixtures = require('./bookmarks.fixtures');

describe.only('Bookmark Endpoints (bookmarks-endpoints-spec.js)', () => {

    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('clean the table', () => db('bookmarks').truncate());
    afterEach('cleanup', () => db('bookmarks').truncate());

    context(`Given 'bookmarks' database and table has data`, () => {

        const testBookmarks = fixtures.makeBookmarksArray();

        beforeEach('insert bookmarks', () => {
            return db
                .into('bookmarks')
                .insert(testBookmarks)
        });

        it(`GET /bookmarks responds with 200 and all of the bookmarks`, () => {
            return supertest(app)
                .get('/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)  // via setup.js
                .expect(200, testBookmarks)
        
        });

        it(`GET /bookmarks/:id responds with 200 and the specified bookmark`, () => {
            const bookmarkId = 3;
            const expectedBookmark = testBookmarks[bookmarkId - 1];
            // console.log(expectedBookmark)
            return supertest(app)
                .get(`/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, expectedBookmark)
        });

        it(`GET /bookmarks/:id responds 404 when bookmark doesn't exist`, () => {
            return supertest(app)
                .get(`/bookmarks/123`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, `Bookmark Not Found`)
        })

    });

    context(`Given no bookmarks in database`, () => {

        it(`GET /bookmarks responds with 200 and an empty list`, () => {
            return supertest(app)
                .get(`/bookmarks`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, [])
        });

        it(`GET /bookmarks/:id responds 404 when bookmark doesn't exist`, () => {
            return supertest(app)
                .get(`/bookmarks/123`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, `Bookmark Not Found`)
        })
    })


});