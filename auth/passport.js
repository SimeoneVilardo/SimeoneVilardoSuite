var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var securityHelper = require('../helpers/security-helper.js');
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
                if (utilityHelper.isEmpty(password) || (password !== req.body.confirmPassword)) {
                    done(null, false, req.flash('passportMessage', 'Le password non combaciano'));
                    p.cancel();
                    return;
                }
                var newUser = {
                    username: username,
                    email: req.body.email,
                    password: password,
                    confirmPassword: req.body.confirmPassword
                };
                return dbHelper.createUser(newUser);
            }).then(function (newUser) {
                if (newUser)
                    return [newUser, mailHelper.sendSignUp(newUser.username, newUser.email, newUser.validationToken.token)];
                done(null, false, req.flash('passportMessage', 'Errore sconosciuto durante la registrazione'));
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
                if (req.session.social && req.session.social.facebook && req.session.social.facebook.duplicate && (req.session.social.facebook.username === username))
                    username = req.session.social.facebook.alias;
                var email = profile.email || profile.emails[0].value;
                var p = dbHelper.findUser({email: email}).then(function (user) {
                    if (user) {
                        if (!user.facebook) {
                            user.facebook = {
                                id: profile.id,
                                token: token,
                                username: profile.displayName || profile.username || (profile.name.givenName + ' ' + profile.name.familyName)
                            };
                            return dbHelper.updateUser({_id: user._id}, user, null, {login: true});
                        }
                        else {
                            done(null, user);
                            p.cancel();
                        }
                    }
                    else {
                        var newUser = {
                            username: username,
                            email: profile.email || profile.emails[0].value,
                            validation: {validated: true, validationDate: Date.now()},
                            facebook: {
                                id: profile.id,
                                token: token,
                                username: profile.displayName || profile.username || (profile.name.givenName + ' ' + profile.name.familyName)
                            }
                        };
                        return dbHelper.createUser(newUser, {social: true});
                    }
                }).then(function (newUser) {
                    return done(null, newUser);
                }).catch(function (err) {
                    if (err.code === 11000 && utilityHelper.extractDuplicateField(err) === 'username') {
                        req.session.social = {
                            facebook: {duplicate: true, username: username},
                            service: config.auth.facebook.service
                        };
                        err.redirect = '/auth/username';
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
                if (req.session.social && req.session.social.twitter && req.session.social.twitter.duplicate && (req.session.social.twitter.username === username))
                    username = req.session.social.twitter.alias;
                var email = profile.emails[0].value;
                var p = dbHelper.findUser({email: email}).then(function (user) {
                    if (user) {
                        if (!user.twitter) {
                            user.twitter = {
                                id: profile.id,
                                token: token,
                                username: profile.displayName || profile.username
                            };
                            return dbHelper.updateUser({_id: user._id}, user, null, {login: true});
                        }
                        else {
                            done(null, user);
                            p.cancel();
                        }
                    }
                    else {
                        var newUser = {
                            username: username,
                            email: email,
                            validation: {validated: true, validationDate: Date.now()},
                            twitter: {
                                id: profile.id,
                                token: token,
                                username: profile.displayName || profile.username
                            }
                        };
                        return dbHelper.createUser(newUser, {social: true});
                    }
                }).then(function (newUser) {
                    return done(null, newUser);
                }).catch(function (err) {
                    if (err.code === 11000 && utilityHelper.extractDuplicateField(err) === 'username') {
                        req.session.social = {
                            twitter: {duplicate: true, username: username},
                            service: config.auth.twitter.service
                        };
                        err.redirect = '/auth/username';
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
                if (req.session.social && req.session.social.google && req.session.social.google.duplicate && (req.session.social.google.username === username))
                    username = req.session.social.google.alias;
                var email = profile.emails[0].value;
                var p = dbHelper.findUser({email: email}).then(function (user) {
                    if (user) {
                        if (!user.google) {
                            user.google = {id: profile.id, token: token, username: profile.displayName};
                            return dbHelper.updateUser({_id:  user._id}, user, null, {login: true});
                        }
                        else {
                            done(null, user);
                            p.cancel();
                        }
                    }
                    else {
                        var newUser = {
                            username: username,
                            email: profile.email || profile.emails[0].value,
                            validation: {validated: true, validationDate: Date.now()},
                            google: {id: profile.id, token: token, username: profile.displayName}
                        };
                        return dbHelper.createUser(newUser, {social: true});
                    }
                }).then(function (newUser) {
                    return done(null, newUser);
                }).catch(function (err) {
                    if (err.code === 11000 && utilityHelper.extractDuplicateField(err) === 'username') {
                        req.session.social = {
                            google: {duplicate: true, username: username},
                            service: config.auth.google.service
                        };
                        err.redirect = '/auth/username';
                    }
                    return done(err);
                });
            });
        }));
};