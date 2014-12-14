BODY_CONTEXT_MENU = {
    id: 'BODY-CONTEXT-MENU',
    data : [
    {
        header: 'Main Actions'
    },
    {
        icon: 'glyphicon-play',
        text: 'Start Application:',
        subMenu : [
                {
                    header: 'Stopped Applications'
                },
                {
                    menu_item_src : 'BODY_MENU_FUNCS.startApplication'
                }
            ]
    },
    {
        icon: 'glyphicon-off',
        text: 'Quit Application:',
        subMenu : [
                {
                    header: 'Running Applications'
                },
                {
                    menu_item_src : 'BODY_MENU_FUNCS.quitApplication'
                }
            ]
    }
]};

BODY_MENU_FUNCS = {
    startApplication : function(selector) {
        var appMenu = _.map(AppManager.getApps(), function(app) {
            if (!app.getAppData().appOpen) {
                return {
                    text : app.appName,
                    action : function(e, selector) {
                        app.startApp();
                    }
                }
            }
        });
        return appMenu.filter(function(app) {
            return (app != undefined);
        });
    },

    quitApplication : function(selector) {
        var appMenu = _.map(AppManager.getApps(), function(app) {
            if (app.getAppData().appOpen) {
                return {
                    text : app.appName,
                    action : function(e, selector) {
                        app.quitApp();
                    }
                }
            }
        });
        return appMenu.filter(function(app) {
            return (app != undefined);
        });
    }
}
