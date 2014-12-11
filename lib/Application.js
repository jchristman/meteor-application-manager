Application = function(settings) {
    if (!settings.hasOwnProperty('appID'))  throw new Error('Application must have an appID! Use ApplicationManager.genUUID() to generate one from your console.');
    if (!settings.hasOwnProperty('layout')) throw new Error('Applications with a layout are not yet supported.');

    this.window_manager = new WindowManager(settings);
}
