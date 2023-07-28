process.env.NODE_ENV = 'test';
const request = require('supertest');
const db = require('../db');
const app = require('../app');
let books;


beforeEach(async function() {
  const results = await db.query(`INSERT INTO books(isbn, amazon_url, author, language, pages, publisher, title, year)VALUES('41325598', 'amazon.com/123', 'Freida McFadden', 'English', 200, 'Kindle', 'The Housemaid', 2015),
  ('314232', 'amazon.com/234', 'Malcolm Totl', 'Spanish', 250, 'Armada', 'The Tyrant', 2012) RETURNING isbn, amazon_url, author, language, pages, publisher, title, year`);
  books = results.rows;
});

afterEach(async function() {
  await db.query('DELETE FROM books')
})

describe('GET /books', function() {
  test("Gets all the books", async function() {
    const res = await request(app).get('/books');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({books: books})
  })
});


describe('GET /books/:id', function() {
  test('should get one book', async function() {
    const resp = await request(app).get('/books/314232');
    expect(resp.status).toEqual(200);
    expect(resp.body).toEqual({book: resp.body.book})
  })
})



afterAll(async () => {
  await db.end()
})