if (Meteor.isClient) {
    Template.body.rendered = function() {
        context.init({preventDoubleContext: false});
        context.attach('body', BODY_CONTEXT_MENU);
    }
}
