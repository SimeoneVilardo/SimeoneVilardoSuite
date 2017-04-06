var securityHelper = {};
var bcrypt = require('bcrypt-nodejs');

securityHelper.isLogged = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};

securityHelper.hashPassword = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

securityHelper.checkPassword = function (password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
};

module.exports = securityHelper;