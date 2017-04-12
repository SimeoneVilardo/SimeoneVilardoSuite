/*global $*/

$(document).on('click', 'a[data-ajax*="true"]', function(e) {
    e.preventDefault();
    var sender = $(e.currentTarget);
    var method = sender.data('ajax-method');
    var mode = sender.data('ajax-mode');
    var targetId = sender.data('ajax-target');
    var url = sender.attr('href');
    ajaxEngine(method, mode, targetId, url, null);
});

$(document).on('submit', 'form[data-ajax*="true"]', function(e) {
    e.preventDefault();
    var sender = $(e.currentTarget);
    var method = sender.attr('method');
    var mode = sender.data('ajax-mode');
    var targetId = sender.data('ajax-target');
    var url = sender.attr('action');
    var data = sender.serialize();
    var confirm = sender.data('ajax-confirm');
    if(confirm){
        var okMessage = sender.data('ajax-ok');
        var cancMessage = sender.data('ajax-cancel');
        showConfirmDialog(confirm, okMessage, cancMessage, ajaxEngine(method, mode, targetId, url, data));
    }
    else
    {
        ajaxEngine(method, mode, targetId, url, data);
    }
});

function showConfirmDialog(confirmMessage, okMessage, cancMessage, script) {
    BootstrapDialog.confirm({
        title: 'Conferma',
        message: confirmMessage,
        type: BootstrapDialog.TYPE_WARNING, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
        closable: true, // <-- Default value is false
        draggable: true, // <-- Default value is false
        btnCancelLabel: cancMessage || 'Annulla', // <-- Default value is 'Cancel',
        btnOKLabel: okMessage || 'Conferma', // <-- Default value is 'OK',
        btnOKClass: 'btn-warning', // <-- If you didn't specify it, dialog type will be used,
        callback: function(result) {
            if(result)
                script();
        }
    });
}

function ajaxEngine(method, mode, targetId, url, data, script) {
    $.ajax({
        method: method,
        url: url,
        data: data
    }).always(function(res) {
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
            if(script)
                script();
        });
}