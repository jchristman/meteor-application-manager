ApplicationManager = function() {
    this.applications = {};
    this.windows = [];
    this.menubarActions = [];

    if (Meteor.isServer) AppCollection.remove({});
}

ApplicationManager.genUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

ApplicationManager.prototype.ensureUserExists = function(user) {
    if (Meteor.isServer) {
        UWPManager.getUWP(user);
    }
}

ApplicationManager.prototype.registerApp = function(settings) {
    if (!this.applications.hasOwnProperty(settings.appID))
        this.applications[settings.appID] = new Application(settings);
}

ApplicationManager.prototype.getAppsData = function() {
    return _.map(this.applications, function(app) {
        return app.getAppData();  
    });
}

ApplicationManager.prototype.getAppData = function(appID) {
    return this.applications[appID].getAppData();
}

AppManager = new ApplicationManager();

if (Meteor.isServer) {
    Accounts.validateLoginAttempt(function(attempt) {
        if (attempt.allowed) // Check for the profile and complete it before login if successful
            AppManager.ensureUserExists(attempt.user);
        return attempt.allowed;
    });
}
