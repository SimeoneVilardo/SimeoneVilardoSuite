var securityHelper = {};
var dbHelper = require('./database-helper.js');
var bcrypt = require('bcrypt-nodejs');

securityHelper.isLogged = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};

securityHelper.checkPassword = function(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
};

module.exports = securityHelper;