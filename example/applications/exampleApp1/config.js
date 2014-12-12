var application = {
    appID : 'f6235091-95f3-4691-aa95-8105a8c40f01',
    appOpen : true,
    layout : {
        windows : [
            {
                id : "test1", 
                title : "Test 1 Title",
                focused : true,
                top : "0%", 
                left : "0%", 
                width : "50%", 
                height : "50%",
                zIndex : 3,
    //            menubar : MENU_BAR
            }
        ],

        tabs : [
            {
                id : "test-tab1",
                title : "Test 1 Tab 1",
                pane_id : "test1_pane",
                active : true,
                template : "test_template1"
            },
            {
                id : "test-tab2",
                title : "Test 1 Tab 2",
                pane_id : "test1_pane",
                active : false,
                template : "test_template2"
            }
        ]
    }
};

AppManager.registerApp(application);
