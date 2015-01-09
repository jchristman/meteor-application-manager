Application = function(settings, index) {
    if (!settings.hasOwnProperty('appID'))      throw new Error('Application must have an appID! Try this one: ' + ApplicationManager.genUUID());
    if (!settings.hasOwnProperty('appName'))    throw new Error('Application must have a name for the UI to use. Define the appName field in your config.');
    if (!settings.hasOwnProperty('layout'))     throw new Error('Applications with a layout are not yet supported.');
    if (!settings.hasOwnProperty('type'))       settings.type = Application.WINDOWED_APPLICATION;

    this.api = {}
    if (settings.hasOwnProperty('api'))         this.registerAPI(settings.api);

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
    var app = this.getAppData();
    var update = {}
    update[this.appID + '.appOpen'] = true;

    this.updateAppData(update);
    
    this.window_manager.start();
}

Application.prototype.quitApp = function(delegate) {
    if (delegate == undefined)
        this.window_manager.quit();

    var app = this.getAppData();
    var update = {}
    update[this.appID + '.appOpen'] = false;

    this.updateAppData(update);
}

Application.prototype.registerAPI = function(app_api) {
    var self = this;
    _.each(app_api, function(val, key) {
        if (typeof val != 'function') throw new Error('API must be an object of name -> function maps');
        self.api[key] = val;
    });
}

Application.prototype.call = function(api, args) {
    if (!this.api.hasOwnProperty(api)) throw new Error('API ' + api + ' does not exist for ' + this);
    this.api[api](args);
}

Application.WINDOWED_APPLICATION = 1;
Application.DIALOG_APPLICATION = 2;
Application.TABBED_WINDOW = 1;
Application.NOT_TABBED_WINDOW = 2;
