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
    if (!this.applications.hasOwnProperty(settings.appID))
        this.applications[settings.appID] = new Application(settings);
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
