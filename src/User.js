const { v4: uuidv4 }  = require('uuid')
const db              = require('./../db')
const bcrypt          = require('bcrypt')

class User {
  constructor(params){
    params = params || {}
    this.username               = params['username'] || ''
    this.email                  = params['email'] || ''
    this.password               = params['password'] || ''
    this.passwordConfirmation   = params['passwordConfirmation'] || ''
    this.uuid                   = params['uuid'] || ''
    this.hashedpassword         = params['hashedpassword'] || ''
    this.id                     = params['id'] || ''
    this.errors=[]
  }

  create(){
    let sql = `INSERT INTO users(username, email, hashedpassword, uuid) 
                VALUES($1, $2, $3, $4)
              `
    let values = [
      this.username,
      this.email,
      this.hashedpassword,
      this.uuid
    ]
    db.query(sql, values)
  }

  //TODO: implement valid
  //TODO: change return for sucess/failure
  async signup() {
    //valid
    this.uuid = uuidv4()
    this.hashedpassword = await bcrypt.hash(this.password, 10)
    this.create()
  }

  //TODO: this should do stuff
  valid(){
    //username & email unique
    //password & confirmation match
  }

  async passwordMatches(password){
    let result = await bcrypt.compare(password, this.hashedpassword)

    return result
  }

  static async find(id){
    const sql = `
      SELECT * FROM users WHERE users.id = $1
    `
    const { rows } = await db.query(sql, [id])
    return rows[0] ? this.load(rows[0]) : {}
  }

  static async find_by(params){
    const sql = `
      SELECT * FROM users where ${this.paramsToSql('users', params)}
    `
    const { rows } = await db.query(sql)
    return rows[0] ? this.load(rows[0]) : {}
  }

  static load(results){
    return new User(results)
  }

  static paramsToSql(tableName, params){
    let query = []
    for(const [key, val] of Object.entries(params)){
      query.push(`${tableName}.${key} = '${val}'`)
    }

    return query.join('and')
  }
}

module.exports = User