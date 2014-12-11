MENU_BAR = [
    {
        text : 'File',
        menuItems : [
            {
                text : 'New...',
                subMenu : [
                        {
                            text : 'Project',
                            action : function(e) {
                                console.log('New project selected');
                            }
                        },
                        {
                            text : 'File',
                            action : function(e) {
                                console.log('New file selected');
                            }
                        }
                    ]
            },
            {
                text : 'Open...',
                action : function(e) {
                    console.log('Open... selected');
                }
            },
            {},
            {
                text : 'Exit',
                action : function(e) {
                    console.log('Exit selected');
                }
            }
        ]
    },
    {
        text : 'Edit',
        menuItems : [
            {
                text : 'Copy',
                disabled : true,
                action : function(e) {
                    console.log('Copy selected');
                }
            },
            {
                text : 'Paste',
                disabled : true,
                action : function(e) {
                    console.log('Paste selected');
                }
            }
        ]
    },
    {
        text : 'Help',
        menuItems : [
            {
                text : 'About',
                action : function(e) {
                    console.log('About selected');
                }
            },
            {
                text : 'Submit a bug report',
                action : function(e) {
                    console.log('Submit bug report selected');
                }
            }
        ]
    }
];
