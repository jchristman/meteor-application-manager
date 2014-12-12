MENU_BAR = [
    {
        text : 'File',
        menuItems : [
            {
                text : 'Exit',
                action : function(element) {
                    AppManager.quit(element.closest('.window').data('appid'));
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
    }
];
