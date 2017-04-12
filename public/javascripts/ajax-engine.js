$(document).on('click', 'a[data-ajax*="true"]', function (e) {
    e.preventDefault();
    var data = getAjaxDataFromButton($(e.currentTarget));
    if (data.confirmData)
        ajaxRequestConfirmDialog(data.confirmData, data.ajaxData);
    else
        ajaxRequest(data.ajaxData.method, data.ajaxData.mode, data.ajaxData.targetId, data.ajaxData.url);
});

$(document).on('submit', 'form[data-ajax*="true"]', function (e) {
    e.preventDefault();
    var data = getAjaxDataFromForm($(e.currentTarget));
    if (data.confirmData)
        ajaxRequestConfirmDialog(data.confirmData, data.ajaxData);
    else
        ajaxRequest(data.ajaxData.method, data.ajaxData.mode, data.ajaxData.targetId, data.ajaxData.url, data.ajaxData.data);
});

function ajaxRequest(method, mode, targetId, url, data, callback) {
    $.ajax({
        method: method,
        url: url,
        data: data
    }).always(function (res) {
        var html = (typeof res === 'string' || res instanceof String) ? res : (res.responseText);
        switch (mode) {
            case 'replace':
                $(targetId).html(html);
                break;
            case 'append':
                $(targetId).append(html);
                break;
            case 'prepend':
                $(targetId).prepend(html);
                break;
            case 'replaceWith':
                $(targetId).parent.html(html);
                break;
        }
        if (callback)
            callback();
    });
}

function ajaxRequestConfirmDialog(confirmData, ajaxData) {
    BootstrapDialog.confirm({
        title: confirmData.confirmTitle || 'Attenzione',
        message: confirmData.confirmMessage,
        type: confirmData.confirmType || BootstrapDialog.TYPE_WARNING,
        closable: true,
        draggable: true,
        btnCancelLabel: confirmData.cancMessage || 'Annulla',
        btnOKLabel: confirmData.okMessage || 'Conferma',
        callback: function (result) {
            if (result) {
                ajaxRequest(ajaxData.method, ajaxData.mode, ajaxData.targetId, ajaxData.url, ajaxData.data, ajaxData.callback);
            }
        }
    });
}

function getAjaxDataFromButton(sender) {
    var method = sender.data('ajax-method');
    var mode = sender.data('ajax-mode');
    var targetId = sender.data('ajax-target');
    var url = sender.attr('href');
    var confirmData = getConfirmData(sender);
    var ajaxData = {method: method, mode: mode, targetId: targetId, url: url};
    return {confirmData: confirmData, ajaxData: ajaxData};
}

function getAjaxDataFromForm(sender) {
    var method = sender.attr('method');
    var mode = sender.data('ajax-mode');
    var targetId = sender.data('ajax-target');
    var url = sender.attr('action');
    var data = sender.serialize();
    var confirmData = getConfirmData(sender);
    var ajaxData = {method: method, mode: mode, targetId: targetId, url: url, data: data};
    return {confirmData: confirmData, ajaxData: ajaxData};
}

function getConfirmData(sender) {
    var confirm = sender.data('ajax-confirm');
    if (confirm) {
        var okMessage = sender.data('ajax-ok');
        var cancMessage = sender.data('ajax-cancel');
        var confirmType = sender.data('ajax-confirm-type');
        return {
            confirmMessage: confirm,
            cancMessage: cancMessage,
            okMessage: okMessage,
            confirmType: confirmType
        };
    }
}