const db = require('../index')

const query = `CREATE TABLE users(id SERIAL, username VARCHAR(255), email VARCHAR(255), hashedPassword VARCHAR(255), uuid VARCHAR(255))`

db.query(query)
  .then(res => console.log(res))
  .catch(err => console.log(err))