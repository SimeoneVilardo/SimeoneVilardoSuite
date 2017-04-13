var content = null;

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

function updateBrowserData(title, url, ajax, back, noUpdate) {
    var ckeditor = $('.ckeditor');
    if(ckeditor && ckeditor.length > 0){
        CKEDITOR.config.imageUploadUrl = '/blog/upload';
        CKEDITOR.replace('content', {extraPlugins: 'uploadimage', filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/blog/upload'});
        CKEDITOR.instances['content'].setData(content);
        /*        $('#btnSubmit').click(function () {
         CKEDITOR.instances['content'].updateElement();
         });*/
    }

    var selectPicker = $('.selectpicker');
    if(selectPicker.length > 0)
        selectPicker.selectpicker();

    var checkbox = $("input[type='checkbox']");
    if(checkbox.length > 0)
        checkbox.bootstrapToggle();

    if(!noUpdate){
        if (!back && ajax)
            window.history.pushState(url, url, url);
        document.title = title + ' - Simeone Vilardo';
    }
}

    window.addEventListener("load", function(){
        window.cookieconsent.initialise({
            "palette": {
                "popup": {
                    "background": "#252e39"
                },
                "button": {
                    "background": "#14a7d0"
                }
            },
            "content": {
                "message": "Questo sito utilizza cookie tecnici e di profilazione per assicurarti una migliore esperienza.",
                "dismiss": "Capito!",
                "link": "Ulteriori informazioni."
            }
        })});

