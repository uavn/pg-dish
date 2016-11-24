// Initialize app
var myApp = new Framework7({
    // Default title for modals
    modalTitle: 'Рецепты',
 
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
	limit: 20,
	categoryId: null,
	nationId: null,
	randomize: false,
	loadIds: null,

	ajax1Id: null,
	ajax2Id: null,
	ajax3Id: null,

    init: function() {
    	$$(document).on('ajaxStart', function() {
    		myApp.showIndicator();
    	});

    	$$(document).on('ajaxComplete', function() {
    		myApp.hideIndicator();
    	});

        $$('.tab-categories').click(function() {
        	myApp.closePanel();

        	myApp.materialTabbarSetHighlight(
        		$$('.tabbar.toolbar-bottom'),
        		$$(this)
    		);
            $$('.art-tabs .tab-link').removeClass('active');
            $$(this).addClass('active');

            $$('#title').html('Категории');

            app.loadCategories();
        });

        $$('.tab-nations').click(function() {
        	myApp.closePanel();

        	myApp.materialTabbarSetHighlight(
        		$$('.tabbar.toolbar-bottom'),
        		$$(this)
    		);
            $$('.art-tabs .tab-link').removeClass('active');
            $$(this).addClass('active');

            $$('#title').html('Национальная кухня');

            app.loadNations();
        });

        $$('.tab-types').click(function() {
        	myApp.closePanel();

        	myApp.materialTabbarSetHighlight(
        		$$('.tabbar.toolbar-bottom'),
        		$$(this)
    		);
            $$('.art-tabs .tab-link').removeClass('active');
            $$(this).addClass('active');

            $$('#title').html('Типы');

            app.loadTypes();
        });

        $$('.tab-all').click(function() {
        	myApp.closePanel();

        	myApp.materialTabbarSetHighlight(
        		$$('.tabbar.toolbar-bottom'),
        		$$(this)
    		);
            $$('.art-tabs .tab-link').removeClass('active');
            $$(this).addClass('active');

            app.nationId = null;
        	app.categoryId = null;
        	app.typeId = null;

        	$$('#myContent').html('');

        	$$('#title').html('Все рецепты');

            app.randomize = true;
	        app.loadRecepts();
        });

        $$(document).on('click', '.open-category', function() {
        	app.nationId = null;
        	app.typeId = null;
        	app.q = null;
        	$$('input[type=search]').val('');
        	app.categoryId = $$(this).data('id');

        	$$('#myContent').html('');

        	$$('#title').html('Рецепты в категории');

        	app.randomize = false;
            app.loadRecepts();
        });

        $$(document).on('click', '.open-nation', function() {
        	app.categoryId = null;
        	app.typeId = null;
        	app.q = null;
        	$$('input[type=search]').val('');
        	app.nationId = $$(this).data('id');

        	$$('#myContent').html('');

        	$$('#title').html('Национальные рецепты');

        	app.randomize = false;
            app.loadRecepts();
        });

        $$(document).on('click', '.open-type', function() {
        	app.categoryId = null;
        	app.q = null;
        	$$('input[type=search]').val('');
        	app.nationId = null;
        	app.typeId = $$(this).data('id');

        	$$('#myContent').html('');

        	$$('#title').html('Типы');

        	app.randomize = false;
            app.loadRecepts();
        });

        $$(document).on('click', '.tab-history', function() {
			var storage = window.localStorage;

			var history = storage.getItem('history');
			if ( history ) {
				app.loadIds = history;
				app.loadRecepts();
				app.loadIds = [];
			} else {
				myApp.alert('История пустая');
			}
        });



        $$('.infinite-scroll').on('infinite', function () {
        	// Exit, if loading in progress
			if (app.loading) return;

			// Set loading flag
			app.loading = true;

			app.loadRecepts(app.page + 1);
 		});

		$$(document).on('click', '.recept-link', function() {
			var id = $$(this).data('id');

			app.loadRecept(id);
		});

		$$(document).on('click', '.chip', function() {
			myApp.closeModal('.popup-recept');
		});

 		var mySearchbar = myApp.searchbar('.searchbar', {
		    customSearch: true,
		    onSearch: function(s) {
		    	app.categoryId = null;
	        	app.nationId = null;
	        	app.typeId = null;
		    	app.q = s.value;
		    	
		    	$$('#myContent').html('');
		    	
		    	app.randomize = false;
		    	app.loadRecepts();

		    	$$('.searchbar-overlay').hide();

		    	$$('#title').html(app.q);
		    },
		    onClear: function(s) {
		    	app.q = null;
		    	app.loadRecepts();

		    	$$('#title').html('Все рецепты');
		    }
		});  

 		app.randomize = true;
        app.loadRecepts();
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

    loadTypes: function() {
    	myApp.detachInfiniteScroll($$('.infinite-scroll'));

        $$.ajax({
            dataType: 'json',
            url: 'http://r.uartema.com/api/api.php/type?transform=1&order=name',
            success: function( resp ) {
                var categoriesTemplate = $$('script#categories').html();
                var compiledCategoriesTemplate = Template7.compile(categoriesTemplate);
                
                $$('#myContent').html(compiledCategoriesTemplate({
                	categoies: resp.type
                }));

                $$('#myContent').find('.item-link').addClass('open-type');
            }
        });
    },

    loadRecepts: function(page) {
    	// myApp.closeModal('.popup-recept');

		// Kill old ajaxs
		if ( app.ajax1Id ) {
			app.ajax1Id.abort();
		}

		if ( app.ajax2Id ) {
			app.ajax2Id.abort();
		}

		if ( app.ajax3Id ) {
			app.ajax3Id.abort();
		}

		// Params
    	if ( !page || page <= 1 ) {
        	app.page = 1;
        } else {
        	app.page = page;
        }

        // Filters
        var filters = [];
		if ( app.loadIds ) {
			filters.push('id,in,' + app.loadIds.join(','));
		} else {
			if (app.categoryId) {
				filters.push('categoryId,eq,' + app.categoryId);
			}

			if (app.nationId) {
				filters.push('nationalityId,eq,' + app.nationId);
			}

			if (app.typeId) {
				filters.push('typeId,eq,' + app.typeId);
			}

			if (app.q) {
				filters.push('name,cs,' + app.q);
			}
		}
		// /Filters

        app.ajax1Id = $$.ajax({
            dataType: 'json',
            data: {
                filter: filters,
                page: (app.randomize ? '1,' + app.limit : app.page + ',' + app.limit),
                order: (app.randomize ? 'rand' : 'id,desc')
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
					app.ajax2Id = $$.ajax({
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
								app.ajax3Id = $$.ajax({
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

    	$$.each(dishes, function(i, d) {
    		var v = {};
    		if ( d.categoryId ) {
    			v.category = categories[d.categoryId];
    		}

    		if ( d.nationalityId ) {
    			v.nationality = nationalities[d.nationalityId];
    		}

    		v.recept = d;

			recepts.push(v);
    	});

    	var receptsTemplate = $$('script#recepts').html();
        var compiledReceptsTemplate = Template7.compile(receptsTemplate);
        var content = compiledReceptsTemplate({
        	recepts: recepts
        });

        if ( $$('#myContent').find('.list-block').length ) {
        	var lis = $$(content).find('li');
        	if ( !lis.length ) {
				myApp.detachInfiniteScroll($$('.infinite-scroll'));
        	}

    		$$('#myContent ul').append(lis);
        } else {
    		$$('#myContent').append(content);
    		myApp.attachInfiniteScroll($$('.infinite-scroll'));
        }

        app.loading = false;
    },

	loadRecept: function(id) {
		// myApp.detachInfiniteScroll($$('.infinite-scroll'));

		// Save to history
		var storage = window.localStorage;

		var history = storage.getItem('history');
		if ( !history ) {
			history = [];
		} else {
			history = JSON.parse(history);
		}
		// Limit history
		if ( history.length >= 30 ) {
			history.shift();
		}
		history.push(id);

		storage.setItem('history', JSON.stringify(history));

		$$.ajax({
			dataType: 'json',
			url: 'http://r.uartema.com/api/api.php/dish/' + id,
			success: function( resp ) {
				if ( !resp.description.trim() ) {
					resp.description = null;
				}
				var receptTemplate = $$('script#recept').html();
				var compiledReceptTemplate = Template7.compile(receptTemplate);

				$$('.popup-recept').html(compiledReceptTemplate({
					recept: resp
				}));

				$$('.recept-title').html(resp.name);

				myApp.popup('.popup-recept');

				if ( resp.categoryId ) {
					$$.ajax({
						dataType: 'json',
						url: 'http://r.uartema.com/api/api.php/category/' + resp.categoryId,
						success: function (resp) {
							$$('#category-chip span').html(resp.name);
							$$('#category-chip').css('display', 'inline-block');
							$$('#category-chip').data('id', resp.id);
						}
					});
				}

				if ( resp.nationalityId ) {
					$$.ajax({
						dataType: 'json',
						url: 'http://r.uartema.com/api/api.php/nationality/' + resp.nationalityId,
						success: function (resp) {
							$$('#nation-chip span').html(resp.name);
							$$('#nation-chip').css('display', 'inline-block');
							$$('#nation-chip').data('id', resp.id);
						}
					});
				}

				if ( resp.typeId ) {
					$$.ajax({
						dataType: 'json',
						url: 'http://r.uartema.com/api/api.php/type/' + resp.typeId,
						success: function (resp) {
							$$('#type-chip span').html(resp.name);
							$$('#type-chip').css('display', 'inline-block');
							$$('#type-chip').data('id', resp.id);
						}
					});
				}

				// Ingridients
				$$.ajax({
					dataType: 'json',
					data: {
						filter: 'dishId,eq,'+id
					},
					url: 'http://r.uartema.com/api/api.php/dish_ingredient?transform=1',
					success: function (resp) {
						var measures = {
						  '': "г",
						  0: "",
						  1: "г",
						  2: "кг",
						  3: "л",
						  4: "мл",
						  5: "ст.л.",
						  6: "ч.л.",
						  7: "шт",
						  8: "зубчик",
						  9: "пучок",
						  10: "щепотка",
						  11: "упаковка",
						  12: "дольки",
						  13: "стакан",
						  14: "ложка",
						  15: "вилка",
						  16: "пачка",
						  17: "ломтик",
						  18: "банка",
						  19: "бутылка",
						  20: "по вкусу"
						};

						var ingrds = {};
						$$.each(resp.dish_ingredient, function(i, di) {
							di.measure = measures[di.mera === null ? '' : di.mera];
							ingrds[di.ingredientId] = {
								di: di
							}
						});

						var ingrIds = Object.keys(ingrds);

						if ( !ingrIds.length ) {
							$$('.ingr-rel').hide();
						} else {
							$$('.ingr-rel').show();

							$$.ajax({
								dataType: 'json',
								data: {
									filter: 'id,in,' + ingrIds.join(',')
								},
								url: 'http://r.uartema.com/api/api.php/ingredient?transform=1',
								success: function (resp) {
									$$.each(resp.ingredient, function(i, ing) {
										ing.name = ing.name.toLowerCase();
										ingrds[ing.id]['ing'] = ing;
									});

									var ingrsTemplate = $$('script#ingrstpl').html();
									var compiledIngrsTemplate = Template7.compile(ingrsTemplate);

									$$('#ingrs').html(compiledIngrsTemplate({
										ingrds: ingrds
									}));
								}
							});
						}
					}
				});



				// Steps
				$$.ajax({
					dataType: 'json',
					data: {
						filter: 'dishId,eq,'+id
					},
					url: 'http://r.uartema.com/api/api.php/step?transform=1&order=index',
					success: function (resp) {
						var stepsTemplate = $$('script#stepstpl').html();
						var compiledStepsTemplate = Template7.compile(stepsTemplate);

						$$('#steps').html(compiledStepsTemplate({
							steps: resp.step
						}));
					}
				});



			}
		});

	}
};

app.init();
