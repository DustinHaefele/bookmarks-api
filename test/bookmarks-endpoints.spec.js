require('dotenv').config();
const knex = require('knex');
const app = require('../src/app');
const supertest = require('supertest');
const { makeBookmarksArray } = require('./bookmarks.fixture');

describe('Bookmark Endpoints', () => {
  let db;

  before('make db instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after(() => db.destroy());

  before(() => db('bookmarks').truncate());

  context('table has data', () => {
    const testData = makeBookmarksArray();
    const seedData = testData.map(obj => {
      return {
        title: obj.title,
        url: obj.url,
        description: obj.description,
        rating: obj.rating
      };
    });

    beforeEach(() => {
      return db('bookmarks').insert(seedData);
    });
    afterEach('empty table after each test', () => {
      return db('bookmarks').truncate();
    });

    it('gets all bookmarks', () => {
      return supertest(app)
        .get('/api/bookmarks')
        .expect(200, testData);
    });

    it('gets correct bookmark at /api/bookmarks/:id', () => {
      const id = 3;
      const bm = testData[id - 1];
      return supertest(app)
        .get(`/api/bookmarks/${id}`)
        .expect(200, bm);
    });

    it('POST inserts bm and gives it an id', () => {
      const newBm = {
        title: 'my Test site',
        url: 'https://www.testing123.com',
        rating: 3,
        description: 'This is my test Description'
      };

      return supertest(app)
        .post('/api/bookmarks')
        .send(newBm)
        .expect(201)
        .expect(res => {

          expect(res.body.title).to.eql(newBm.title);
          expect(res.body.url).to.eql(newBm.url);
          expect(res.body.description).to.eql(newBm.description);
          expect(res.body.rating).to.eql(newBm.rating);
        })
        .then(postRes => {

          return supertest(app)
            .get(`/api/bookmarks/${postRes.body.id}`)
            .expect(postRes.body);
        });
    });

    it('DELETE id given', () => {
      const id = 3;
      const expected = testData.filter(bm => bm.id !== id);
      return supertest(app)
        .delete(`/api/bookmarks/${id}`)
        .expect(204)
        .then(() => {
          return supertest(app)
            .get('/api/bookmarks')
            .then(res => {
              expect(res.body).to.eql(expected);
            });
        });
    });

    it('DELETE return 404 not found if id not present', () => {
      const id = 123424;
      return supertest(app)
        .delete(`/api/bookmarks/${id}`)
        .expect(404);
    });
  describe.only('PATCH',() =>{
    
    it('updates data at id, only updates provided fields', () => {
      const updatedData = {
        title: 'my New Title',
        description: 'my new description'
      };

      const id = 2;

      const expected = {
        ...testData[1],
        ...updatedData
      };

      return supertest(app)
        .patch(`/api/bookmarks/${id}`)
        .send(updatedData)
        .expect(204)
        .then(() => {
          return supertest(app)
            .get(`/api/bookmarks/${id}`)
            .expect(expected);
        });
    });

    it('responds with 404 if no id provided',()=>{
      const id = 12345;

      const updatedData = {
        title: 'my New Title',
        description: 'my new description'
      };

      return supertest(app)
        .patch(`/api/bookmarks/${id}`)
        .send(updatedData)
        .expect(404);
    });

    it('responds with 400 if it has no correct fields',()=>{
      const updatedData = {
        foo: 'bizz',
        bar: 'bang'
      };

      const id = 2;

      const expected = {
        ...testData[1],
      };

      return supertest(app)
        .patch(`/api/bookmarks/${id}`)
        .send(updatedData)
        .expect(400)
        .then(() => {
          return supertest(app)
            .get(`/api/bookmarks/${id}`)
            .expect(expected);
        });
    });
    })

  })
    

  context('table has no data', () => {
    afterEach(() => db('bookmarks').truncate());

    it('POST inserts bm and gives it an id', () => {
      const newBm = {
        title: 'my Test site',
        url: 'https://www.testing123.com',
        rating: 3,
        description: 'This is my test Description'
      };

      return supertest(app)
        .post('/api/bookmarks')
        .send(newBm)
        .expect(201)
        .expect(res => {

          expect(res.body.title).to.eql(newBm.title);
          expect(res.body.url).to.eql(newBm.url);
          expect(res.body.description).to.eql(newBm.description);
          expect(res.body.rating).to.eql(newBm.rating);
        })
        .then(postRes => {

          return supertest(app)
            .get(`/api/bookmarks/${postRes.body.id}`)
            .expect(postRes.body);
        });
    });

    it('sanitizes POST', () => {
      const newBm = {
        title: 'my Test site',
        url: 'https://www.testing123.com',
        rating: 3,
        description: "<img onerror='console.log(I'm a hack)'/>"
      };

      return supertest(app)
        .post('/api/bookmarks')
        .send(newBm)
        .expect(201)
        .expect(res => {

          expect(res.body.title).to.eql(newBm.title);
          expect(res.body.url).to.eql(newBm.url);
          expect(res.body.description).to.eql('<img />');
          expect(res.body.rating).to.eql(newBm.rating);
        });
    });

    it('gets [] when table empty', () => {
      return supertest(app)
        .get('/api/bookmarks')
        .expect(200, []);
    });

    it(' GET returns 404 if id not present', () => {
      const id = 3;
      return supertest(app)
        .get(`/api/bookmarks/${id}`)
        .expect(404);
    });
  });
});
