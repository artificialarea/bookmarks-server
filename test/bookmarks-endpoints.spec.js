const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const supertest = require('supertest');

describe.only('Bookmark Endpoints', () => {

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

    context('Given there are bookmarks in the database', () => {

        let testBookmarks = [
            {
                id: 1,
                title: 'Bookmark Test One',
                url: 'https://giphy.com/',
                description: 'humerous gif animes',
                rating: 5,
            },
            {
                id: 2,
                title: 'Bookmark Test Two',
                url: 'https://medium.com/',
                description: '',                // intentionally left blank, as not required
                rating: 4,
            },
            {
                id: 3,
                title: 'Bookmark Test Three',
                url: 'http://casts.thinkfullabs.com/',
                description: 'complementary to curriculum',
                rating: 3,
            },
        ];

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

        it(`GET /bookmarks/:bookmark_id responds with 200 and the specified bookmark`, () => {
            const bookmarkId = 3;
            const expectedBookmark = testBookmarks[bookmarkId - 1];
            // console.log(expectedBookmark)
            return supertest(app)
                .get(`/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, expectedBookmark)
        });

    });

});