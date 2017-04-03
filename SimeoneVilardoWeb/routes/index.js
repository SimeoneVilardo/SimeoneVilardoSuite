var pug = require('pug');

module.exports = function (router, passport) {

    router.get('/', hybridEngine, function (req, res, next) {
        res.render(req.view, {
            partialView: req.partialView
        });
    });

    router.get('/login', hybridEngine, function (req, res, next) {
        res.render(req.view, {
            partialView: req.partialView
        });
    });

    router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

    router.get('/signup', hybridEngine, function (req, res, next) {
        res.render(req.view, {
            partialView: req.partialView
        });
    });

    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

function hybridEngine(req, res, next) {
    if (/(?:\.([^.]+))?$/.exec(req.url)[1] === undefined) { //Verifico che l'url richiesto non abbia estensioni, perchè in quel caso sarà una risorsa e non serve usare il motore ibrido
        req.back = req.headers['back-req'] ? true : false;
        req.ajax = req.xhr ? true : false;
        var partialViewOptions = {
            ajax: req.ajax,
            url: req.url,
            back: req.back,
            message: req.flash('message')
        };
        if (req.ajax) { // Se è ajax
            req.view = req.url === '/' ? 'home' : req.url.split('?')[0].replace('/', '').toLowerCase(); //Imposto il nome della view
            req.partialView = partialViewOptions;
        }
        else {
            req.view = 'layout';
            req.partialViewPath = __dirname + '/../views' + (req.url === '/' ? '/home' : req.url.split('?')[0]) + '.pug';
            req.partialView = pug.renderFile(req.partialViewPath, {
                partialView: partialViewOptions
            });
        }
    }
    next();
}