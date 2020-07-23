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
            const testBookmarks = fixtures.makeBookmarksArray();
            const secondBookmark = testBookmarks[1];
            return supertest(app)
                .get(`/bookmarks/${secondBookmark.id}`)
                .expect(401, { error: 'Unauthorized request' })
        });

        it(`responds with 401 Unauthorized for DELETE /bookmarks/:id`, () => {
            const testBookmarks = fixtures.makeBookmarksArray();
            const secondBookmark = testBookmarks[1];
            return supertest(app)
                .delete(`/bookmarks/${secondBookmark.id}`)
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
                    .expect(404, { error: { message: `Bookmark Not Found`} })
            });
        });

        context(`Given no bookmarks in database`, () => {

            it(`responds 404 when bookmark doesn't exist`, () => {
                return supertest(app)
                    .get(`/bookmarks/123`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: { message: `Bookmark Not Found`} })
            });
        });

    });

    describe('DELETE /bookmarks/:id', () => {

        context(`Given there are bookmarks in the database`, () => {

            const testBookmarks = fixtures.makeBookmarksArray();

            beforeEach(`insert bookmarks`, () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })
        
            it('responds with 204 and removes bookmark', () => {
                const idToRemove = 2;
                const expectedBookmarks = testBookmarks.filter(b => b.id !== idToRemove);
                return supertest(app)
                    .delete(`/bookmarks/${idToRemove}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                            .get(`/bookmarks`)
                            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(expectedBookmarks)
                    })
            });
        });

        context(`Given no articles`, () => {
            
            it(`responds with 404`, () => {
                return supertest(app)
                .delete(`/bookmarks/123456`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, { error: { message: `Bookmark Not Found`} })
            });

        })
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