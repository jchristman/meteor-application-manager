UserWindowProfileManager = function() {
    this.uwp = undefined;
}

UserWindowProfileManager.prototype.getUWP = function(user) {
    if (user != undefined) {
        this.uwp = AppCollection.findOne({'_username' : user.username});
        if (Meteor.isServer && this.uwp == undefined) {
            this.uwp = this.createUserWindowProfile(user);
        }
    }
    return this.uwp;
}

UserWindowProfileManager.prototype.createUserWindowProfile = function(user) {
    var default_window_profile = AppCollection.findOne({'default' : 'profile'});
    delete default_window_profile._id;
    delete default_window_profile.default;
    AppCollection.insert(_.extend({'_username' : user.username}, default_window_profile));

    return AppCollection.findOne({'_username' : user.username});
}

UserWindowProfileManager.prototype.deleteUserWindowProfile = function(user) {
    this.uwp = undefined;
    AppCollection.remove({'_username' : user.username});
}

UserWindowProfileManager.prototype.resetUserWindowProfile = function(user) {
    this.deleteUserWindowProfile(user);
    this.getUWP(user);
}

UWPManager = new UserWindowProfileManager();
