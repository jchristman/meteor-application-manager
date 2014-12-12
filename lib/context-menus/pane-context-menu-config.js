PANE_CONTEXT_MENU = {
    id: 'PANE-CONTEXT-MENU',
    data : [
    {
        header: 'Pane Actions'
    },
    {
        icon: 'glyphicon-resize-horizontal',
        text: 'Split Vertically',
        action: function(event, selector) {
            var window_manager = AppManager.getWindowManager($(selector.closest('.window')).data('appid'));
            var win_id = selector.closest('.window').attr('id');
            var pane_id = selector.closest('.pane-container').attr('id');
            window_manager.splitPaneVertically(win_id, pane_id, '50%');
        }
    },
    {

        icon: 'glyphicon-resize-vertical',
        text: 'Split Horizontally',
        action: function(event, selector) {
            var window_manager = AppManager.getWindowManager($(selector.closest('.window')).data('appid'));
            var win_id = selector.closest('.window').attr('id');
            var pane_id = selector.closest('.pane-container').attr('id');
            window_manager.splitPaneHorizontally(win_id, pane_id, '50%');
        }
    },
    {
        icon: 'glyphicon-trash',
        text: 'Close',
        action: function(event, selector) {
            var window_manager = AppManager.getWindowManager($(selector.closest('.window')).data('appid'));
            var win_id = selector.closest('.window').attr('id');
            var pane_id = selector.closest('.pane-container').attr('id');
            window_manager.closePane(win_id, pane_id);
        }
    },
    { divider: true },
    {
        header: 'Tab Actions'
    },
    {
        icon: 'glyphicon-open',
        text: 'Open Tab:',
        subMenu : [
                {
                    header: 'Other Tabs'
                },
                {
                    menu_item_src : 'CONTEXT_MENU_FUNCS.openTab'
                }
            ]
    },
    {
        icon: 'glyphicon-move',
        text: 'Move Tab Here:',
        subMenu : [
                {
                    header: 'Other Tabs'
                },
                {
                    menu_item_src : 'CONTEXT_MENU_FUNCS.moveTab'
                }
            ]
    },
    {
        icon: 'glyphicon-trash',
        text: 'Close Tab:',
        subMenu : [
                {
                    header: 'Other Tabs'
                },
                {
                    menu_item_src : 'CONTEXT_MENU_FUNCS.closeTab'
                }
            ]
    }
]};
