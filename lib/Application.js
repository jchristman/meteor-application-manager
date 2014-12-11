Application = function(settings) {
    if (!settings.hasOwnProperty('appID'))  throw new Error('Application must have an appID! Use ApplicationManager.genUUID() to generate one from your console.');
    if (!settings.hasOwnProperty('layout')) throw new Error('Applications with a layout are not yet supported.');

    this.appID = settings.appID;
    this.window_manager = new WindowManager(this, settings);
}

Application.prototype.getAppData = function() {
    if (AppCollectionSubscription.ready()) {
        var uwp = UWPManager.getUWP(Meteor.user());
        return uwp[this.appID];
    } else {
        return undefined;
    }
}
