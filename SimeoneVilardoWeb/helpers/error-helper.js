var errorHelper = {};

errorHelper.managedError = function (message) {
    return {message:message, isManaged:true}
};

module.exports = errorHelper;