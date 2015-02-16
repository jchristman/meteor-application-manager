if (Meteor.isClient) {
    Meteor.startup(function() {
        context.init({preventDoubleContext: false});
    });

    // Applications iterator
    Template.Applications.helpers({
        applications : function() {
            var apps = AppManager.getAppsData();
            return apps;
        }
    });

    Template.AppManagerApplication.helpers({
        isAppOpen : function() {
            return this.appOpen;
        },

        layout : function() {
            return { windows : this.layout.windows, tabs : this.layout.tabs }
        },

        isWindowOpen : function() {
            return !this.closed;
        }
    });

    // Window rendered
    Template.AppManagerAppWindow.rendered = function() {
        var data = this.data;
        $(this.findAll('.window')).each(function(index, element) {
            element = $(element);
            var window_manager = AppManager.getWindowManager(element.data('appid'));
            window_manager.registerWindow(element, data);
        });
    }

    Template.AppManagerAppWindow.helpers({
        isFocused : function() {
            return this.focused;
        },

        isMinimized : function() {
            return this.minimized;
        },

        isMaximized : function() {
            return this.maximized;
        },

        hasMenubar : function() {
            return (this.menubar != undefined);
        },

        hasMaximizeButton : function() {
            return this.maximize_button;
        },

        hasMinimizeButton : function() {
            return this.minimize_button;
        },
        
        hasRestoreButton : function() {
            return this.restore_button;
        },

        isResizable : function() {
            return this.resizable;
        },

        windowTypeSwitch : function() {
            switch (this.type) {
                case Application.NOT_TABBED_WINDOW:
                    return _.extend(this, { windowType : Template[this.template] });
                case Application.PAGED_WINDOW:
                    return _.extend(this, { windowType : Template['AppManagerPagedWindow'] });
                default: // Default is Application.TABBED_WINDOW
                    return _.extend(this, { windowType : Template['AppManagerTabbedWindow'] });
            }
        }
    });

    // -------------------- //
    //     Menubar code     //
    // -------------------- //
    Template.menubarMenu.helpers({
        menuContext : function(window_id) {
            var window_manager = AppManager.getWindowManager(this.appID);
            return { menu : window_manager.getMenu(window_id) };
        }
    });

    Template.menubarMenuItem.helpers({
        isDivider : function() {
            return (this.text == undefined);
        },

        hasSubmenu : function() {
            return (this.subMenu != undefined);
        }
    });

    Template.menubarMenuItem.events({
        'click .menubarAction' : function(event) {
            var element = $(event.target);
            var window_manager = AppManager.getWindowManager(element.closest('.window').data('appid'));
            window_manager.menubarActions[parseInt(element.data('action'))](element);
        }
    });
}
