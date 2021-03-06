INSERT INTO bookmarks (title, url, description, rating)
VALUES 
    ('Thinkful',                    'https://www.thinkful.com', 'Think outside the classroom', '5'),
    ('Google',                      'https://www.google.com', 'Where we find everything else', '4'),
    ('MDN',                         'https://developer.mozilla.org', 'The only place to find web documentation', '5'),
    ('JEST: Setup and Teardown',    'https://jestjs.io/docs/en/setup-teardown', 're: testing with a database', '4'),
    ('GIPHY',                       'https://giphy.com/', 'humorous gif animes', '5'),
    ('Medium',                      'https://medium.com/', 'the überblog', '4'),
    ('Learn * Series',              'http://casts.thinkfullabs.com/', 'videos to supplement curriculum', '4'),
    ('JustJavascript',              'https://justjavascript.com/', 'alternative mental model for JS', '4'),
    ('Eloquent Javascript',         'https://eloquentjavascript.net/05_higher_order.html', 'Higher-Order Functions chapter (still need to read)', '4'),
    ('TJ''s Support Guide',         'https://www.notion.so/aee7a218eaab4f74b8289be7c056f574?v=bfd1ef54434e4646a811b3021301f6a7', 'this fella is a thinkful mentor', '4')
;

-- then $ psql -U dunder_mifflin -d bookmarks -f ./seeds/seed.bookmarks.sql
-- then $ psql -U dunder_mifflin -d bookmarks-test -f ./seeds/seed.bookmarks.sql