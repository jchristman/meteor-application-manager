if (Meteor.isClient) {
    Template.exampleApp2_template1.events({
        'click #app1-api-submit' : function(event) {
            var msg = $('#app1-api').val();
            AppManager.getApp('Example Application 1').call('setMessage', msg);
        }
    });
}
