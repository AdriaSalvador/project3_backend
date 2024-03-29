require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const cors = require("cors");
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session')

const User = require('./models/User')


mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//CORS Middleware /*'https://adriaproject3.herokuapp.com''https://adriaproject3.netlify.app/'*/
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://adriaproject3.herokuapp.com');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

app.use(cors({
  credentials: true,
  origin: ["http://localhost:3001", 'https://play4free.netlify.app', 'https://adriaproject3.herokuapp.com']
}));

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
})

// Express View engine setup

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));

// Passport session:
// Middleware de Session

app.set('trust proxy', 1)
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  sameSite: 'none',
  secure: true
}))

app.use(session({
  secret: 'ourPassword',
  resave: true,
  saveUninitialized: true,
  cookie: {
    sameSite: 'none',
    secure: true
  }
}))

//Middleware para serializar al usuario
passport.serializeUser((user, callback) => {
  callback(null, user._id)
})

//Middleware para des-serializar al usuario
passport.deserializeUser((id, callback) => {
  User.findById(id)
    .then((user) => callback(null, user))
    .catch((err) => callback(err))
})


//Middleware del Strategy
passport.use(new LocalStrategy({ passReqToCallback: true }, (req, username, password, next) => {
  User.findOne({ username })
    .then((user) => {

      if (!user) {
        return next(null, false, { message: "Incorrect username" })
      }

      if (!bcrypt.compareSync(password, user.password)) {
        return next(null, false, { message: "Incorrect password" })
      }

      return next(null, user)
    })
    .catch((err) => next(err))
}))

//Middleware de passport
app.use(passport.initialize())
app.use(passport.session())


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
// app.locals.title = 'Express - Generated with IronGenerator';



const index = require('./routes/index');
app.use('/', index);

const authRoutes = require('./routes/auth-routes');
app.use('/', authRoutes);


module.exports = app;
