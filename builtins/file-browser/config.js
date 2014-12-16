var file_browser_app_windowed_mode = {
    appName : 'File Browser',
    appOpen : false,
    type : Application.WINDOWED_APPLICATION,
    layout : {
        windows : [
            {
                id : 'file-browser',
                title : 'File Browser',
                type : Application.NOT_TABBED_WINDOW,
                focused : 'true',
                top : '33%',
                left : '33%',
                width : '33%',
                height : '33%'
            }
        ]
    }
}

var file_browser_app_dialog_mode = {
    appName : 'File Dialog',
    appOpen : false,
    type : Application.DIALOG_APPLICATION,
    layout : {
        window : {
            id : 'file-browser-dialog',
            title : 'File Browser',
            type : Application.NOT_TABBED_WINDOW,
            focused : 'true',
            top : '33%',
            left : '33%',
            width : '33%',
            height : '33%'
        },

        template : 'file-browser-dialog'
    }
}
