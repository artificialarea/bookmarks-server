function makeBookmarksArray() {
    return [
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
}

module.exports = {
    makeBookmarksArray,
};