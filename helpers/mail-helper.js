var mailHelper = {};
var Promise = require('bluebird');
var path = require('path');
var fs = Promise.promisifyAll(require("fs"));
var nodemailer = Promise.promisifyAll(require("nodemailer"));
var config = require('../config');

var transporter = null;
var senderMail = null;

mailHelper.init = function () {
    senderMail = config.smtp.sender_name;

    var smtpConfig = {
        service: config.smtp.service,
        auth: {
            user: config.smtp.username,
            pass: config.smtp.password
        }
    };
    transporter = nodemailer.createTransport(smtpConfig);
    transporter.verify(function(err) {
        if (err) {
            console.log('Errore connessione a ' + config.smtp.host + ':' + config.smtp.port ,err);
        } else {
            console.log('Connessione a ' + (config.smtp.service || (config.smtp.host + ':' + config.smtp.port)) + ' riuscita');
        }
    });
};

mailHelper.sendSignUp = function (username, password, recipient, token) {
    return fs.readFileAsync(path.join(__dirname, config.mail_templates.signup), 'utf8').then(function (template) {
        var keys = ['@username', '@password', '@token'];
        var values = [username, password, token];
        var subject = 'Benvenuto in SimeoneVilardo';
        template = insertData(template, keys, values);
        return mailHelper.sendTemplateMail(template, subject, recipient);
    }).catch(function (err) {
        return err;
    });
};

// mailHelper.sendSignUpPhoneComunication = function (username, password, recipient, phone) {
//     return fs.readFileAsync(path.join(__dirname, config.mail_templates.phone_signup), 'utf8').then(function (template) {
//         var keys = ['@username', '@password', '@phone'];
//         var values = [username, password, phone];
//         var subject = 'Benvenuto in Diorama';
//         template = insertData(template, keys, values);
//         return mailHelper.sendTemplateMail(template, subject, recipient);
//     }).catch(function (err) {
//         return err;
//     });
// };

mailHelper.sendValidation = function (username, recipient, token) {
    return fs.readFileAsync(path.join(__dirname, config.mail_templates.validation), 'utf8').then(function (template) {
        var keys = ['@username', '@token'];
        var values = [username, token];
        var subject = 'Benvenuto in SimeoneVilardo';
        template = insertData(template, keys, values);
        return mailHelper.sendTemplateMail(template, subject, recipient);
    });
};

mailHelper.sendRequestResetPassword = function (username, recipient, token) {
    return fs.readFileAsync(path.join(__dirname, config.mail_templates.request_reset_password), 'utf8').then(function (template) {
        var keys = ['@username', '@token'];
        var values = [username, token];
        var subject = "Reset password";
        template = insertData(template, keys, values);
        return mailHelper.sendTemplateMail(template, subject, recipient);
    });
};

mailHelper.sendMailChanged = function (username, recipient, oldMail) {
    return fs.readFileAsync(path.join(__dirname, config.mail_templates.change_mail_request), 'utf8').then(function (template) {
        var keys = ['@username', '@mail', '@oldmail'];
        var values = [username, recipient, oldMail];
        var subject = "Indirizzo email modificato";
        template = insertData(template, keys, values);
        return mailHelper.sendTemplateMail(template, subject, recipient);
    });
};

mailHelper.sendPhoneChanged = function (username, recipient, oldPhone) {
    return fs.readFileAsync(path.join(__dirname, config.mail_templates.change_phone_request), 'utf8').then(function (template) {
        var keys = ['@username', '@mail', '@oldPhone'];
        var values = [username, recipient, oldPhone];
        var subject = "Numero cellulare modificato";
        template = insertData(template, keys, values);
        return mailHelper.sendTemplateMail(template, subject, recipient);
    });
};

mailHelper.sendRecoverUsername = function (username, recipient) {
    return fs.readFileAsync(path.join(__dirname, config.mail_templates.recover_username), 'utf8').then(function (template) {
        var keys = ['@username'];
        var values = [username];
        var subject = "Recupero username";
        template = insertData(template, keys, values);
        return mailHelper.sendTemplateMail(template, subject, recipient);
    });
};

mailHelper.sendTemplateMail = function (template, subject, recipient) {
    var mail = {
        from: senderMail,
        to: recipient,
        subject: subject,
        html: template
    };
    return mailHelper.sendMail(mail);
};

mailHelper.sendMail = function (mail) {
    return transporter.sendMail(mail).then(function (mailResponse) {
        return mailResponse;
    });
};


function insertData(template, keys, values) {
    for (var i = 0; i < keys.length; i++) {
        template = template.replaceAll(keys[i], values[i]);
    }
    return template;
}

String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
};

module.exports = mailHelper;