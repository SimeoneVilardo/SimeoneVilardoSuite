var LocalStrategy = require('passport-local').Strategy;
var securityHelper = require('../helpers/security-helper.js');
var User = require('../models/user');
var dbHelper = require('../helpers/database-helper.js');
var mailHelper = require('../helpers/mail-helper.js');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        dbHelper.findUser({_id: id}).then(function (user) {
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
            var p = dbHelper.findUser({$or: [{username: username}, {email: req.body.email}]}, 'username').then(function (user) {
                if (user){
                    done(null, false, req.flash('passportMessage', 'Utente già registrato'));
                    p.cancel();
                    return;
                }
                if (password && (password !== req.body.confirmPassword)){
                    done(null, false, req.flash('passportMessage', 'Le password non combaciano'));
                    p.cancel();
                    return;
                }
                var newUser = new User();
                newUser.username = username;
                newUser.email = req.body.email;
                newUser.password = securityHelper.hashPassword(password);
                return [newUser.save(), password];
            }).spread(function (newUser, password) {
                if(newUser)
                    return [newUser, mailHelper.sendSignUp(newUser.username, password, newUser.email, newUser.validationToken.token)];
                done(null, false, req.flash('passportMessage', 'Errore durante la registrazione'));
                p.cancel();
            }).spread(function (newUser, mailResult) {
                if (mailResult && !mailResult.response.startsWith('250'))
                    return done(null, false, req.flash('passportMessage', 'Errore nell\'invio della mail'));
                return done(null, newUser);
            }).catch(function (err) {
                return done(err);
            })
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
                if (!securityHelper.checkPassword(password, user.password))
                    return done(null, false, req.flash('passportMessage', 'Password errata'));
                return done(null, user);
            }).catch(function (err) {
                return done(err);
            });
        }));
};