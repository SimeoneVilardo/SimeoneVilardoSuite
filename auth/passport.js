var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var securityHelper = require('../helpers/security-helper.js');
var User = require('../models/user');
var dbHelper = require('../helpers/database-helper.js');
var mailHelper = require('../helpers/mail-helper.js');
var utilityHelper = require('../helpers/utility-helper.js');
var config = require('../config.js');

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
                if (user) {
                    done(null, false, req.flash('passportMessage', 'Utente già registrato'));
                    p.cancel();
                    return;
                }
                if (password && (password !== req.body.confirmPassword)) {
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
                if (newUser)
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

    passport.use(new FacebookStrategy({
            clientID: config.auth.facebook.client_id,
            clientSecret: config.auth.facebook.client_secret,
            callbackURL: config.auth.facebook.callback_URL,
            profileFields: ['id', 'displayName', 'email'],
            passReqToCallback: true
        },
        function (req, token, refreshToken, profile, done) {
            process.nextTick(function () {
                var username = profile.displayName || profile.username || (profile.name.givenName + ' ' + profile.name.familyName);
                if (req.session.social && req.session.social.facebook && req.session.social.facebook.usernameDuplicate && (req.session.social.facebook.originalUsername === username))
                    username = req.session.social.facebook.altUsername;
                var email = profile.email || profile.emails[0].value;
                var p = User.findOne({email: email}).exec().then(function (user) {
                    if (user) {
                        if (!user.facebook) {
                            user.facebook = {
                                id: profile.id,
                                token: token,
                                username: profile.displayName || profile.username || (profile.name.givenName + ' ' + profile.name.familyName)
                            };
                            return user.save();
                        }
                        else {
                            done(null, user);
                            p.cancel();
                        }
                    }
                    else {
                        var newUser = new User();
                        newUser.facebook = {
                            id: profile.id,
                            token: token,
                            username: profile.displayName || profile.username || (profile.name.givenName + ' ' + profile.name.familyName)
                        };
                        newUser.username = username;
                        newUser.email = profile.email || profile.emails[0].value;
                        newUser.validation = {validated: true, validationDate: Date.now()};
                        return newUser.save();
                    }
                }).then(function (newUser) {
                    return done(null, newUser);
                }).catch(function (err) {
                    if (err.code === 11000 && utilityHelper.extractDuplicateField(err) === 'username') {
                        req.session.social = {facebook: {usernameDuplicate: true, originalUsername: username}};
                        err.redirect = {url: '/auth/username', data: {service: config.auth.facebook.service}};
                    }
                    return done(err);
                });
            });
        }));

    passport.use(new TwitterStrategy({
            consumerKey: config.auth.twitter.client_id,
            consumerSecret: config.auth.twitter.client_secret,
            callbackURL: config.auth.twitter.callback_URL,
            userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
            passReqToCallback: true
        },
        function (req, token, tokenSecret, profile, done) {
            process.nextTick(function () {
                var username = profile.displayName || profile.username;
                if (req.session.social && req.session.social.twitter && req.session.social.twitter.usernameDuplicate && (req.session.social.twitter.originalUsername === username))
                    username = req.session.social.twitter.altUsername;
                var email = profile.emails[0].value;
                var p = User.findOne({email: email}).exec().then(function (user) {
                    if (user) {
                        if (!user.twitter) {
                            user.twitter = {
                                id: profile.id,
                                token: token,
                                username: profile.displayName || profile.username
                            };
                            return user.save();
                        }
                        else {
                            done(null, user);
                            p.cancel();
                        }
                    }
                    else {
                        var newUser = new User();
                        newUser.twitter = {
                            id: profile.id,
                            token: token,
                            username: profile.displayName || profile.username
                        };
                        newUser.twitter.token = token;
                        newUser.username = username;
                        newUser.email = email;
                        newUser.validation = {validated: true, validationDate: Date.now()};
                        return newUser.save();
                    }
                }).then(function (newUser) {
                    return done(null, newUser);
                }).catch(function (err) {
                    if (err.code === 11000 && utilityHelper.extractDuplicateField(err) === 'username') {
                        req.session.social = {twitter: {usernameDuplicate: true, originalUsername: username}};
                        err.redirect = {url: '/auth/username', data: {service: config.auth.twitter.service}};
                    }
                    return done(err);
                });
            });
        }));

    passport.use(new GoogleStrategy({
            clientID: config.auth.google.client_id,
            clientSecret: config.auth.google.client_secret,
            callbackURL: config.auth.google.callback_URL,
            passReqToCallback: true
        },
        function (req, token, refreshToken, profile, done) {
            process.nextTick(function () {
                var username = profile.displayName;
                if (req.session.social && req.session.social.google && req.session.social.google.usernameDuplicate && (req.session.social.google.originalUsername === username))
                    username = req.session.social.google.altUsername;
                var email = profile.emails[0].value;
                var p = User.findOne({email: email}).exec().then(function (user) {
                    if (user) {
                        if (!user.google) {
                            user.google = {id: profile.id, token: token, username: profile.displayName};
                            return user.save();
                        }
                        else {
                            done(null, user);
                            p.cancel();
                        }
                    }
                    else {
                        var newUser = new User();
                        newUser.google = {id: profile.id, token: token, username: profile.displayName};
                        newUser.username = username;
                        newUser.email = profile.email || profile.emails[0].value;
                        newUser.validation = {validated: true, validationDate: Date.now()};
                        return newUser.save();
                    }
                }).then(function (newUser) {
                    return done(null, newUser);
                }).catch(function (err) {
                    if (err.code === 11000 && utilityHelper.extractDuplicateField(err) === 'username') {
                        req.session.social = {google: {usernameDuplicate: true, originalUsername: username}};
                        err.redirect = {url: '/auth/username', data: {service: config.auth.google.service}};
                    }
                    return done(err);
                });

            });
        }));
};