const express = require('express');
const session = require('express-session');
const passport = require('passport');
const YandexStrategy = require('passport-yandex').Strategy;

const app = express();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const CLIENT_ID = '0c60f5676fdb449b8d266f64b3742d54';
const CLIENT_SECRET = 'ee4d76cc45c347849e395de4f9d13f6e';
const CALLBACK_URL = 'http://localhost:3000/auth/yandex/callback';

passport.use(new YandexStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', passport.authenticate('yandex'));

app.get('/auth/yandex/callback',
    passport.authenticate('yandex', {
        failureRedirect: '/login'
    }),
    (req, res) => {
        res.redirect('/profile');
    }
);

app.get('/profile', ensureAuthenticated, (req, res) => {
    res.send(`<h1>Привет, ${req.user.displayName}</h1><a href="/logout">Выйти</a>`);
});

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

app.get('/', (req, res) => {
    res.send('<a href="/login">Войти через Яндекс</a>');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

app.listen(3000, () => {
    console.log('Server started on port: 3000');
});
