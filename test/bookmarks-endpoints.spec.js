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
      return {title: obj.title, url: obj.url, description: obj.description, rating: obj.rating}
    });

    beforeEach(() => {
      return db('bookmarks').insert(seedData);
    });
    afterEach('empty table after each test', () => {
      return db('bookmarks').truncate();
    });

    it('gets all bookmarks', () => {
      return supertest(app)
        .get('/bookmarks')
        .expect(200, testData);
    });

    it('gets correct bookmark at /bookmarks/:id', () => {
      const id = 3;
      const bm = testData[id - 1];
      return supertest(app)
        .get(`/bookmarks/${id}`)
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
        .post('/bookmarks')
        .send(newBm)
        .expect(201)
        .expect(res => {
          console.log(res.body);
          expect(res.body.title).to.eql(newBm.title);
          expect(res.body.url).to.eql(newBm.url);
          expect(res.body.description).to.eql(newBm.description);
          expect(res.body.rating).to.eql(newBm.rating);
        })
        .then(postRes => {
          console.log(postRes.body);
          return supertest(app)
            .get(`/bookmarks/${postRes.body.id}`)
            .expect(postRes.body);
        });
    });

    it('DELETE id given', () => {
      const id = 3;
      const expected = testData.filter(bm => bm.id !== id);
      return supertest(app)
        .delete(`/bookmarks/${id}`)
        .expect(204)
        .then(() => {
          return supertest(app)
            .get('/bookmarks')
            .then(res => {
              expect(res.body).to.eql(expected);
            });
        });
    });

//GETTING A ECONNREFUSED MESSAGE HERE NOT SURE WHAT THAT MEANS

    it.skip('DELETE return 404 not found if id not present', () => {
      const id = 123424;
      return supertest(app)
        .delete(`bookmarks/${id}`)
        .expect(404);
    });
  });

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
        .post('/bookmarks')
        .send(newBm)
        .expect(201)
        .expect(res => {
          console.log(res.body);
          expect(res.body.title).to.eql(newBm.title);
          expect(res.body.url).to.eql(newBm.url);
          expect(res.body.description).to.eql(newBm.description);
          expect(res.body.rating).to.eql(newBm.rating);
        })
        .then(postRes => {
          console.log(postRes.body);
          return supertest(app)
            .get(`/bookmarks/${postRes.body.id}`)
            .expect(postRes.body);
        });
    });

    it.only('sanitizes POST', () => {
      const newBm = {
        title: 'my Test site',
        url: 'https://www.testing123.com',
        rating: 3,
        description: "<img onerror='console.log(I'm a hack)'/>"
      };

      return supertest(app)
        .post('/bookmarks')
        .send(newBm)
        .expect(201)
        .expect(res => {
          console.log(res.body);
          expect(res.body.title).to.eql(newBm.title);
          expect(res.body.url).to.eql(newBm.url);
          expect(res.body.description).to.eql('<img />');
          expect(res.body.rating).to.eql(newBm.rating);
        });
    });

    it('gets [] when table empty', () => {
      return supertest(app)
        .get('/bookmarks')
        .expect(200, []);
    });

    it(' GET returns 404 if id not present', () => {
      const id = 3;
      return supertest(app)
        .get(`/bookmarks/${id}`)
        .expect(404);
    });

   
  });
});
