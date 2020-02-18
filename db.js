const pg = require('pg');
const uuid = require('uuid');
const { Client } = pg;

const client = new Client('postgres://localhost/article_author_db');

client.connect();

//CRUD
const sync = async () => {
  const SQL = `
    DROP TABLE IF EXISTS articles;
    DROP TABLE IF EXISTS authors;

    CREATE TABLE authors(
      id UUID PRIMARY KEY,
      first_name VARCHAR,
      last_name VARCHAR,
      date_created TIMESTAMP default CURRENT_TIMESTAMP
    );

    CREATE TABLE articles(
      id UUID PRIMARY KEY,
      title VARCHAR,
      body VARCHAR,
      date_created TIMESTAMP default CURRENT_TIMESTAMP,
      author_id UUID REFERENCES authors(id)
    );
    --INSERT INTO authors(id, first_name, last_name) values('${uuid()}', 'Chaise', 'Matev');
  `;
  await client.query(SQL);
  const author = await createAuthor('Chaise', 'Matev');
  const author2 = await createAuthor('David', 'Brodie');
  // console.log(author, author2);

  const authors = await readAuthors();

  //console.log(authors);
  const authorChaise = authors.find(author => author.first_name === 'Chaise');
  authorChaise.first_name = 'CHAISE';

  //console.log(await updateAuthor(authorChaise));

  //console.log(authorChaise.id);
  //await deleteAuthor(authors[0].id);
  //console.log(await readAuthor(authors[0].id));

  await createArticle('Fullstack', 'Its the body', authorChaise.id);
  await createArticle('Another Title', 'another body', authorChaise.id);

  const articles = await readArticles();
  //console.log(articles);
  //console.log(categories[0].id);
  const upArticle = articles.find(article => article.title === 'Fullstack');
  upArticle.body = 'New body for me';
  console.log(await updateArticle(upArticle));
};

const readAuthors = async () => {
  const SQL = 'SELECT * FROM authors';
  const response = await client.query(SQL);
  return response.rows;
};

const readAuthor = async id => {
  const SQL = 'SELECT * FROM authors WHERE id=$1';
  const response = await client.query(SQL, [id]);
  return response.rows[0];
};

const createAuthor = async (first_name, last_name) => {
  const SQL =
    'INSERT INTO authors(id, first_name, last_name) values($1, $2, $3) returning *';
  const response = await client.query(SQL, [uuid(), first_name, last_name]);
  return response.rows[0];
};

const updateAuthor = async author => {
  const SQL =
    'UPDATE authors set first_name=$1, last_name=$2 where id=$3 returning *';
  const response = await client.query(SQL, [
    author.first_name,
    author.last_name,
    author.id,
  ]);
  return response.rows[0];
};

const deleteAuthor = async id => {
  const SQL = 'DELETE FROM authors WHERE id=$1';
  await client.query(SQL, [id]);
};

//Articles DB

const readArticles = async () => {
  const SQL = 'SELECT * FROM articles';
  const response = await client.query(SQL);
  return response.rows;
};

const readArticle = async id => {
  const SQL = 'SELECT * FROM articles WHERE id=$1';
  const response = await client.query(SQL, [id]);
  return response.rows[0];
};

const createArticle = async (title, body, authorId) => {
  const SQL =
    'INSERT INTO articles(id, title, body, author_id) values($1, $2, $3, $4) returning *';
  const response = await client.query(SQL, [uuid(), title, body, authorId]);
  return response.rows[0];
};

const updateArticle = async article => {
  const SQL =
    'UPDATE articles set title=$1, body=$2, author_id=$3 where id=$4 returning *';
  const response = await client.query(SQL, [
    article.title,
    article.body,
    article.author_id,
    article.id,
  ]);
  return response.rows[0];
};

const deleteArticle = async id => {
  const SQL = 'DELETE FROM article WHERE id=$1';
  await client.query(SQL, [id]);
};

//sync();

module.exports = {
  sync,
  readAuthors,
  readAuthor,
  updateAuthor,
  deleteAuthor,
  readArticles,
  readArticle,
  updateArticle,
  deleteArticle,
};
