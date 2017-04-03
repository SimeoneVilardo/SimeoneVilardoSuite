jQuery(document).ready(function ($) {
    var MQL = 1170;
    if ($(window).width() > MQL) {
        var headerHeight = $('.navbar-custom').height();
        $(window).on('scroll', {
            previousTop: 0
        },
            function () {
                var currentTop = $(window).scrollTop();
                if (currentTop < this.previousTop) {
                    if (currentTop > 0 && $('.navbar-custom').hasClass('is-fixed')) {
                        $('.navbar-custom').addClass('is-visible');
                    } else {
                        $('.navbar-custom').removeClass('is-visible is-fixed');
                    }
                } else if (currentTop > this.previousTop) {
                    $('.navbar-custom').removeClass('is-visible');
                    if (currentTop > headerHeight && !$('.navbar-custom').hasClass('is-fixed')) $('.navbar-custom').addClass('is-fixed');
                }
                this.previousTop = currentTop;
            });
    }
    $('.nav a').on('click', function () {
        if ($("#bs-example-navbar-collapse-1").hasClass('in'))
            $('.navbar-toggle').click();
    });

    var options = {
        classname: 'loading-bar',
        id: 'loading-bar',
    };
    var nanobar = new Nanobar(options);

    $.ajaxSetup({
        xhrFields: {
            onprogress: function (e) {
                console.log('onprogress', e);
                var percentage = Math.floor(e.loaded / e.total * 100);
                nanobar.go(percentage);
                console.log('percentage', percentage);
            },

            onload: function (e) {
                console.log('onload', e);
            }
        }
    });
});

window.onpopstate = function (e) {
    if (e.state === null)
        e.state = '';
    $.ajax({
        url: e.state,
        method: 'GET',
        headers: { 'Back-Req': 'true' },
        success: function (data) {
            $('#body-content').html(data);
        }
    });
};

function updateBrowserData(title, url, ajax, back) {
    if (!back && ajax)
         window.history.pushState(url, url, url);
    document.title = title + ' - Simeone Vilardo';
}