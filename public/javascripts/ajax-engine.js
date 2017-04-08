/*global $*/

$(document).on('click', 'a[data-ajax*="true"]', function(e) {
    e.preventDefault();
    var sender = $(e.currentTarget);
    var method = sender.data('ajax-method');
    var mode = sender.data('ajax-mode');
    var targetId = sender.data('ajax-target');
    var url = sender.attr('href');
    $.ajax({
            method: method,
            url: url
        })
        .always(function(res) {
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
        });
});

$(document).on('submit', 'form[data-ajax*="true"]', function(e) {
    e.preventDefault();
    var sender = $(e.currentTarget);
    var method = sender.attr('method');
    var mode = sender.data('ajax-mode');
    var targetId = sender.data('ajax-target');
    var url = sender.attr('action');
    var data = sender.serialize();
    $.ajax({
        method: method,
        url: url,
        data: data
    })
        .always(function(res) {
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
        });
});