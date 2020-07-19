const BookmarksService = {

    getAllBookmarks(knex) {
        return knex.select('*').from('bookmarks')
    },
    getById(knex, id) {
        return knex
            .from('bookmarks')
            .select('*')
            .where({ id })
            .first()
    },
    insertBookmark(knex, newBookmark) {
        return knex
            .insert(newBookmark)
            .into('bookmarks')
            .returning('*')
            .then(rows => { rows[0]})
    },
    deleteBookmark(knex, id) {
        return knex
            .from('bookmarks')
            .where({ id })
            .delete()
            // .then(
            //     console.log('required?')
            // )
            // ^^^^ Why .then() ? 
            // See FOOTNOTES in earlier repo: https://github.com/artificialarea/knex-practice/blob/master/src/blogful.js
    },
    updateBookmark(knex, id, newBookmarkFields) {
        return knex
            .from('bookmarks')
            .where({ id })
            .update(newBookmarkFields)
    },

};

module.exports = BookmarksService;