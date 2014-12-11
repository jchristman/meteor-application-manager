WindowManager = function(app, settings) {
    this.application = app;
    this.configure(settings.appID, _.omit(settings, 'appID'));
}

// ---------------------------------------------------------------//
// Begin Initialization Code
// ---------------------------------------------------------------//
WindowManager.prototype.configure = function(appID, settings) {
    var self = this;
    if (!settings.hasOwnProperty('layout'))     settings.layout = {};
    if (!settings.hasOwnProperty('appOpen'))    settings.appOpen = false;
    if (!settings.hasOwnProperty('zLayer'))     settings.zLayer = 0;
    
    _.each(settings.layout.windows, function(win) {
        if (!win.hasOwnProperty('title'))       win.title = '';
        if (!win.hasOwnProperty('focused'))     win.focused = false;
        if (!win.hasOwnProperty('minimized'))   win.minimized = false;
        if (!win.hasOwnProperty('maximized'))   win.maximized = false;
        if (!win.hasOwnProperty('pane_tree'))   win.pane_tree = { id : win.id + '_pane' };
        if (!win.hasOwnProperty('closed'))      win.closed = false;
        if (!win.hasOwnProperty('zIndex'))      win.zIndex = 0;
        if (win.hasOwnProperty('menubar')) {
            _.each(win.menubar, function(menu) {
                self.processMenu(menu.menuItems);
            });
        }
    });

    _.each(settings.layout.tabs, function(tab) {
        if (!tab.hasOwnProperty('closed'))      tab.closed = false;
        if (!tab.hasOwnProperty('active'))      tab.active = true;
    });

    if (Meteor.isServer) {
        // Find the default profile
        var default_window_profile = AppCollection.findOne({'default' : 'profile'});
        if (default_window_profile == undefined) {
            AppCollection.insert({'default' : 'profile'});   
            default_window_profile = AppCollection.findOne({'default' : 'profile'});
        } 
        // And make sure it has a record for this appID
        if (default_window_profile[appID] == undefined) {
            var update = {}
            update[appID] = settings;
            
            AppCollection.update({'default' : 'profile'}, {
                $set : update
            });
        } else {
            throw new Error('WARNING! POSSIBLE DUPLICATE appID!');
        }
    }
}

WindowManager.prototype.init = function(settings) {
    this.minimize = this.defaultMinimizeFunction;
    this.layerDepth = 15;

    if (settings != undefined) {
        if (settings.hasOwnProperty('minimizeFunction'))
            if (typeof settings.minimizeFunction == 'function')
                this.minimize = settings.minimizeFunction;
        if (settings.hasOwnProperty('layerDepth'))
            this.layerDepth = settings.layerDepth;
    }
}

WindowManager.prototype.processMenu = function(menu) {
    var self = this;
    _.each(menu, function(menuItem) {
        if (menuItem.hasOwnProperty('subMenu')) {
            self.processMenu(menuItem.subMenu);
        } else {
            if (menuItem.hasOwnProperty('action')) {
                self.menubarActions.push(menuItem.action);
                menuItem.actionIndex = self.menubarActions.length - 1;
            }
        }
    });
}
// ---------------------------------------------------------------//
// End Initialization Code
// ---------------------------------------------------------------//

// ---------------------------------------------------------------//
// Begin Window Managing Code
// ---------------------------------------------------------------//
WindowManager.prototype.getApp = function() {
    return this.application.getApp();
}

WindowManager.prototype.getWindows = function() {
    var app = this.getApp();
    if (app.appOpen) {
        var openWindows = [];
        _.each(app.layout.windows, function(win) {
            openWindows = openWindows.concat(
                val.windows.filter(function(window) {
                    return (window.closed == false);
                })
            );
        });
        return openWindows;
    } else {
        return undefined;
    }
}

WindowManager.prototype.getTabs = function(pane_id, invert) {
    var uwp = this.getUserWindowProfile();
    var tabs;
    if (pane_id == undefined)
        tabs = uwp.tabs;
    else
        tabs = uwp.tabs.filter(function(tab) {
            if (invert)
                return (tab.pane_id != pane_id && tab.closed == false);
            else
                return (tab.pane_id == pane_id && tab.closed == false);
        });
    
    if (typeof tabs == 'object')
        tabs =  _.map(tabs, function(tab, key) {
            return tab;
        });

    return tabs;
}

WindowManager.prototype.getWindowById = function(uwp, window_id) {
    return _.find(uwp.windows, function(win) {
        if (win.id == window_id)
            return win;
    });
}

WindowManager.prototype.getWindowByIdWithIndex = function(uwp, window_id) {
    ret = {}
    ret.window = _.find(uwp.windows, function(window, index) {
        if (window.id == window_id) {
            ret.index = index;
            return window;
        }
    });
    return ret;
}

WindowManager.prototype.updateWindow = function(new_window, old_window_id) {
    var uwp = this.getUserWindowProfile();
    if (old_window_id == undefined)
        var windowWithIndex = this.getWindowByIdWithIndex(uwp, new_window.id);
    else
        var windowWithIndex = this.getWindowByIdWithIndex(uwp, old_window_id);
    var update = {}
    var key = "windows." + windowWithIndex.index;
    update[key] = new_window;
    
    WMCollection.update(uwp._id, {
        $set : update
    });
}

WindowManager.prototype.getTabById = function(uwp, tab_id) {
    return _.find(uwp.tabs, function(tab) {
        if (tab.id == tab_id)
            return tab;
    });
}

WindowManager.prototype.getTabByIdWithIndex = function(uwp, tab_id) {
    ret = {};
    ret.tab = _.find(uwp.tabs, function (tab, index) {
        if (tab.id == tab_id) {
            ret.index = index; // set the index of the ret object
            return tab;
        }
    });
    return ret;
}

WindowManager.prototype.getTabContent = function(tab_id) {
    var uwp = this.getUserWindowProfile();
    var tab = this.getTabById(uwp, tab_id);
    return Template[tab.template];
}

WindowManager.prototype.updateTab = function(new_tab) {
    var uwp = this.getUserWindowProfile();
    var tabWithIndex = this.getTabByIdWithIndex(uwp, new_tab.id);
    var update = {}
    var key = "tabs." + tabWithIndex.index;
    update[key] = new_tab;

    WMCollection.update(uwp._id, {
        $set : update
    });
}

WindowManager.prototype.setTabActive = function(tab_id) {
    var uwp = this.getUserWindowProfile();
    var new_active_tab = this.getTabById(uwp, tab_id);
    var self = this;
    _.each(this.getTabs(new_active_tab.pane_id), function(tab, index, tabs) {
        if (tab.id != new_active_tab.id && tab.active) {
            tab.active = false;
            self.updateTab(tab);
        }
    });
    
    new_active_tab.active = true;
    this.updateTab(new_active_tab);
}

WindowManager.prototype.registerWindow = function(element, data) {
    var new_window = new WMWindow(element, this, data);
    this.windows.push(new_window);
}

WindowManager.prototype.grabFocus = function(wm_window) {
    var self = this;
    var uwp = this.getUserWindowProfile();
    
    var greatest_z = 0;
    _.each(this.windows, function(_win) {
        var win = self.getWindowById(uwp, _win.id());
        if (greatest_z < win.zIndex) greatest_z = win.zIndex;
        if (win.focused) {
            win.focused = false;
            self.updateWindow(win);
        }
    });

    if (greatest_z + uwp.zLayer * this.layerDepth + 1 >= (uwp.zLayer + 1) * this.layerDepth) {
        _.each(this.windows, function(_win) {
            var win = self.getWindowById(uwp, _win.id());
            win.zIndex = 0;
            self.updateWindow(win);
        });
    
        var toUpdate = this.getWindowById(uwp, wm_window.id());
        toUpdate.focused = true;
        toUpdate.zIndex = 1;
        this.updateWindow(toUpdate);
    } else {
        var toUpdate = this.getWindowById(uwp, wm_window.id());
        toUpdate.focused = true;
        toUpdate.zIndex = greatest_z + 1;
        this.updateWindow(toUpdate);
    }
    
}

WindowManager.prototype.setWindowPos = function(wm_window, pos, minimized, maximized) {
    var uwp = this.getUserWindowProfile();
    var win = this.getWindowById(uwp, wm_window.id());
    win.top = pos.top;
    if (typeof win.top == 'number') win.top += 'px';
    win.left = pos.left;
    if (typeof win.left == 'number') win.left += 'px';
    win.width = pos.width;
    if (typeof win.width == 'number') win.width += 'px';
    win.height = pos.height;
    if (typeof win.height == 'number') win.height += 'px';
    if (minimized != undefined) win.minimized = minimized;
    if (maximized != undefined) win.maximized = maximized;

    this.updateWindow(win);
}

WindowManager.prototype.setPanePos = function(wm_window, parent_con_id, new_percentage) {
    var uwp = this.getUserWindowProfile();
    var win = this.getWindowById(uwp, wm_window.id());
    
    this.setPanePosHelper(win.pane_tree, parent_con_id, new_percentage);
    this.updateWindow(win);
}

WindowManager.prototype.setPanePosHelper = function(pane_tree, id, new_percentage) {
    if (pane_tree.id == id) {
        pane_tree.panes.split_percent = new_percentage;
        return true;
    }
    
    if (pane_tree.panes == undefined) return false;
    if (this.setPanePosHelper(pane_tree.panes.pane1, id, new_percentage)) return true;
    if (this.setPanePosHelper(pane_tree.panes.pane2, id, new_percentage)) return true;
    
    return false;
}

WindowManager.prototype.splitPaneVertically = function(wm_window, pane_id, percentage, moveTabsToSplit) {
    var uwp = this.getUserWindowProfile();
    var win = this.getWindowById(uwp, wm_window.id());
    
    this.splitPaneHelper(win.pane_tree, pane_id, percentage, 'vertical', moveTabsToSplit);
    this.updateWindow(win);
}

WindowManager.prototype.splitPaneHorizontally = function(wm_window, pane_id, percentage, moveTabsToSplit) {
    var uwp = this.getUserWindowProfile();
    var win = this.getWindowById(uwp, wm_window.id());
    
    this.splitPaneHelper(win.pane_tree, pane_id, percentage, 'horizontal', moveTabsToSplit);
    this.updateWindow(win);
}

WindowManager.prototype.splitPaneHelper = function(pane_tree, pane_id, percentage, orientation, moveTabsToSplit) {
    if (pane_tree.id == pane_id) {
        pane_tree.panes = {
            split_orientation : orientation,
            split_percent : percentage,
            pane1 : {
                id : pane_tree.id + '.1'
            },
            pane2 : {
                id : pane_tree.id + '.2'
            }
        }
        
        var self = this;
        _.each(this.getTabs(pane_id), function(tab, index, tabs) {
            if (moveTabsToSplit == true)
                tab.pane_id = pane_tree.id + '.2';
            else
                tab.pane_id = pane_tree.id + '.1';
            self.updateTab(tab);
        });

        return true;
    }

    if (pane_tree.panes == undefined) return false;
    if (this.splitPaneHelper(pane_tree.panes.pane1, pane_id, percentage, orientation, moveTabsToSplit)) return true;
    if (this.splitPaneHelper(pane_tree.panes.pane2, pane_id, percentage, orientation, moveTabsToSplit)) return true;
    
    return false;
}

WindowManager.prototype.closePane = function(wm_window, pane_id) {
    var uwp = this.getUserWindowProfile();
    var win = this.getWindowById(uwp, wm_window.id());
    var old_id = wm_window.id();

    this.closeTabsInPane(pane_id);
    this.closePaneHelper(win.pane_tree, pane_id, undefined, wm_window);
    
    if (!wm_window.isClosed())
        this.updateWindow(win, old_id);
}

WindowManager.prototype.closePaneHelper = function(pane_tree, pane_id, parent_tree, wm_window) {
    if (pane_tree.id == pane_id) {
        if (parent_tree == undefined) {
            this.closeWindow(wm_window);
            return true;   
        } else {
            if (parent_tree.panes.pane1.id == pane_id) {
                parent_tree.id = parent_tree.panes.pane2.id;
                if (parent_tree.panes.pane2.panes == undefined)
                    delete parent_tree.panes;
                else
                    parent_tree.panes = parent_tree.panes.pane2.panes;
            } else {
                parent_tree.id = parent_tree.panes.pane1.id;
                if (parent_tree.panes.pane1.panes == undefined)
                    delete parent_tree.panes;
                else
                    parent_tree.panes = parent_tree.panes.pane1.panes;
            }
            return true;
        }
    }
    
    if (pane_tree.panes == undefined) return false;
    if (this.closePaneHelper(pane_tree.panes.pane1, pane_id, pane_tree, wm_window)) return true;
    if (this.closePaneHelper(pane_tree.panes.pane2, pane_id, pane_tree, wm_window)) return true;
    
    return false;
}

WindowManager.prototype.minimizeWindow = function(wm_window) {
    if (!wm_window.maximized) wm_window.saveWindowInfo();
    this.minimize(wm_window);    
}

WindowManager.prototype.defaultMinimizeFunction = function(wm_window) {
    var new_height = wm_window.titleBar.height() + 5 + 'px'

    var pos = {
        top : 'calc(100% - ' + new_height + ')',
        left : 'auto',
        width : '300px',
        height : new_height
    }

    this.setWindowPos(wm_window, pos, true, false);
}

WindowManager.prototype.maximizeWindow = function(wm_window) {
    if (!wm_window.minimized) wm_window.saveWindowInfo();

    var pos = {
        top : '0px',
        left : '0px',
        width : '100%',
        height : '100%'
    }

    this.setWindowPos(wm_window, pos, false, true);
}

WindowManager.prototype.restoreWindow = function(wm_window) {
    var info = wm_window.loadWindowInfo();
    this.setWindowPos(wm_window, info, false, false);
}

WindowManager.prototype.isClosed = function(wm_window) {
    var uwp = this.getUserWindowProfile();
    var win = this.getWindowById(uwp, wm_window.id());
    return win.closed;
}

WindowManager.prototype.closeWindow = function(wm_window) {
    var uwp = this.getUserWindowProfile();

    var openWindows = this.getWMWindows();
    var win_idx = openWindows.indexOf(wm_window);
    if (win_idx == 0) {
        var possible_windows = openWindows.slice(1);
    } else {
        var possible_windows = openWindows.slice(0, win_idx);
        if (win_idx < openWindows.length - 1)
            possible_windows = possible_windows.concat(openWindows.slice(win_idx));
    }
    var new_focused_window = _.max(possible_windows, function(_win) {
        return _win.element.zIndex();
    });
    if (new_focused_window instanceof WMWindow)
        this.grabFocus(new_focused_window);
    
    wm_window.closeAllTabs();

    var win = this.getWindowById(uwp, wm_window.id());
    win.closed = true;
    this.updateWindow(win);
}

WindowManager.prototype.renameTab = function(tab_id, name) {
    var uwp = this.getUserWindowProfile();
    var tab = this.getTabById(uwp, tab_id);
    tab.title = name;
    this.updateTab(tab);
}

WindowManager.prototype.moveTab = function(tab_id, from_pane_id, to_pane_id) {
    var self = this;
    var uwp = this.getUserWindowProfile();
    var tab = this.getTabById(uwp, tab_id);
    
    if (tab.active) { // If we were active, activate a tab in our old pane
        old_pane_tabs = this.getTabs(from_pane_id);
        if (old_pane_tabs.length > 0) {
            old_pane_tabs[0].active = true;
            this.updateTab(old_pane_tabs[0]);
        }
    }

    // Deactivate all tabs in the new pane
    _.each(this.getTabs(to_pane_id), function(newPaneTab) {
        if (newPaneTab.active) {
            newPaneTab.active = false;
            self.updateTab(newPaneTab);
        }
    });

    tab.pane_id = to_pane_id;
    tab.active = true;
    this.updateTab(tab);
}

WindowManager.prototype.getClosedTabs = function() {
    var uwp = this.getUserWindowProfile();
    return uwp.tabs.filter(function(tab) {
        return tab.closed;
    });
}

WindowManager.prototype.closeTabsInPane = function(pane_id) {
    var self = this;
    var uwp = this.getUserWindowProfile();
    _.each(uwp.tabs, function(tab) {
        if (tab.pane_id == pane_id && !tab.closed)
            self.closeTab(tab.id);
    }); 
}

WindowManager.prototype.closeTab = function(tab_id) {
    var uwp = this.getUserWindowProfile();

    var tab = this.getTabById(uwp, tab_id);

    if (tab.active) {
        var other_tabs = this.getTabs(tab.pane_id);
        var i = 0;
        if (other_tabs[i].id == tab.id)
            i++;
        if (other_tabs.length > i) {
            other_tabs[i].active = true;
            this.updateTab(other_tabs[i]);
        }
    }

    tab.closed = true;
    this.updateTab(tab);
}

WindowManager.prototype.openTab = function(tab_id, dst_pane_id) {
    var self = this;
    var uwp = this.getUserWindowProfile();

    var otherTabs = this.getTabs(dst_pane_id);
    _.each(otherTabs, function(other_tab) {
        if (other_tab.active) {
            other_tab.active = false;
            self.updateTab(other_tab);
        }
    });
    
    var tab = this.getTabById(uwp, tab_id);
    tab.closed = false;
    tab.active = true;
    tab.pane_id = dst_pane_id;
    this.updateTab(tab);
}

WindowManager.prototype.refreshWindow = function(window_id) {
    var win = this.getWMWindowById(window_id);
    if (win != undefined) {
        win.registerDividers();
        win.registerContextMenus();
    }
}

WindowManager.prototype.getWMWindows = function() {
    var self = this;
    var uwp = this.getUserWindowProfile();
    return this.windows.filter(function(wm_window) {
        var win = self.getWindowById(uwp, wm_window.id());
        return (win.closed == false);
    });
}

WindowManager.prototype.getWMWindowById = function(window_id) {
    return _.find(this.windows, function(wm_window, index) {
        if (wm_window.id() == window_id)
            return wm_window;
    });
}

WindowManager.prototype.getMenu = function(window_id) {
    var uwp = this.getUserWindowProfile();
    var win = this.getWindowById(uwp, window_id);
    return win.menubar;
}

WindowManager.prototype.calcZ = function(window_id) {
    var uwp = this.getUserWindowProfile();
    var win = this.getWindowById(uwp, window_id);
    return win.zIndex + uwp.zLayer * this.layerDepth;
}
