module.exports = function(router, passport) {
    router.post('/auth/local/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

    router.post('/auth/local/signup', passport.authenticate('local-signup', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    router.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['email', 'user_about_me']
    }));

    router.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            authType: 'rerequest',
            successRedirect: '/',
            failureRedirect: '/'
        }));

    router.get('/auth/twitter', passport.authenticate('twitter', {
        scope: 'email'
    }));

    router.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    router.get('/auth/google', passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

    router.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    router.get('/auth/facebook/login', passport.authorize('facebook', {
        scope: 'email'
    }));

};