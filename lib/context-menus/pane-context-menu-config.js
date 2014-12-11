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
            var wm_window = WindowManager.getWMWindowById(selector.closest('.window').attr('id'));
            var pane_id = selector.closest('.pane-container').attr('id');
            WindowManager.splitPaneVertically(wm_window, pane_id, '50%');
        }
    },
    {

        icon: 'glyphicon-resize-vertical',
        text: 'Split Horizontally',
        action: function(event, selector) {
            var wm_window = WindowManager.getWMWindowById(selector.closest('.window').attr('id'));
            var pane_id = selector.closest('.pane-container').attr('id');
            WindowManager.splitPaneHorizontally(wm_window, pane_id, '50%');
        }
    },
    {
        icon: 'glyphicon-trash',
        text: 'Close',
        action: function(event, selector) {
            var wm_window = WindowManager.getWMWindowById(selector.closest('.window').attr('id'));
            var pane_id = selector.closest('.pane-container').attr('id');
            WindowManager.closePane(wm_window, pane_id);
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
