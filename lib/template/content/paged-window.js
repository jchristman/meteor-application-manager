Template.AppManagerPagedWindow.helpers({
    enumPageTitles : function() {
        _.each(this.pages, function(page, index) {
            page.index = index;
        });
        return this.pages;
    },

    getSelectedPage : function() {
        var selected_page = undefined;
        _.each(this.pages, function(page) {
            if (page.selected) selected_page = Template[page.template];
        });
        return { selectedPage : selected_page };
    }
});

Template.AppManagerPagedWindow.events({
    'click .ampw-page-title' : function(event, context) {
        var selected_index = $(event.target).closest('div').data('index');

        var windowData = Template.parentData(1);
        _.each(windowData.pages, function(page, index) {
            page.selected = false;
            if (index == selected_index) page.selected = true;
        });

        AppManager.getWindowManager(windowData.appID).updateWindow(windowData);
    }
});
