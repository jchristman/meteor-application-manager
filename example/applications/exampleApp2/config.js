var application = {
    appID : 'c2dce4b4-5585-4a41-93d8-a22dc27fdc35',
    layout : {
        windows : [
            {
                id : "test2", 
                title : "Test 2 Title",
                focused : true,
                top : "30%", 
                left : "30%", 
                width : "50%", 
                height : "50%",
                zIndex : 3,
    //            menubar : MENU_BAR
            }
        ],

        tabs : [
            {
                id : "test2-tab",
                title : "Test 2 Tab 2",
                pane_id : "test2_pane",
                active : true,
                template : "test2_template1"
            },
            {
                id : "test2-tab2",
                title : "Test Tab 2",
                pane_id : "test2_pane",
                active : true,
                template : "test2_template2"
            }
        ]
    }
};

AppManager.registerApp(application);
