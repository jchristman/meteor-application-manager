var application = {
    appID : 'f6235091-95f3-4691-aa95-8105a8c40f01',
    appName : 'Example Application 1',
    appOpen : true,
    layout : {
        windows : [
            {
                id : "exampleApp1", 
                title : "Example Application 1",
                focused : true,
                top : "0%", 
                left : "0%", 
                width : "50%", 
                height : "75%",
                zIndex : 1,
                menubar : MENU_BAR
            }
        ],

        tabs : [
            {
                id : "exampleApp1-tab1",
                title : "Example App 1 Tab 1",
                pane_id : "exampleApp1_pane",
                active : true,
                template : "exampleApp1_template1"
            },
            {
                id : "exampleApp1-tab2",
                title : "Example App 1 Tab 2",
                pane_id : "exampleApp1_pane",
                active : false,
                template : "exampleApp1_template2"
            }
        ]
    }
};

AppManager.registerApp(application);
