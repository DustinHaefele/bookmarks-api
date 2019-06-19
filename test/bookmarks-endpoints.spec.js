const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const {makeBookmarksArray} = require('./bookmarks.fixture');

describe.only('Bookmark Endpoints',()=>{
  let db;

  before('make db instance', ()=>{
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db',db);
  });

  after(()=>db.destroy());

  before(()=> db('bookmarks').truncate());

  context('table has data',()=>{
    const testData = makeBookmarksArray();

    beforeEach(()=>{
      return db('bookmarks').insert(testData);
    });
    afterEach('empty table after each test', () => {
      return db('bookmarks').truncate();
    });

    it('gets all bookmarks', ()=>{
      return supertest(app)
        .get('/bookmarks')
        .expect(200, testData);
    });

    it('gets correct bookmark at /bookmarks/:id',() =>{
      const id = 3;
      const bm = testData[id -1];
      return supertest(app)
        .get(`/bookmarks/${id}`)
        .expect(200, bm);
    });
  });

  context('table has no data',()=>{
    beforeEach(()=> db('bookmarks').truncate());

    it('gets [] when table empty',()=>{
      return supertest(app).get('/bookmarks').expect(200,[]);
    });

    it('returns 404 if id not present',() =>{
      const id = 3;
      return supertest(app)
        .get(`/bookmarks/${id}`)
        .expect(404);
    });
  });
});