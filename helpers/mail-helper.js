var mailHelper = {};
var path = require('path');
var nodemailer = require("nodemailer");
var EmailTemplate = require('email-templates').EmailTemplate;
var logHelper = require('./log-helper.js');
var config = require('../config');

var signup = new EmailTemplate(path.join(__dirname, '..', config.mails.path.signup));
var recoverUsername = new EmailTemplate(path.join(__dirname, '..', config.mails.path.recover_username));
var recoverPassword = new EmailTemplate(path.join(__dirname, '..', config.mails.path.recover_password));
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
            logHelper.getLogger().error('Errore connessione a ' + config.smtp.host + ':' + config.smtp.port ,err);
        } else {
            logHelper.getLogger().info('Connessione a ' + (config.smtp.service || (config.smtp.host + ':' + config.smtp.port)) + ' riuscita');
        }
    });
};

mailHelper.sendSignUp = function (username, recipient, token) {
    var data = {username: username, url: config.host.https_baseurl + '/validate?token=' + token};
    return signup.render(data).then(function (result) {
        return mailHelper.sendTemplateMail(result.html, config.mails.subject.signup, recipient);
    }).catch(function (err) {
         return err;
    });
};

mailHelper.sendRecoverUsername = function (username, recipient) {
    var data = {username: username};
    return recoverUsername.render(data).then(function (result) {
        return mailHelper.sendTemplateMail(result.html, config.mails.subject.recover_username, recipient);
    }).catch(function (err) {
        return err;
    });
};

mailHelper.sendRecoverPassword = function (username, recipient, token) {
    var data = {username: username, url: config.host.https_baseurl + '/me/recover-password?token=' + token};
    return recoverPassword.render(data).then(function (result) {
        return mailHelper.sendTemplateMail(result.html, config.mails.subject.recover_password, recipient);
    }).catch(function (err) {
        return err;
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
        if (mailResponse && !mailResponse.response.startsWith('250'))
            return {message: 'Errore durante l\'invio della mail. Riprovare o contattare l\'amministatore.'};
    });
};

module.exports = mailHelper;