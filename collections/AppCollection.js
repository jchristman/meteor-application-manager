WMCollection = new Meteor.Collection('WMCollection');

if (Meteor.isClient) {
    WMCollectionSubscription = Meteor.subscribe('WMCollection');
}

if (Meteor.isServer) {
    Meteor.publish('WMCollection', function() {
        var user = Meteor.users.findOne(this.userId);
        if (user == undefined)
            return undefined;
        return WMCollection.find({$or : [ {'default' : 'profile'} , {'username' : user.username} ]});
    });
}

WMCollection.allow({
    insert: function (userId, settings) {
        var user = Meteor.users.findOne(userId);
        if (user == undefined)
            return false;
        return (settings.username == user.username);
    },
    update: function (userId, settings) {
        var user = Meteor.users.findOne(userId);
        if (user == undefined)
            return false;
        return (settings.username == user.username);
    }
});
