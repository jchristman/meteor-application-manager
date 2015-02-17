var application = {
    appID : '987e6f09-47f8-4c02-8005-fe6068d1e602',
    appName : 'Example Application 3',
    appOpen : true,
    layout : {
        windows : [
            {
                id : "exampleApp3", 
                title : "Example Application 3 Window 1",
                type : Application.PAGED_WINDOW,
                focused : true,
                top : "66%", 
                left : "25%", 
                width : "50%", 
                height : "33%",
                zIndex : 3,
                pages : [
                    {
                        title : 'Page 1',
                        template : '_example_page1',
                        selected : true
                    },
                    {
                        title : 'Page 2',
                        template : '_example_page2',
                        selected : false
                    },
                    {
                        title : 'Page 3',
                        template : '_example_page3',
                        selected : false
                    },
                    {
                        title : 'Page 4',
                        template : '_example_page4',
                        selected : false
                    },
                    {
                        title : 'Page 5',
                        template : '_example_page5',
                        selected : false
                    },
                    {
                        title : 'Page 6',
                        template : '_example_page6',
                        selected : false
                    },
                    {
                        title : 'Page 7',
                        template : '_example_page7',
                        selected : false
                    },
                    {
                        title : 'Page 8',
                        template : '_example_page8',
                        selected : false
                    },
                ]
            },
            {
                id : "exampleApp3.2", 
                title : "Example Application 3 Window 2",
                type : Application.NOT_TABBED_WINDOW,
                focused : false,
                top : "50%", 
                left : "50%", 
                width : "50%", 
                height : "50%",
                zIndex : 2,
                template : "exampleApp3_template2"
            }
        ]
    }
};

AppManager.registerApp(application);
