var tinymceOptions = {};
var bootpagOptions = {};

jQuery(document).ready(function ($) {
    var MQL = 1170;
    if ($(window).width() > MQL) {
        var navbarCustom =  $('.navbar-custom');
        var headerHeight = navbarCustom.height();
        $(window).on('scroll', {
                previousTop: 0
            },
            function () {
                var currentTop = $(window).scrollTop();
                if (currentTop < this.previousTop) {
                    if (currentTop > 0 && navbarCustom.hasClass('is-fixed')) {
                        navbarCustom.addClass('is-visible');
                    } else {
                        navbarCustom.removeClass('is-visible is-fixed');
                    }
                } else if (currentTop > this.previousTop) {
                    navbarCustom.removeClass('is-visible');
                    if (currentTop > headerHeight && !navbarCustom.hasClass('is-fixed')) navbarCustom.addClass('is-fixed');
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
        id: 'loading-bar'
    };
    var nanobar = new Nanobar(options);

    $.ajaxSetup({
        xhrFields: {
            onprogress: function (e) {
                var percentage = Math.floor(e.loaded / e.total * 100);
                nanobar.go(percentage);
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
        headers: {'back-req': 'true'},
        success: function (data) {
            $('#body-content').html(data);
        }
    });
};

function updateBrowserData(title, url, ajax, back, noUpdate) {
    var tinymceEditor = $('.tinymce-editor');
    if (tinymceEditor && tinymceEditor.length > 0) {
        tinymce.init({
            height: 500,
            language: 'it',
            selector: '.tinymce-editor',
            plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table contextmenu paste code'
            ],
            //toolbar: 'undo redo | link image | code',
            image_title: true,
            automatic_uploads: true,
            images_upload_url: '/blog/upload',
            file_picker_types: 'image',
            file_picker_callback: function (cb, value, meta) {
                var input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                input.onchange = function () {
                    var file = this.files[0];
                    var id = 'image_' + Date.now();
                    var blobCache = tinymce.activeEditor.editorUpload.blobCache;
                    var blobInfo = blobCache.create(id, file);
                    blobCache.add(blobInfo);
                    cb(blobInfo.blobUri(), {title: file.name});
                };
                input.click();
            },
            setup: function (editor) {
                editor.on('init', function (e) {
                    if (tinymceOptions.content) {
                        tinymce.activeEditor.setContent(tinymceOptions.content);
                        tinymce.execCommand('mceRepaint');
                    }
                });
            }
        });
    }

    var selectPicker = $('.selectpicker');
    if (selectPicker.length > 0)
        selectPicker.selectpicker();

    var checkbox = $("input[type='checkbox']");
    if (checkbox.length > 0)
        checkbox.bootstrapToggle();

    var bootpag = $('.paginator');
    if (bootpag.length > 0) {
        bootpag.bootpag({
            total: bootpagOptions.total,
            page: bootpagOptions.page,
            maxVisible: 5,
            firstLastUse: true,
            first: '←',
            last: '→',
            leaps: true
        }).on("page", function (event, num) {
            ajaxRequest('GET', 'replace', '#body-content', '/?page=' + num, null, function () {
                window.scrollTo(0, 0)
            });
        });
    }

    if (!noUpdate) {
        if (!back && ajax)
            window.history.pushState(url, url, url);
        document.title = title + ' - Simeone Vilardo';
    }
}
window.addEventListener("load", function () {
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
    })
});

