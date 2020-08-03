# Bookmarks Server

<br />

## Checkpoint 20 exercise

per: https://courses.thinkful.com/node-postgres-v1/checkpoint/20#full-stack-bookmarks

### Alterations to fix `npm run migrate:production` issue (again) !!!

During the checkpoint walk-thru I had the same heroku `npm run migrate:production` issue as before with my Blogful-api =/ [See Blogful README for additional context from ThinkChat help...](https://github.com/artificialarea/blogful-api/blob/master/README.md)

**Updates required:**

**1. `packgage.json "scripts"`**
* Update, per ThinkChat suggestion:
`"migrate:production": "env SSL=true NODE_TLS_REJECT_UNAUTHORIZED=0 DATABASE_URL=$(heroku config:get DATABASE_URL) npm run migrate"`
* Alternatively (didn't work): `"migrate:production": "env SSL=true DATABASE_URL=$(heroku config:get DATABASE_URL) npm run migrate"`

**2. `postgrator-config.js`**
* Add `"ssl": !!process.env.SSL` to the `module.export` properties.



<br />
<br />

<hr />

**pair: Alen + Sacha**

## Checkpoint 17 assignment

per: https://courses.thinkful.com/node-postgres-v1/checkpoint/17#assignment

**branch: checkpoint-17**

**[Thinkful solutions...](https://courses.thinkful.com/node-postgres-v1/checkpoint/17#solution)**


<br />


## Checkpoint 16 assignment

per: https://courses.thinkful.com/node-postgres-v1/checkpoint/16#assignment

**branch: checkpoint-16**

**[thinkful solution...](https://github.com/Thinkful-Ed/bookmarks-server/tree/post-delete-postgres-example-solution)**

<br />


## Checkpoint 15 assignment

per: https://courses.thinkful.com/node-postgres-v1/checkpoint/15#assignment

**branch: checkpoint-15**

**[thinkful solution...](https://github.com/Thinkful-Ed/bookmarks-server/tree/db-with-express-example-solution)**

<br />

## Checkpoint 10 assignment
per: https://courses.thinkful.com/node-postgres-v1/checkpoint/10#assignment

**branch: checkpoint-10** 
_... plus associated branch 'test-to-fail' for git diff purposes._

**[thinkful solution...](https://github.com/Thinkful-Ed/bookmarks-server/tree/trello-assignment-example-solution)**

:boom:&nbsp;:sweat_drops:&nbsp;:confused:&nbsp; **[SEE TROUBLESHOOTING SOLUTION FOOTNOTES HERE...](https://github.com/artificialarea/bookmarks-server/blob/checkpoint-10/test/app.spec.js)** :shit:
