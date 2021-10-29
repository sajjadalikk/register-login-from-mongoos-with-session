/* eslint-disable new-cap */
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const MongoDBStore = require('connect-mongodb-session')(session);
const app = express();
const http = require('http').Server(app);
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
const uri ='mongodb+srv://sajjad:123saji321@cluster0.3c6ba.mongodb.net/myFirstDatabase?';
const port = process.env.PORT || 3000;
const isAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  next();
};

app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

mongoose.connect(uri).then((result)=>{
  console.log('connected to Mongo');
}).catch((error)=>{
  console.error('error connecting to Mongo', error);
});

const store = new MongoDBStore({
  uri: uri,
  collection: 'mySessions',
});

app.use(session({
  secret: 'a very secret key',
  resave: false,
  saveUninitialized: false,
  store: store,
}));

app.use(express.static(path.join(__dirname, 'public')));

// login
app.get('/', (req, res) => {
  res.render('index');
});
// login post
app.post('/', async (req, res) => {
  const {email, password} = req.body;
  const user = await User.findOne({email});

  if (!user) {
    // TODO: handle user not found message
    console.log('user not found');
    return res.redirect('/');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    // TODO: handle incorrect password message
    console.log('incorrect password');
    return res.redirect('/');
  }

  req.session.user = user;
  res.redirect('/dashboard');
});

// logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const {username, email, password} = req.body;

  let user = await User.findOne({email});

  if (user) {
    console.log('duplicate email');
    return res.render('register', {...req.body, error: 'Email already exists'});
  }

  try {
    const hashPassword = await bcrypt.hash(password, 10);

    user = new User({
      username,
      email,
      password: hashPassword,
    });
    await user.save();
  } catch (e) {
    // console.log(e);
    if (e.message.indexOf('validation failed') !== -1) {
      e = Object.values(e.errors).reduce((a, i)=>{
        console.log(a);
        return a+'<br>'+i;
      });
    }
    return res.render('register', {...req.body, error: e});
  }
  res.redirect('/');
});

app.get('/dashboard', isAuth, (req, res) => {
  res.render('dashboard', {username: req.session.user.username});
});

http.listen(port, () => console.log(`Example app listening on port ${port}!`));
