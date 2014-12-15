Application = function(settings, index) {
    if (!settings.hasOwnProperty('appID'))  throw new Error('Application must have an appID! Use ApplicationManager.genUUID() to generate one from your console.');
    if (!settings.hasOwnProperty('appName'))  throw new Error('Application must have a name for the UI to use. Define the appName field in your config.');
    if (!settings.hasOwnProperty('layout')) throw new Error('Applications with a layout are not yet supported.');

    this.appID = settings.appID;
    this.appName = settings.appName;
    this.layerDepth = 100;
    settings.zLayer = index;
    this.window_manager = new WindowManager(this, settings);
    this.window_manager.init();
}

Application.prototype.getAppData = function() {
    if (AppCollectionSubscription.ready()) {
        var uwp = UWPManager.getUWP(Meteor.user());
        return uwp[this.appID];
    } else {
        return undefined;
    }
}

Application.prototype.updateAppData = function(update) {
    if (AppCollectionSubscription.ready()) {
        var uwp = UWPManager.getUWP(Meteor.user());
        AppCollection.update(uwp._id, {
            $set : update
        });
    } else {
        return undefined;
    }
}

Application.prototype.grabFocus = function() {
    AppManager.grabFocus(this.appID);
}

Application.prototype.setZLayer = function(value) {
    var app = this.getAppData();
    var update = {}
    update[this.appID + '.zLayer'] = value;
    
    this.updateAppData(update);

    this.window_manager.correctZIndices();
}

Application.prototype.startApp = function() {
    this.window_manager.start();

    var app = this.getAppData();
    var update = {}
    update[this.appID + '.appOpen'] = true;

    this.updateAppData(update);
}

Application.prototype.quitApp = function(delegate) {
    if (delegate == undefined)
        this.window_manager.quit();

    var app = this.getAppData();
    var update = {}
    update[this.appID + '.appOpen'] = false;

    this.updateAppData(update);
}
