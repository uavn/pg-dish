// Initialize app
var myApp = new Framework7({
    // Default title for modals
    modalTitle: 'Recepts',
 
    // If it is webapp, we can enable hash navigation:
    pushState: true,

    material: true
});

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

var app = {
	loading: false,
	page: 1,
	limit: 10,
	categoryId: null,
	nationId: null,

    init: function() {
    	$$(document).on('ajaxStart', function() {
    		myApp.showIndicator();
    	});

    	$$(document).on('ajaxComplete', function() {
    		myApp.hideIndicator();
    	});

        $$('.tab-categories').click(function() {
        	myApp.materialTabbarSetHighlight(
        		$$('.tabbar.toolbar-bottom'),
        		$$(this)
    		);
            $$('.art-tabs .tab-link').removeClass('active');
            $$(this).addClass('active');

            app.loadCategories();
        });

        $$('.tab-nations').click(function() {
        	myApp.materialTabbarSetHighlight(
        		$$('.tabbar.toolbar-bottom'),
        		$$(this)
    		);
            $$('.art-tabs .tab-link').removeClass('active');
            $$(this).addClass('active');

            app.loadNations();
        });

        $$('.tab-all').click(function() {
        	myApp.materialTabbarSetHighlight(
        		$$('.tabbar.toolbar-bottom'),
        		$$(this)
    		);
            $$('.art-tabs .tab-link').removeClass('active');
            $$(this).addClass('active');

            app.nationId = null;
        	app.categoryId = null;

        	$$('#myContent').html('');

            app.loadRecepts(1);
        });

        $$(document).on('click', '.open-category', function() {
        	app.nationId = null;
        	app.q = null;
        	app.categoryId = $$(this).data('id');

        	$$('#myContent').html('');

            app.loadRecepts(1);
        });

        $$(document).on('click', '.open-nation', function() {
        	app.categoryId = null;
        	app.q = null;
        	app.nationId = $$(this).data('id');

        	$$('#myContent').html('');

            app.loadRecepts(1);
        });

        $$('.infinite-scroll').on('infinite', function () {
        	// Exit, if loading in progress
			if (app.loading) return;

			// Set loading flag
			app.loading = true;

			app.loadRecepts(app.page+1);
 		});

 		var mySearchbar = myApp.searchbar('.searchbar', {
		    customSearch: true,
		    onSearch: function(s) {
		    	app.q = s.value;
		    	
		    	$$('#myContent').html('');
		    	
		    	app.loadRecepts(1);
		    },
		    onClear: function(s) {
		    	app.q = null;
		    	app.loadRecepts(1);
		    }
		});  

        this.loadCategories();
    },

    loadCategories: function() {
    	// $$('.subnavbar').hide();
    	myApp.detachInfiniteScroll($$('.infinite-scroll'));

        $$.ajax({
            dataType: 'json',
            url: 'http://r.uartema.com/api/api.php/category?transform=1&order=name&filter=cnt,gt,0',
            success: function( resp ) {
                var categoriesTemplate = $$('script#categories').html();
                var compiledCategoriesTemplate = Template7.compile(categoriesTemplate);
                
                $$('#myContent').html(compiledCategoriesTemplate({
                	categoies: resp.category
                }));

                $$('#myContent').find('.item-link').addClass('open-category');
            }
        });
    },

    loadNations: function() {
    	// $$('.subnavbar').hide();

    	myApp.detachInfiniteScroll($$('.infinite-scroll'));

        $$.ajax({
            dataType: 'json',
            url: 'http://r.uartema.com/api/api.php/nationality?transform=1&order=name',
            success: function( resp ) {
                var categoriesTemplate = $$('script#categories').html();
                var compiledCategoriesTemplate = Template7.compile(categoriesTemplate);
                
                $$('#myContent').html(compiledCategoriesTemplate({
                	categoies: resp.nationality
                }));

                $$('#myContent').find('.item-link').addClass('open-nation');
            }
        });
    },

    loadRecepts: function(page) {
    	// $$('.subnavbar').show();

    	if ( page <= 1 ) {
        	app.page = 1;
        } else {
        	app.page = page;
        }

        var filter = 'id,gt,0';
        if ( app.categoryId ) {
        	filter = 'categoryId,eq,' + app.categoryId;
        } else if ( app.nationId ) {
        	filter = 'nationalityId,eq,' + app.nationId;
        } else if ( app.q ) {
        	filter = 'name,cs,' + app.q;
        }

        

        $$.ajax({
            dataType: 'json',
            data: {
                filter: filter,
                page: page + ',' + app.limit,
                order: 'id,desc'
            },
            url: 'http://r.uartema.com/api/api.php/dish?transform=1',
            success: function( resp ) {
                var dishes = [];

                var categoriesIds = [];
                var nationIds = [];
                $$.each(resp.dish, function(i, dish) {
                	categoriesIds.push(dish.categoryId);
                	if ( dish.nationalityId ) {
                		nationIds.push(dish.nationalityId);
                	}
                });

                if ( categoriesIds ) {
	                $$.ajax({
			            dataType: 'json',
			            data: {
			                filter: 'id,in,' + categoriesIds.join(',')
			            },
			            url: 'http://r.uartema.com/api/api.php/category?transform=1',
			            success: function( cresp ) {
			            	var categories = {};
			            	$$.each(cresp.category, function(k, c) {
			            		categories[c.id] = c;
			            	});

			            	if ( nationIds ) {
				            	$$.ajax({
						            dataType: 'json',
						            data: {
						                filter: 'id,in,' + nationIds.join(',')
						            },
						            url: 'http://r.uartema.com/api/api.php/nationality?transform=1',
						            success: function( nresp ) {
						            	var nationalities = {};
						            	$$.each(nresp.nationality, function(k, n) {
						            		nationalities[n.id] = n;
						            	});

						            	app.listRecepts(resp.dish, categories, nationalities);
						            }
						        });
				            } else {
				            	app.listRecepts(resp.dish, categories);
				            }
			            }
			        });
		        } else {
		        	app.listRecepts(resp.dish);
		        }
            }
        });
    },

    listRecepts: function(dishes, categories, nationalities) {
    	var recepts = [];

    	alert(10);
    	$$.each(dishes, function(i, d) {
    		alert(9);
    		var v = {};
    		if ( d.categoryId ) {
    			v.category = categories[d.categoryId];
    		}

    		if ( d.nationalityId ) {
    			v.nationality = nationalities[d.nationalityId];
    		}

    		v.recept = d;

    		alert(8);

			recepts.push(v);
			alert(7);
    	});

    	alert(1);

    	var receptsTemplate = $$('script#recepts').html();
        var compiledReceptsTemplate = Template7.compile(receptsTemplate);
        var content = compiledReceptsTemplate({
        	recepts: recepts
        });

        alert(2);

        if ( $$('#myContent').find('.list-block').length ) {
        	alert(4);
        	var lis = $$(content).find('li');
        	if ( !lis.length ) {
				myApp.detachInfiniteScroll($$('.infinite-scroll'));
        	}

    		$$('#myContent ul').append(lis);
    		alert(5);
        } else {
        	alert(3);
    		$$('#myContent').append(content);
    		myApp.attachInfiniteScroll($$('.infinite-scroll'));
    		alert(5);
        }

        app.loading = false;
    }
};

app.init();
