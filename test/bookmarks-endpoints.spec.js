const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const supertest = require('supertest');
const fixtures = require('./bookmarks.fixtures');

const store = require('../src/store') // TODO: remove when updating POST and DELETE to database
// NOTE 
// at this stage of this assignment, app will be using a mix of both the database and in-memory JavaScript storage.
// GET requests refactored to fetch from bookmarks database
// POST, DELETE remain associated with store.bookmarks for now.

// NOTE2: SEE TROUBLESHOOTING FOOTNOTES in describe.skip('Dupes...') for solution to odd testing issue with Mocha Hooks !!!!!!


describe.only('Bookmark Endpoints (bookmarks-endpoints-spec.js)', () => {

    let db;
    let bookmarksCopy; // TODO: refactor to use 'db' when updating POST and DELETE

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

    // TODO: refactor to use db when updating POST and DELETE
    beforeEach('copy the bookmarks', () => {
        // copy the bookmarks so we can restore them after testing
        bookmarksCopy = store.bookmarks.slice();
    });
    // TODO: refactor to use db when updating POST and DELETE
    afterEach('restore the bookmarks', () => {
        // restore the bookmarks back to original
        store.bookmarks = bookmarksCopy;
    });


    describe('Unauthorized requests', () => {

        it(`responds with 401 Unauthorized for GET /bookmarks`, () => {
            return supertest(app)
                .get('/bookmarks')
                .expect(401, { error: 'Unauthorized request' })
        });

        it(`responds with 401 Unauthorized for POST /bookmarks`, () => {
            return supertest(app)
                .post('/bookmarks')
                .send({ title: 'test-title', url: 'http://some.thing.com', description: 'lorem-ipsum', rating: 1 })
                .expect(401, { error: 'Unauthorized request' })
        });

        it(`responds with 401 Unauthorized for GET /bookmarks/:id`, () => {
            const secondBookmark = store.bookmarks[1];
            return supertest(app)
                .get(`/bookmarks/${secondBookmark.id}`)
                .expect(401, { error: 'Unauthorized request' })
        });

        it(`responds with 401 Unauthorized for DELETE /bookmarks/:id`, () => {
            const aBookmark = store.bookmarks[1];
            return supertest(app)
                .delete(`/bookmarks/${aBookmark.id}`)
                .expect(401, { error: 'Unauthorized request' })
        });
    });


    describe(`GET /bookmarks`, () => {

        context(`Given 'bookmarks' database and table has data`, () => {

            const testBookmarks = fixtures.makeBookmarksArray();
    
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            });
    
            it(`responds with 200 and all of the bookmarks`, () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)  // via setup.js
                    .expect(200, testBookmarks)
            });
        });

        context(`Given no bookmarks in database`, () => {

            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get(`/bookmarks`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, [])
            });
        });
    
    });

    describe(`GET /bookmarks/:id`, () => {
        
        context(`Given 'bookmarks' database and table has data`, () => {

            const testBookmarks = fixtures.makeBookmarksArray();
    
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            });
    
            it(`responds with 200 and the specified bookmark`, () => {
                const bookmarkId = 3;
                const expectedBookmark = testBookmarks[bookmarkId - 1];
                // console.log(expectedBookmark)
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, expectedBookmark)
            });
    
            it(`responds 404 when bookmark doesn't exist`, () => {
                return supertest(app)
                    .get(`/bookmarks/123`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, `Bookmark Not Found`)
            });
        });

        context(`Given no bookmarks in database`, () => {

            it(`responds 404 when bookmark doesn't exist`, () => {
                return supertest(app)
                    .get(`/bookmarks/123`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, `Bookmark Not Found`)
            });
        });

    });


    describe('DELETE /bookmarks/:id', () => {

        it.skip('removes the bookmark by ID from the store', () => {
            const secondBookmark = store.bookmarks[1];
            const expectedBookmarks = store.bookmarks.filter(s => s.id !== secondBookmark.id);
            return supertest(app)
                .delete(`/bookmarks/${secondBookmark.id}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(204)
                .then(() => {
                    expect(store.bookmarks).to.eql(expectedBookmarks)
                })
        });

        it(`returns 404 when bookmark doesn't exist`, () => {
            return supertest(app)
                .delete(`/bookmarks/doesnt-exist`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, 'Bookmark Not Found')
        });
    });

    describe('POST /bookmarks', () => {

        it.skip(`responds with 400 invalid 'rating' if not between 0 and 5`, () => {
            const newBookmarkInvalidRating = {
                title: 'test-title',
                url: 'https://test.com',
                rating: 'invalid',
            };
            return supertest(app)
                .post(`/bookmarks`)
                .send(newBookmarkInvalidRating)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, `'rating' must be a number between 0 and 5`)
        });

        it.skip(`responds with 400 invalid 'url' if not a valid URL`, () => {
            const newBookmarkInvalidUrl = {
                title: 'test-title',
                url: 'htp://invalid-url',
                rating: 1,
            };
            return supertest(app)
                .post(`/bookmarks`)
                .send(newBookmarkInvalidUrl)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, `'url' must be a valid URL`)
        });

        it('creates a new bookmark, responding with 201 and the new bookmark', () => {
            // console.log('test: POST /bookmarks')
            const newBookmark = {
                title: 'test-title',
                url: 'https://test.com',
                description: 'test description',
                rating: 1,
            };
            return supertest(app)
                .post(`/bookmarks`)
                .send(newBookmark)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.url).to.eql(newBookmark.url)
                    expect(res.body.description).to.eql(newBookmark.description)
                    expect(res.body.rating).to.eql(newBookmark.rating)
                    // expect(res.body).to.have.property('id')
                    expect(res.body.id).to.be.a('number')
                    expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
                })
                .then(postRes => {
                    console.log('postRes: ', postRes.body)
                    return supertest(app)
                        .get(`/bookmarks/${postRes.body.id}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(postRes.body)
                })
        });

        // DRY (don't repeat yourself) REFACTOR of validation tests
        const requiredFields = ['title', 'url', 'rating'];
        requiredFields.forEach(field => {
            const newBookmark = {
                title: 'test-title',
                url: 'https://test.com',
                rating: 1,
            };

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newBookmark[field]

                return supertest(app)
                    .post('/bookmarks')
                    .send(newBookmark)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(400, {
                        error: { message: `'${field}' is required`}
                    })
            });

        })
    });

});