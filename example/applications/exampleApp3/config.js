var application = {
    appID : '987e6f09-47f8-4c02-8005-fe6068d1e602',
    appOpen : true,
    layout : {
        windows : [
            {
                id : "exampleApp3", 
                title : "Example Application 3 Window 1",
                focused : true,
                top : "66%", 
                left : "25%", 
                width : "50%", 
                height : "33%",
                zIndex : 3,
                menubar : MENU_BAR
            },
            {
                id : "exampleApp3.2", 
                title : "Example Application 3 Window 2",
                focused : false,
                top : "50%", 
                left : "50%", 
                width : "50%", 
                height : "50%",
                zIndex : 2,
                menubar : MENU_BAR
            }
        ],

        tabs : [
            {
                id : "exampleApp3-tab1",
                title : "Example App 3 Tab 1",
                pane_id : "exampleApp3_pane",
                active : true,
                template : "exampleApp3_template1"
            },
            {
                id : "exampleApp3-tab2",
                title : "Example App 3 Tab 2",
                pane_id : "exampleApp3.2_pane",
                active : true,
                template : "exampleApp3_template2"
            }
        ]
    }
};

AppManager.registerApp(application);
