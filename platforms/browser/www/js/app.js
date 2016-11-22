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
    },

    preprocess: function (content, url, next) {
        if (url === 'people.html') {
            var template = Template7.compile(content);
            var resultContent = template({
                title: 'People',
                people: ['John', 'Ivan', 'Mary']
            })
            return resultContent;
        }
    }
});   
 
// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
 
// Add view
var mainView = myApp.addView('.view-main', {
  // Because we want to use dynamic navbar, we need to enable it for this view:
  dynamicNavbar: true
});

