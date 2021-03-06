AppCollection = new Meteor.Collection('AppCollection');

if (Meteor.isClient) {
    AppCollectionSubscription = Meteor.subscribe('AppCollection');
}

if (Meteor.isServer) {
    Meteor.publish('AppCollection', function() {
        var user = Meteor.users.findOne(this.userId);
        if (user == undefined)
            return undefined;
        return AppCollection.find({'_username' : user.username});
    });
}

AppCollection.allow({
    /*insert: function (userId, settings) {
        var user = Meteor.users.findOne(userId);
        if (user == undefined)
            return false;
        return (settings.username == user.username);
    },*/
    update: function (userId, settings) {
        var user = Meteor.users.findOne(userId);
        if (user == undefined)
            return false;
        return (settings._username == user.username);
    }
});
