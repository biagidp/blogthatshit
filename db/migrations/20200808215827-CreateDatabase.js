require('dotenv').config()
const db = require('../index')

const query = `CREATE DATABASE blogthatshit_${process.env.NODE_ENV}`

db.query(query)
  .then(res => console.log(res))
  .catch(err => console.log(err))


