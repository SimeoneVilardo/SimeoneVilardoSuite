/*global $*/

$(document).on('click', 'a[data-ajax*="true"]', function(e) {
    var sender = $(e.target);
    var method = sender.data('ajax-method');
    var mode = sender.data('ajax-mode');
    var targetId = sender.data('ajax-target');
    var url = sender.attr('href');
    $.ajax({
            method: method,
            url: url
        })
        .done(function(html) {
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
    return false;
});