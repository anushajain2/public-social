const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users.js');
const profile = require('./routes/api/profile.js');
const posts = require('./routes/api/posts.js');

const app = express();

//body parser middleware - to enable access to req.body
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Database configuration
const db = require('./config/keys').mongoURI;

//Connect to mongodb
mongoose.connect(db, {useNewUrlParser: true})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

//passport middleware
app.use(passport.initialize());

//passport configuration
require('./config/passport.js')(passport);

app.get('/', (req, res) => res.send('Hello'));

//Redirecting to appropriate files for each route
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
