ApplicationManager = function() {
    this.applications = {};
    this.windows = [];
    this.menubarActions = [];

    if (Meteor.isServer) AppCollection.remove({});
}

// -----------------------------------------------------------------------//
// Static functions
// -----------------------------------------------------------------------//
ApplicationManager.genUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

ApplicationManager.ensureUserExists = function(user) {
    if (Meteor.isServer) {
        UWPManager.getUWP(user);
    }
}

// -----------------------------------------------------------------------//
// Setup functions
// -----------------------------------------------------------------------//
ApplicationManager.prototype.registerApp = function(settings) {
    if (!this.applications.hasOwnProperty(settings.appID)) {
        this.applications[settings.appID] = new Application(settings, _.size(this.applications));
    } else {
        throw new Error("ALREADY REGISTERED AN APP WITH THIS ID: " + settings.appID + ".\n Try this one: " + ApplicationManager.genUUID());
    }
}

// -----------------------------------------------------------------------//
// App Accessibility Functions
// -----------------------------------------------------------------------//
ApplicationManager.prototype.getApps = function() {
    return _.map(this.applications, function(app) {
        return app;
    });
}

ApplicationManager.prototype.getApp = function(appID) {
    return this.applications[appID];
}

ApplicationManager.prototype.getAppsData = function() {
    return _.map(this.applications, function(app) {
        return app.getAppData();  
    });
}

ApplicationManager.prototype.getAppData = function(appID) {
    return this.applications[appID].getAppData();
}

ApplicationManager.prototype.getWindowManagers = function() {
    return _.map(this.applications, function(app) {
        return app.window_manager;
    });
}

ApplicationManager.prototype.getWindowManager = function(appID) {
    return this.applications[appID].window_manager;
}

ApplicationManager.prototype.getAppList = function(applications, sortList) {
    var appList = _.map(applications, function(_app, _appID) {
        return _app;
    });
    
    appList = appList.filter(function(app) {
        return app.getAppData().appOpen;  
    });

    if (sortList)
        return _.sortBy(appList, function(_app) {
            return _app.getAppData().zLayer;
        });
    else
        return appList;   
}

// -----------------------------------------------------------------------//
// App Interaction Functions
// -----------------------------------------------------------------------//
ApplicationManager.prototype.grabFocus = function(appID) {
    if (appID != undefined) var applications = _.omit(this.applications, appID);
    else                    var applications = this.applications;

    var appList = this.getAppList(applications, true);
    if (appList.length > 0) {
        var counter = 0;
        _.each(appList, function(_app) {
            _app.setZLayer(counter);
            counter += 1;
        });
        
    }
    
    if (appID != undefined)
        this.getApp(appID).setZLayer(_.size(this.applications));
}

ApplicationManager.prototype.start = function(appID) {
    this.applications[appID].startApp();
    this.grabFocus(appID);
}

ApplicationManager.prototype.quit = function(appID) {
    this.applications[appID].quitApp();
}

// -----------------------------------------------------------------------//
// Create global AppManager
// -----------------------------------------------------------------------//
AppManager = new ApplicationManager();

// -----------------------------------------------------------------------//
// Make sure that a profile is created for every user that logs in
// -----------------------------------------------------------------------//
if (Meteor.isServer) {
    Accounts.validateLoginAttempt(function(attempt) {
        if (attempt.allowed) // Check for the profile and complete it before login if successful
            ApplicationManager.ensureUserExists(attempt.user);
        return attempt.allowed;
    });

}
