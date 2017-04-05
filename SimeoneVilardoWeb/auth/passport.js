var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var dbHelper = require('../helpers/database-helper.js');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        dbHelper.findUser({_id: id}, 'username').then(function (user) {
            done(null, user);
        }).catch(function (err) {
            done(err, null);
        });
    });

    passport.use('local-signup', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, username, password, done) {
            dbHelper.findUser({username: username, email: req.body.email}, 'username').then(function (user) {
                if (user)
                    return done(null, false, req.flash('passportMessage', 'Utente già registrato.'));
                else {
                    var newUser = new User();
                    newUser.username = username;
                    newUser.email = req.body.email;
                    newUser.password = newUser.generateHash(password);
                    return newUser.save();
                }
            }).then(function (newUser) {
                return done(null, newUser);
            }).catch(function (err) {
                return done(err);
            });
        }));

    passport.use('local-login', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, username, password, done) {
            dbHelper.findUser({username: username}).then(function (user) {
                if (!user)
                    return done(null, false, req.flash('passportMessage', 'Utente non trovato'));
                if (!bcrypt.compareSync(password, user.password))
                    return done(null, false, req.flash('passportMessage', 'Password errata'));
                return done(null, user);
            }).catch(function (err) {
                return done(err);
            });
        }));
};