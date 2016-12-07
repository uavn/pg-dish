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
    historyLimit: 30,
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

        $$(document).on('ajaxError', function() {
            myApp.hideIndicator();
            myApp.alert('Произошла ошибка, попробуйте еще раз');
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

        $$('.tab-creds').click(function() {
            myApp.detachInfiniteScroll($$('.infinite-scroll'));
            myApp.closePanel();

            var tpl = Template7.compile($$('script#creds').html());

            $$('#myContent').html(tpl({
            }));

            $$('#title').html('О приложении');
        });

        $$('.tab-form').click(function() {
            myApp.detachInfiniteScroll($$('.infinite-scroll'));
            myApp.closePanel();

            var tpl = Template7.compile($$('script#form').html());

            $$('#myContent').html(tpl({
            }));

            app.setupSuggest();

            $$('#title').html('Поиск по ингридиентам');
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
            myApp.closePanel();

            var storage = window.localStorage;

            var history = storage.getItem('history');

            if ( history ) {
                app.randomize = false;

                $$('#myContent').html('');

                app.loadIds = JSON.parse(history);
                app.loadRecepts();
                app.loadIds = [];

                $$('#title').html('История просмотров');
            } else {
                myApp.alert('История пустая');
            }
        });

        $$(document).on('click', '.tab-fav', function() {
	        myApp.closePanel();

            myApp.materialTabbarSetHighlight(
                $$('.tabbar.toolbar-bottom'),
                $$(this)
            );
            $$('.art-tabs .tab-link').removeClass('active');
            $$(this).addClass('active');

            var storage = window.localStorage;

			var fav = storage.getItem('fav');
			if ( fav ) {
				app.randomize = false;

				$$('#myContent').html('');

				app.loadIds = JSON.parse(fav);
				app.loadRecepts();
				app.loadIds = [];

				$$('#title').html('Избранные рецепты');
			} else {
				myApp.alert('Избранных нет');
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

        $$(document).on('click', '.rm-fav-rec', function() {
            var id = $$(this).data('id');
            var storage = window.localStorage;

            var fav = storage.getItem('fav');
            if ( fav ) {
                fav = JSON.parse(fav);

                var key = fav.indexOf(id);

                if ( key > -1 ) {
                    fav.splice(key, 1);

                    storage.setItem('fav', JSON.stringify(fav));

                    myApp.alert('Рецепт убран из списка избранных');
                }
            }

            $$('.add-fav-rec').show();
            $$('.rm-fav-rec').hide();

            $$('.tab-fav').click();
        });


		$$(document).on('click', '.add-fav-rec', function() {
            var id = $$(this).data('id');
			var storage = window.localStorage;

			var fav = storage.getItem('fav');
			if ( !fav ) {
				fav = [];
			} else {
				fav = JSON.parse(fav);
			}

			if ( fav.indexOf(id) > -1 ) {
                myApp.alert('Этот рецепт уже в списке избранных');
            } else {
                fav.push(id);

                storage.setItem('fav', JSON.stringify(fav));
                // myApp.alert('Рецепт добавлен в список избранных');
            }

            $$('.add-fav-rec').hide();
            $$('.rm-fav-rec').show();
		});

        app.initChipEvents();

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

				$$(window).scrollTop(0);
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

				$$(window).scrollTop(0);
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

				$$(window).scrollTop(0);
            }
        });
    },

    loadRecepts: function(page) {
        var loadIds = ( app.loadIds )
            ? app.loadIds
            : [];

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

        page = (app.randomize
            ? '1,' + app.limit
            : app.page + ',' + app.limit
        );

        var infScroll = true;

        // Filters
        var filters = [];
        if ( loadIds.length > 0 ) {
            filters.push('id,in,' + loadIds.join(','));

            page = '1';

            infScroll = false;
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

        var data = {
            filter: filters,
            page: page,
            order: (app.randomize ? 'rand' : 'id,desc')
        };

        app.ajax1Id = $$.ajax({
            dataType: 'json',
			type: 'POST',
            data: data,
            url: 'http://r.uartema.com/api/api.php/dish?transform=1',
            success: function( resp ) {
                if ( !resp.dish.length && !infScroll ) {
                    myApp.alert('Ничего не найдено');
                }

                var categoriesIds = [];
                var nationIds = [];

                var rdishes = [];
                if ( loadIds.length ) {
                    var dishes = {};
                    $$.each(resp.dish, function (i, d) {
                        dishes[d.id] = d;
                    });

                    $$.each(loadIds.reverse(), function (i, id) {
                        if ( dishes[id] ) {
                            rdishes.push(dishes[id]);
                        }
                    });
                } else {
                    rdishes = resp.dish;
                }

                rdishes = $$.unique(rdishes);

                $$.each(rdishes, function(i, dish) {
                    if ( dish.categoryId ) {
                        categoriesIds.push(dish.categoryId);
                    }

                	if ( dish.nationalityId ) {
                		nationIds.push(dish.nationalityId);
                	}
                });

                categoriesIds = $$.unique(categoriesIds);
                nationIds = $$.unique(nationIds);


                if ( categoriesIds.length ) {
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

			            	if ( nationIds.length ) {
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

						            	app.listRecepts(rdishes, categories, nationalities, infScroll);
						            }
						        });
				            } else {
                                app.listRecepts(rdishes, categories, [], infScroll);
				            }
			            }
			        });
		        } else {
                    app.listRecepts(rdishes, [], [], infScroll);
		        }
            }
        });
    },

    listRecepts: function(dishes, categories, nationalities, infScroll) {
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

        $$(window).scrollTop(0);

        if ( $$('#myContent').find('.card').length ) {
            var lis = $$('<div/>').html(content).find('.card');
            if ( !lis.length ) {
                myApp.detachInfiniteScroll($$('.infinite-scroll'));
            }

    		$$('#myContent').append(content);
        } else {
    		$$('#myContent').append(content);

            if ( infScroll ) {
                myApp.attachInfiniteScroll($$('.infinite-scroll'));
            } else {
                myApp.detachInfiniteScroll($$('.infinite-scroll'));
            }
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
		if ( history.length >= app.historyLimit ) {
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

                $$('.popup-recept').scrollTop(0);

                // Check for fav
                var storage = window.localStorage;
                var fav = storage.getItem('fav');
                if ( fav ) {
                    fav = JSON.parse(fav);

                    if ( fav.indexOf(id) > -1 ) {
                        $$('.rm-fav-rec').show();
                    } else {
                        $$('.add-fav-rec').show();
                    }
                } else {
                    $$('.add-fav-rec').show();
                }
                // /Check for fav


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
						  '': "ед",
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
	},

    setupSuggest: function() {
        app.searchValues = {};

        var autocompleteDropdownAjax = myApp.autocomplete({
            input: '#autocomplete-dropdown-ajax',
            openIn: 'dropdown',
            preloader: true, //enable preloader
            valueProperty: 'id', //object's "value" property name
            textProperty: 'name', //object's "text" property name
            limit: 20, //limit to 10 results
            expandInput: true, // expand input
            multiple: true,
            source: function (autocomplete, query, render) {
                var results = [];

                if (query.length === 0) {
                    render(results);
                    return;
                }

                // Show Preloader
                autocomplete.showPreloader();

                // Do Ajax request to Autocomplete data
                $$.ajax({
                    url: 'http://r.uartema.com/api/api.php/group?transform=1',
                    method: 'GET',
                    dataType: 'json',
                    data: {
                        filter: ['name,cs,' + query],
                        page: '1,10',
                        order: 'name'
                    },
                    success: function (data) {
                        var res = data.group;

                        // Find matched items
                        for ( var i = 0; i < res.length; i++ ) {
                            res[i].name = res[i].name.toLowerCase();

                            results.push(res[i]);
                        }

                        // Hide Preoloader
                        autocomplete.hidePreloader();

                        // Render items by passing array with result items
                        render(results);
                    }
                });
            },

            onChange: function(ac, value) {
                app.searchValues[value.id] = value.name;
                app.processSearchChips();

                $$('#autocomplete-dropdown-ajax').val('');
            }
        });
    },

    searchValues: {},

    processSearchChips: function() {
        $$('#selectedChips').html('');

        $$.each(app.searchValues, function(id, name) {
            var chip = $$('<div/>').addClass('chip').append(
                $$('<div/>').addClass('chip-label').html(name)
            ).data('id', id);

            $$('#selectedChips').append(chip);
        });
    },

    initChipEvents: function() {
        $$(document).on('click', '#selectedChips .chip', function() {
            var id = $$(this).data('id');

            delete app.searchValues[id];
            app.processSearchChips();
        });

        $$(document).on('click', '#processSearch', function() {
            $$.ajax({
                url: 'http://r.uartema.com/api/search.php',
                method: 'GET',
                dataType: 'json',
                type: 'POST',
                data: {
                    groupIds:  Object.keys(app.searchValues)
                },
                success: function( resp ) {
                    app.randomize = false;

                    $$('#myContent').html('');

                    app.loadIds = resp;
                    app.loadRecepts();
                    app.loadIds = [];
                }
            });

        });
    }
};

app.init();
