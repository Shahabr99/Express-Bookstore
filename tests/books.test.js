process.env.NODE_ENV = 'test';
const request = require('supertest');
const db = require('../db');
const app = require('../app');
let book_isbn;


beforeEach(async function() {
  const results = await db.query(`INSERT INTO books(isbn, amazon_url, author, language, pages, publisher, title, year)VALUES
  ('1', 'amazon.com/234', 'Malcolm Totl', 'Spanish', 250, 'Armada', 'The Tyrant', 2012) RETURNING isbn, amazon_url, author, language, pages, publisher, title, year`);
  book_isbn = results.rows[0].isbn;
});


afterEach(async function() {
  await db.query('DELETE FROM books')
})


describe('GET /books', function() {
  test("Gets all the books", async function() {
    const res = await request(app).get('/books');
    const books = res.body.books;
    expect(res.statusCode).toEqual(200);
    expect(books[0].isbn).toEqual("1");
    expect(books[0]).toHaveProperty("isbn")
    expect(books).toHaveLength(1)
  })
});


describe('GET /books/:isbn', function() {
  test('should get one book', async function() {
    const resp = await request(app).get(`/books/${book_isbn}`);
    const book = resp.body.book;
    expect(resp.statusCode).toEqual(200);
    expect(book).toHaveProperty("isbn");
    expect(book.title).toEqual("The Tyrant")
  })
})

describe("POST /books", function() {
  test("should add a new book", async function() {
    const resp = await request(app).post('/books').send({
      isbn: '32794782',
      amazon_url: "https://taco.com",
      author: "mctest",
      language: "english",
      pages: 1000,
      publisher: "yeah right",
      title: "amazing times",
      year: 2000
    })
    expect(resp.statusCode).toBe(201);
    expect(resp.body.book).toHaveProperty('isbn')
  })
})


describe("PUT /books/:id", function () {
  test("Updates a single book", async function () {
    const response = await request(app)
        .put(`/books/${book_isbn}`)
        .send({
          amazon_url: "https://taco.com",
          author: "mctest",
          language: "english",
          pages: 1000,
          publisher: "yeah right",
          title: "UPDATED BOOK",
          year: 2000
        });
    expect(response.body.book).toHaveProperty("isbn");
    expect(response.body.book.title).toBe("UPDATED BOOK");
  });

  test("Prevents a bad book update", async function () {
    const response = await request(app)
        .put(`/books/${book_isbn}`)
        .send({
          isbn: "32794782",
          badField: "DO NOT ADD ME!",
          amazon_url: "https://taco.com",
          author: "mctest",
          language: "english",
          pages: 1000,
          publisher: "yeah right",
          title: "UPDATED BOOK",
          year: 2000
        });
    expect(response.statusCode).toBe(400);
  });
  test("Responds 404 if can't find book in question", async function () {
    // delete book first
    await request(app)
        .delete(`/books/${book_isbn}`)
    const response = await request(app).delete(`/books/${book_isbn}`);
    expect(response.statusCode).toBe(404);
  });
});

afterAll(async () => {
  await db.end()
})