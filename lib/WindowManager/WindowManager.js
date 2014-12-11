WindowManager = function(settings) {
    this.windows = [];
    this.tabs = [];

    this.configure(settings.appID, settings.layout);
}

WindowManager.prototype.configure = function(appID, settings) {
    var self = this;
    if (!settings.hasOwnProperty('windows'))    settings.windows = [];
    if (!settings.hasOwnProperty('tabs'))       settings.tabs = [];
    if (!settings.hasOwnProperty('appOpen'))    settings.appOpen = false;
    if (!settings.hasOwnProperty('zLayer'))     settings.zLayer = 0;
    
    _.each(settings.windows, function(win) {
        if (!win.hasOwnProperty('title'))       win.title = '';
        if (!win.hasOwnProperty('focused'))     win.focused = false;
        if (!win.hasOwnProperty('minimized'))   win.minimized = false;
        if (!win.hasOwnProperty('maximized'))   win.maximized = false;
        if (!win.hasOwnProperty('pane_tree'))   win.pane_tree = { id : win.id + '_pane' };
        if (!win.hasOwnProperty('closed'))      win.closed = false;
        if (!win.hasOwnProperty('zIndex'))      win.zIndex = 0;
        if (win.hasOwnProperty('menubar')) {
            _.each(win.menubar, function(menu) {
                self.processMenu(menu.menuItems);
            });
        }
    });

    _.each(settings.tabs, function(tab) {
        if (!tab.hasOwnProperty('closed'))      tab.closed = false;
        if (!tab.hasOwnProperty('active'))      tab.active = true;
    });

    if (Meteor.isServer) {
        // Find the default profile
        var default_window_profile = AppCollection.findOne({'default' : 'profile'});
        if (default_window_profile == undefined) {
            AppCollection.insert({'default' : 'profile'});   
            default_window_profile = AppCollection.findOne({'default' : 'profile'});
        } 
        // And make sure it has a record for this appID
        if (default_window_profile[appID] == undefined) {
            var update = {}
            update[appID] = settings;
            
            AppCollection.update({'default' : 'profile'}, {
                $set : update
            });
        } else {
            throw new Error('WARNING! POSSIBLE DUPLICATE appID!');
        }
    }
}
