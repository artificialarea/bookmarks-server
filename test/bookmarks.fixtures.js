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

function makeMaliciousBookmark() {
    const maliciousBookmark = {
        id: 911,
        title: 'Naughty naughty <script>alert("xss");</script>',
        url: 'https://www.hackers.com',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        rating: 1,
    }
    const expectedBookmark = {
        ...maliciousBookmark,
        // middleware converts script to plaintext to render it inert
        title: 'Naughty naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        // middleware removes onerror="alert(document.cookie);" 
        description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    }
    return {
        maliciousBookmark,
        expectedBookmark,
    }
}

module.exports = {
    makeBookmarksArray,
    makeMaliciousBookmark,
};