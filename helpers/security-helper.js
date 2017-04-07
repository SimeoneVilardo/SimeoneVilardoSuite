var securityHelper = {};
var bcrypt = require('bcrypt-nodejs');
var dbHelper = require('./database-helper.js');

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

securityHelper.validateUser = function (token) {
   return dbHelper.updateUser({'validationToken.token':token,"validationToken.expirationDate": { $gt: Date.now() } }, {$unset: {validationToken: 1 }, validated:true});
};

module.exports = securityHelper;