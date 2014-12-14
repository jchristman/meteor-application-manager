var application = {
    appID : '7fdfa045-5bd4-49c9-b829-8c3317ea4b06',
    appName : 'Example Application 2',
    appOpen : true,
    layout : {
        windows : [
            {
                id : "exampleApp2", 
                title : "Example Application 2",
                focused : true,
                top : "0%", 
                left : "50%", 
                width : "50%", 
                height : "50%",
                zIndex : 1,
                menubar : MENU_BAR
            }

        ],

        tabs : [
            {
                id : "exampleApp2-tab1",
                title : "Example App 2 Tab 1",
                pane_id : "exampleApp2_pane",
                active : true,
                template : "exampleApp2_template1"
            },
            {
                id : "exampleApp2-tab2",
                title : "Example App 2 Tab 2",
                pane_id : "exampleApp2_pane",
                active : false,
                template : "exampleApp2_template2"
            }
        ]
    }
};

AppManager.registerApp(application);
