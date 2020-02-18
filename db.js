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
  //await deleteAuthor(authors[0].id);

  // await createProduct('Foo Product One', fooCategory.id);
  // await createProduct('Foo Product Two', fooCategory.id);
  //console.log(categories[0].id);
  //console.log(await readAuthor(authors[0].id));
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

sync();
