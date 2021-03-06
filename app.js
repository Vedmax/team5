var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
const config = require('config');
const hbs = require('hbs');
var flash = require('express-flash');
var mongoose = require('mongoose');
var passport = require('passport');
var User = require('./models/user');
var LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();
// TODO fix registr model
var Like = require('./models/like');
// var Picture = require("./models/Picture");
// var Quest = require("./models/Quest");
var registerPartials = require('./partials.js').registerPartials;

var app = express();

// view engine setup

var viewDir = 'bundles';
app.set('views', path.join(__dirname, viewDir));
app.set('view engine', 'hbs');

registerPartials(path.join(__dirname, 'blocks'), hbs);

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: 'anything',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use(function (req, res, next) {
    req.render_data || (req.render_data = {});
    req.render_data.user = req.user;
    next();
});

app.use(function (req, res, next) {
    req.isDev = (app.get('env') === 'development');
    next();
});

require('./routes')(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Страница не найдена');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.error(err);
        res.status(err.status || 500);
        res.render('error/error', {
            message: err.message,
            error: err,
            data: req.render_data,
            isServerError: !err.status
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error/error', {
        message: err.message,
        error: {},
        data: req.render_data,
        isServerError: !err.status
    });
});

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var dbURL = process.env.PROD_MONGODB || config.get('dbURL');
mongoose.connect(dbURL, function (err) {
    if (err) {
        console.error('Could not connect to mongodb on localhost.');
    }
});

module.exports = app;
