// Initialize app
var myApp = new Framework7({
    // Default title for modals
    modalTitle: 'My App',
 
    // If it is webapp, we can enable hash navigation:
    pushState: true,
 
    // Hide and show indicator during ajax requests
    onAjaxStart: function (xhr) {
        myApp.showIndicator();
    },

    onAjaxComplete: function (xhr) {
        myApp.hideIndicator();
    }
});

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

var app = {
    init: function() {
        $$('.tab-categories').click(function() {
            $$('.art-tabs .tab-link').removeClass('active');
            $$(this).addClass('active');

            app.loadCategories();
        });

        $$('.tab-nations').click(function() {
            $$('.art-tabs .tab-link').removeClass('active');
            $$(this).addClass('active');

            app.loadNations();
        });

        $$(document).on('click', '.open-category', function() {
            app.loadRecepts($$(this).data('id'), 1);
        });

        this.loadCategories();
    },

    loadCategories: function() {
        myApp.showIndicator();

        $$.ajax({
            dataType: 'json',
            url: 'http://r.uartema.com/api/api.php/category?transform=1&order=name',
            success: function( resp ) {
                var categoriesTemplate = $$('script#categories').html();
                var compiledCategoriesTemplate = Template7.compile(categoriesTemplate);
                $$('#categoriesContent').html(compiledCategoriesTemplate({categoies: resp.category}));

                myApp.hideIndicator();
            }
        });
    },

    loadNations: function() {
        myApp.showIndicator();

        $$.ajax({
            dataType: 'json',
            url: 'http://r.uartema.com/api/api.php/nationality?transform=1&order=name',
            success: function( resp ) {
                var categoriesTemplate = $$('script#categories').html();
                var compiledCategoriesTemplate = Template7.compile(categoriesTemplate);
                $$('#categoriesContent').html(compiledCategoriesTemplate({categoies: resp.nationality}));

                myApp.hideIndicator();
            }
        });
    },

    loadRecepts: function(categoryId, page) {
        if ( page <= 1 ) page = 1;

        myApp.showIndicator();

        $$.ajax({
            dataType: 'json',
            data: {
                filter: 'categoryId,eq,'+categoryId,
                page: page+',10',
                order: 'id,desc'
            },
            url: 'http://r.uartema.com/api/api.php/dish?transform=1',
            success: function( resp ) {
                var receptsTemplate = $$('script#recepts').html();
                var compiledReceptsTemplate = Template7.compile(receptsTemplate);
                $$('#categoriesContent').html(compiledReceptsTemplate({recepts: resp.dish}));

                myApp.hideIndicator();
            }
        });
    }
};

app.init();
