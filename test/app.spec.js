// walkthru per: https://github.com/Thinkful-Ed/bookmarks-server/blob/trello-assignment-example-solution/test/app.spec.js
// see also: https://jestjs.io/docs/en/setup-teardown

// SEE TROUBLESHOOTING FOOTNOTES for solution to testing issue !!!!!!


const app = require('../src/app')
const store = require('../src/store')


describe('Bookmark Endpoints (app.spec.js)', () => {
    // Pre-tests: Cyclical Setup and Teardown of store.bookmarks 

    let bookmarksCopy

    beforeEach('copy the bookmarks', () => {
        // console.log('store.bookmarks (beforeEach Test)', store.bookmarks)
        // copy the bookmarks so we can restore them after each test
        bookmarksCopy = store.bookmarks.slice() 
    })

    afterEach('restore the bookmarks', () => {
        // console.log('store.bookmarks (at end of test): ', store.bookmarks)
        // restore bookmarks to original for next test
        store.bookmarks = bookmarksCopy
        // console.log('store.bookmarks (restored to original afterEach test): ', store.bookmarks)
    })
    

    describe('Unauthorized requests', () => {
        it(`responds with 401 Unauthorized for GET /bookmarks`, () => {
            return supertest(app)
                .get('/bookmarks')
                .expect(401, { error: 'Unauthorized request' })
        })

        it(`responds with 401 Unauthorized for POST /bookmarks`, () => {
            return supertest(app)
                .post('/bookmarks')
                .send({ title: 'test-title', url: 'http://some.thing.com', description: 'lorem-ipsum', rating: 1 })
                .expect(401, { error: 'Unauthorized request' })
        })

        it(`responds with 401 Unauthorized for GET /bookmarks/:id`, () => {
            const secondBookmark = store.bookmarks[1]
            return supertest(app)
                .get(`/bookmarks/${secondBookmark.id}`)
                .expect(401, { error: 'Unauthorized request' })
        })

        it(`responds with 401 Unauthorized for DELETE /bookmarks/:id`, () => {
            const aBookmark = store.bookmarks[1]
            return supertest(app)
                .delete(`/bookmarks/${aBookmark.id}`)
                .expect(401, { error: 'Unauthorized request' })
        })
    })

    describe.skip('GET /bookmarks', () => { // REPLACED BY DB version
        it('gets the bookmarks from the store', () => {
            return supertest(app)
                .get('/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)  // via setup.js
                .expect(200, store.bookmarks)
        })
    })

    describe.skip('GET /bookmarks/:id', () => {     // REPLACED BY DB version
        it('gets the bookmark by ID from the store', () => {
            const secondBookmark = store.bookmarks[1]
            return supertest(app)
                .get(`/bookmarks/${secondBookmark.id}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, secondBookmark)
        })

        it(`returns 404 whe bookmark doesn't exist`, () => {
            return supertest(app)
                .get(`/bookmarks/doesnt-exist`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, 'Bookmark Not Found')
        })
    })

    describe('DELETE /bookmarks/:id', () => {
        it.skip('removes the bookmark by ID from the store', () => {
            const secondBookmark = store.bookmarks[1]
            const expectedBookmarks = store.bookmarks.filter(s => s.id !== secondBookmark.id)
            return supertest(app)
                .delete(`/bookmarks/${secondBookmark.id}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(204)
                .then(() => {
                    expect(store.bookmarks).to.eql(expectedBookmarks)
                })
        })

        it(`returns 404 when bookmark doesn't exist`, () => {
            return supertest(app)
                .delete(`/bookmarks/doesnt-exist`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, 'Bookmark Not Found')
        })
    })

    describe('POST /bookmarks', () => {

        it(`responds with 400 missing 'title' if not supplied`, () => {
            const newBookmarkMissingTitle = {
                // title: 'test-title',
                url: 'https://test.com',
                rating: 1,
            }
            return supertest(app)
                .post(`/bookmarks`)
                .send(newBookmarkMissingTitle)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, `'title' is required`)
        })

        it(`responds with 400 missing 'url' if not supplied`, () => {
            const newBookmarkMissingUrl = {
                title: 'test-title',
                // url: 'https://test.com',
                rating: 1,
            }
            return supertest(app)
                .post(`/bookmarks`)
                .send(newBookmarkMissingUrl)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, `'url' is required`)
        })

        it(`responds with 400 missing 'rating' if not supplied`, () => {
            const newBookmarkMissingRating = {
                title: 'test-title',
                url: 'https://test.com',
                // rating: 1,
            }
            return supertest(app)
                .post(`/bookmarks`)
                .send(newBookmarkMissingRating)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, `'rating' is required`)
        })

        it.skip(`responds with 400 invalid 'rating' if not between 0 and 5`, () => {
            const newBookmarkInvalidRating = {
                title: 'test-title',
                url: 'https://test.com',
                rating: 'invalid',
            }
            return supertest(app)
                .post(`/bookmarks`)
                .send(newBookmarkInvalidRating)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, `'rating' must be a number between 0 and 5`)
        })

        it.skip(`responds with 400 invalid 'url' if not a valid URL`, () => {
            const newBookmarkInvalidUrl = {
                title: 'test-title',
                url: 'htp://invalid-url',
                rating: 1,
            }
            return supertest(app)
                .post(`/bookmarks`)
                .send(newBookmarkInvalidUrl)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(400, `'url' must be a valid URL`)
        })

        it('POST /bookmarks adds a new bookmark to the store', () => {
            // console.log('test: POST /bookmarks')
            const newBookmark = {
                title: 'test-title',
                url: 'https://test.com',
                description: 'test description',
                rating: 1,
            }
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
                    expect(res.body.id).to.be.a('string')
                })
                .then(res => {
                    expect(store.bookmarks[store.bookmarks.length - 1]).to.eql(res.body)
                })
        })
    })


    describe.skip('Dupes of previously failing tests (that no longer fail thanks to Post-Script-2 solution)', () => {

    ////////////////////////////////////////////////////////////////////////////////////////////
    // TROUBLESHOOTING FOOTNOTES ///////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////

    // SITUATION (see branch: testing01_semi-failure)
    // Previously, bookmarks.router.js was like so ...
    // const { bookmarks } = require('../store') 
    // and all instances of store.bookmarks in router referenced via the variable 'bookmarks'
    //
    // So the 2nd+ unit test in this testing suite below would fail, whether it be DELETE or POST.
    
    // POST-SCRIPT-2 SOLUTION!!!!!!!!!
    ////////////////////////////////////////////////////////////////////////////////////////////
    // see git diff of bookmarks.router.js branches: 
    // https://github.com/artificialarea/bookmarks-server/compare/checkpoint-10...checkpoint-10-test-to-fail
    //
    // in bookmarks.router.js:
    // 1.
    // changed require/import of store from
    // const { bookmarks } = require('../store')
    // to
    // const store = require('../store')
    //
    // 2.
    // changed all instances of the variable bookmarks to store.bookmarks
    //
    // But *WHY* does this resolved the testing issue from earlier?
    // Well, Anthony Koch from Slack Techncial Support explains: 
    // "I think I got it. The POST and DELETE is mutating the array by adding or deleting a bookmark onto the array, respectively, which is why these lines exist:
    // beforeEach(() => { bookmarksCopy = store.bookmarks.slice() })
    // afterEach(() => { store.bookmarks = bookmarksCopy })
    // They reset the arrays back to the original items by making a new array with the same items. 
    // However, when you access the bookmarks through a variable —— like the following require: const { bookmarks } = require('../store') —— the bookmarks variable will always reference the original array that was created when the app started up.
    // When you access the bookmarks through the store, it will point to to the new, copied bookmarks array that you are creating in your beforeEach and afterEach.

        it('DELETE /bookmarks/:id removes the bookmark by ID from the store', () => {
            // console.log('test: DELETE /bookmarks/:id')
            const secondBookmark = store.bookmarks[1]
            const expectedBookmarks = store.bookmarks.filter(s => s.id !== secondBookmark.id)
            return supertest(app)
                .delete(`/bookmarks/${secondBookmark.id}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(204)
                .then(() => {
                    expect(store.bookmarks).to.eql(expectedBookmarks)
                })
        })

        // previously, this test would have failed
        it('POST /bookmarks adds a new bookmark to the store', () => {
            // console.log('test: POST /bookmarks')
            const newBookmark = {
                title: 'test-title',
                url: 'https://test.com',
                description: 'test description',
                rating: 1,
            }
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
                    expect(res.body.id).to.be.a('string')
                })
                .then(res => {
                    expect(store.bookmarks[store.bookmarks.length - 1]).to.eql(res.body)
                })
        })

        // dupe of first (successful) unit test again to demonstrate that previously, this test would have failed
        it('DELETE /bookmarks/:id removes the bookmark by ID from the store', () => {
            // console.log('test: DELETE /bookmarks/:id')
            const secondBookmark = store.bookmarks[1]
            const expectedBookmarks = store.bookmarks.filter(s => s.id !== secondBookmark.id)
            return supertest(app)
                .delete(`/bookmarks/${secondBookmark.id}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(204)
                .then(() => {
                    expect(store.bookmarks).to.eql(expectedBookmarks)
                })
        })
    })
});