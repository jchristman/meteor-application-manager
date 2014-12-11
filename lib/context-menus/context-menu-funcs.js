CONTEXT_MENU_FUNCS = {
    moveTab : function(selector) {
        var menuObj = [];

        var dst_pane_id = selector.closest('.pane-container').attr('id');
        var otherPanes = WindowManager.getTabs(dst_pane_id, true);
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
                        WindowManager.moveTab(sel_tab.id, sel_tab.pane_id, dst_pane_id);
                    }
                });
            });
        }

        return menuObj;
    },

    openTab : function(selector) {
        var menuObj = [];

        var dst_pane_id = selector.closest('.pane-container').attr('id');
        var otherPanes = WindowManager.getClosedTabs();
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
                        WindowManager.openTab(sel_tab.id, dst_pane_id);
                    }
                });
            });
        }

        return menuObj;
    },

    closeTab : function(selector) {
        var menuObj = [];

        var dst_pane_id = selector.closest('.pane-container').attr('id');
        var otherPanes = WindowManager.getTabs(dst_pane_id);
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
                        WindowManager.closeTab(sel_tab.id);
                    }
                });
            });
        }

        return menuObj;
    }
}
