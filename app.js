/* global require: false, module: true, process: false */
var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var session = require('express-session');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var MONGOLAB_URI = require('./secret/mongolabURI');

var internalRouter = express.Router();

internalRouter.get('/test', function(req, res){
    'use strict';
    res.render('test', {title: 'Oak-Smoke'});
});

//Set up passport
passport.use(new LocalStrategy(function(username, password, done){
    'use strict';
    process.nextTick(function () {
        User.findOne({username: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            user.verifyPassword(password, function(err, isMatch){
                if (err) {
                    return done(err);
                }
                if (!isMatch) {
                    return done(null, false);
                }
                return done(null, user);

            });
        });
    });
}));

passport.serializeUser(function (user, done) {
    'use strict';
    done(null, user.username);
});

passport.deserializeUser(function (username, done) {
    'use strict';
    User.find({username: username},function(err, user){
        done(err, user);
    });
});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: 'silly dog'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));




//connect to mongoose and build schemas
mongoose.connect(MONGOLAB_URI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection errer:'));
db.once('open',function () {
    'use strict';
    console.log('connected to mongoose');
});

var userSchema = mongoose.Schema({
    username: { type: String, required: true, index: { unique: true }},
    password: { type: String, required: true },
    location: String,
    visiting: String
});

userSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});
userSchema.methods.verifyPassword = function (passwordToCheck, cb) {
    'use strict';
    bcrypt.compare(passwordToCheck, this.password, function(err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};
var barSchema = mongoose.Schema({
    name: String,
    numberVisiting: Number,
    googleId: String
});

var User = mongoose.model('User', userSchema);
var Bar = mongoose.model('Bar', barSchema);

var routes = require('./routes/index');
var users = require('./routes/users');
var register = require('./routes/register');
var login = require('./routes/login');
var logout = require('./routes/logout');
var city = require('./routes/city');

app.use('/', routes);
app.use('/', internalRouter);
app.use('/users', users);
app.use('/register', register);
app.use('/login',login);
app.use('/logout', logout);
app.use('/city', city);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


//DEFAULT ENSURE METHOD, PROBABLY WON'T FIT INTO APP LIKE THIS
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    //res.redirect('/login');
}


module.exports = app;
