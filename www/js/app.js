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
    }
};

app.init();
