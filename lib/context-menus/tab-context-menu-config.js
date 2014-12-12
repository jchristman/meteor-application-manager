TAB_CONTEXT_MENU = {
    id: 'TAB-CONTEXT-MENU',
    data: [
    {
        header : 'Tab Actions'
    },
    {
        icon: 'glyphicon-edit',
        text: 'Rename Tab',
        action: function(e, selector) {
            var window_manager = AppManager.getwindow_manager($(selector.closest('.window')).data('appid'));
            tab_text_element = $(selector.find('a')[0]);
            input = $('<input>').attr({
                type : 'text',
                id : 'newTabName',
                value : tab_text_element.text()
            });
            tab_text_element.html(input);
            input.focus();
            input.select();
            input.bind('keypress', function(event) {
                if (event.keyCode == 13) {
                    tab_text_element.text("");
                    window_manager.renameTab(selector.attr('id').split('head_')[1], input.val());
                }
            });
        }
    },
    {
        icon: 'glyphicon-trash',
        text: 'Close Tab',
        action: function(e, selector) {
            var window_manager = AppManager.getwindow_manager($(selector.closest('.window')).data('appid'));
            var tab_id = selector.attr('id').split('head_')[1];
            window_manager.closeTab(tab_id);
        }
    },
    {
        icon: 'glyphicon-trash',
        text: 'Close All',
        action: function(e, selector) {
            var window_manager = AppManager.getwindow_manager($(selector.closest('.window')).data('appid'));
            var pane_id = selector.closest('.pane-container').attr('id');
            window_manager.closeTabsInPane(pane_id);
        }
    },
    {
        icon: 'glyphicon-trash',
        text: 'Close All But This',
        action: function(e, selector) {
            var window_manager = AppManager.getwindow_manager($(selector.closest('.window')).data('appid'));
            var tab_id = selector.attr('id').split('head_')[1];
            var pane_id = selector.closest('.pane-container').attr('id');
            window_manager.closeTabsInPane(pane_id);
            window_manager.openTab(tab_id, pane_id);
        }
    },
]};

