const db = require('./db');

db.sync().then(async () => {
  console.log(await db.readAuthors());
});
