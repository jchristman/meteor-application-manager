CONTEXT_MENU_FUNCS = {
    moveTab : function(selector) {
        var window_manager = AppManager.getWindowManager($(selector.closest('.window')).data('appid'));
        var menuObj = [];

        var dst_pane_id = selector.closest('.pane-container').attr('id');
        var otherPanes = window_manager.getTabs(dst_pane_id, true);
        if (otherPanes.length == 0) {
            menuObj.push({
                icon: 'glyphicon-exclamation-sign',
                text: 'No other tabs to move'
            });
        } else {
            _.each(otherPanes, function(sel_tab) {
                menuObj.push({
                    text: sel_tab.title,
                    action: function(e, selector) {
                        window_manager.moveTab(sel_tab.id, sel_tab.pane_id, dst_pane_id);
                    }
                });
            });
        }

        return menuObj;
    },

    openTab : function(selector) {
        var window_manager = AppManager.getWindowManager($(selector.closest('.window')).data('appid'));
        var menuObj = [];

        var dst_pane_id = selector.closest('.pane-container').attr('id');
        var otherPanes = window_manager.getClosedTabs();
        if (otherPanes.length == 0) {
            menuObj.push({
                icon: 'glyphicon-exclamation-sign',
                text: 'No tabs are closed'
            });
        } else {
            _.each(otherPanes, function(sel_tab) {
                menuObj.push({
                    text: sel_tab.title,
                    action: function(e, selector) {
                        window_manager.openTab(sel_tab.id, dst_pane_id);
                    }
                });
            });
        }

        return menuObj;
    },

    closeTab : function(selector) {
        var window_manager = AppManager.getWindowManager($(selector.closest('.window')).data('appid'));
        var menuObj = [];

        var dst_pane_id = selector.closest('.pane-container').attr('id');
        var otherPanes = window_manager.getTabs(dst_pane_id);
        if (otherPanes.length == 0) {
            menuObj.push({
                icon: 'glyphicon-exclamation-sign',
                text: 'No tabs open in this pane'
            });
        } else {
            _.each(otherPanes, function(sel_tab) {
                menuObj.push({
                    text: sel_tab.title,
                    action: function(e, selector) {
                        window_manager.closeTab(sel_tab.id);
                    }
                });
            });
        }

        return menuObj;
    }
}
