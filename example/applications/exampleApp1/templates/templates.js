if (Meteor.isClient) {
    Template.exampleApp1_template1.helpers({
        api_msg : function() {
            return Session.get('_app1_msg');
        }
    });
}
