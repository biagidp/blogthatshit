//Application config
const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const port = 3000 //TODO: Should be an env variable
const host = '127.0.0.1' //TODO: Should be an env variable
const User = require('./src/User')
const Article = require('./src/Article')
const auth = require('connect-ensure-login')
const multer = require('multer')
const upload = multer({dest: './uploads/'})

//Authentication config
const passport = require('passport')
const { MemoryStore } = require('express-session')
const LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(
  (username, password, done) => {
    User.find_by({username: username})
    .then( user => {
      console.log('login user: ', user)
        if(user && user.passwordMatches(password)){
        return done(null, user)
      }else{
        return done(null, false, {message: 'Incorrect login information'})
      }
    })
  }
))
passport.serializeUser((user, done) => {
  console.log('serializing: ', user)
  done(null, user.id)
})
passport.deserializeUser((id, done) => {
  console.log('deserializing: ', id)
  User.find(id)
  .then( user => {
    done(null, user)
  })
})
app.use(passport.initialize())

//Configure Session
//TODO: handle deprications
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(bodyParser());
app.use(session({
  secret: 'steve',
  saveUninitialized: true,
  resave: false,
  store: new MemoryStore(),
  expires: Date.now() + (30 * 86400 * 1000)
}))
app.use(passport.initialize());
app.use(passport.session())

//Configure handlebar templates
app.set('view engine', 'html')
app.engine('html', require('hbs').__express)

app.get('/', (req, res) => {
  console.log('req.user: ', req.session.passport)
  res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.get('/dashboard', auth.ensureLoggedIn('/signin'), (req, res) => {
  console.log('req.user: ', req.session.passport.user)
  User.find(req.session.passport.user)
  .then( user => {
    res.render(path.join(__dirname, '/public/dashboard.html'), {uuid: user.uuid} )
  })
})

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/signup.html'))
})

app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/signin.html'))
})

app.post('/articles', upload.single('markdownFile'), (req, res) => {
  const token = req.headers.authorization
  if(!token) { res.status(401).send() }
  
  User.find_by({uuid: token.split(' ')[1]}).then( user => {
    if(!user) { res.status(401).send() }
    
    const article = new Article({
      uploadpath: req.file.path,
      filename: req.file.originalname,
      user: user
    })
    article.save().then( result => {
      result.success == true ?
        res.status(200).send(result) :
        res.status(400).send(result)
    })
  })
})

app.post('/signup', (req, res) => {
  let user = new User(req.body)
  user.signup()
  res.redirect('/welcome')
})

app.post('/signin', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/',
  failureFlash: false
}))

app.get('/:articleName', (req, res) => {
  let username = req.subdomains[0]
  let articlePath = `/articles/${username}/${req.params['articleName']}`
  //if exists
  res.render(path.join(__dirname, articlePath), {path: articlePath})
  //else
  //404
})

app.listen(port, host, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
