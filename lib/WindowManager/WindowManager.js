WindowManager = function(app, settings) {
    this.application = app;
    this.appID = settings.appID;
    this.windows = [];
    this.menubarActions = [];
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
        win.appID = appID;
        if (!win.hasOwnProperty('id'))          throw new Error('Need an id field for every window!');
        if (!win.hasOwnProperty('title'))       win.title = '';
        if (!win.hasOwnProperty('type'))        win.type = Application.TABBED_WINDOW;
        if (!win.hasOwnProperty('focused'))     win.focused = false;
        if (!win.hasOwnProperty('minimized'))   win.minimized = false;
        if (!win.hasOwnProperty('maximized'))   win.maximized = false;
        if (!win.hasOwnProperty('pane_tree'))   win.pane_tree = { id : win.id + '_pane' };
        if (!win.hasOwnProperty('closed'))      win.closed = false;
        if (!win.hasOwnProperty('resizable'))   win.resizable = true;
        if (!win.hasOwnProperty('minimize_button')) win.minimize_button = true;
        if (!win.hasOwnProperty('maximize_button')) win.maximize_button = true;
        if (!win.hasOwnProperty('restore_button')) win.restore_button = true;

        if (settings.type == Application.DIALOG_APPLICATION) {
            win.minimize_button = false;
            win.maximize_button = false;
            win.restore_button = false;
        }

        if (win.type == Application.PAGED_WINDOW) {
            if (!win.hasOwnProperty('pages')){
                throw new Error('Need the pages field for a PAGED_WINDOW');
            } else {
                _.each(win.pages, function(page) {
                    if (!page.hasOwnProperty('title'))       throw new Error('Need a title field for every page');
                    if (!page.hasOwnProperty('template'))    throw new Error('Need a template field for every page');
                });
            }
        }

        var lowest_z = settings.zLayer * self.application.layerDepth
        if (!win.hasOwnProperty('zIndex'))      win.zIndex = lowest_z;
        else {
            if (win.zIndex < settings.zLayer * self.application.layerDepth) win.zIndex += lowest_z;
            if (win.zIndex >= lowest_z + self.application.layerDepth)       win.zIndex = lowest_z + self.application.layerDepth - 1;
        }

        if (win.hasOwnProperty('menubar')) {
            _.each(win.menubar, function(menu) {
                self.processMenu(menu.menuItems);
            });
        }
    });

    if (!settings.hasOwnProperty('onStartup'))
        settings.onStartup = _.map(settings.layout.windows, function(win) {
            return win.id;
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
            throw new Error('WARNING! POSSIBLE DUPLICATE appID! ' + appID);
        }
    }
}

WindowManager.prototype.init = function(settings) {
    this.minimize = this.defaultMinimizeFunction;

    if (settings != undefined) {
        if (settings.hasOwnProperty('minimizeFunction'))
            if (typeof settings.minimizeFunction == 'function')
                this.minimize = settings.minimizeFunction;
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

WindowManager.prototype.registerWindow = function(element, data) {
    var new_window = new WMWindow(element, this, data);
    this.windows.push(new_window);
}
// ---------------------------------------------------------------//
// End Initialization Code
// ---------------------------------------------------------------//

// ---------------------------------------------------------------//
// Begin Window Management Code
// ---------------------------------------------------------------//
WindowManager.prototype.getApp = function() {
    return this.application.getAppData();
}

WindowManager.prototype.updateLayout = function(layout) {
    var self = this;
    var update = {}
    _.each(layout, function(val, key) {
        update[self.appID + '.' + key] = val;
    });
    this.application.updateAppData(update);
}

//--------- STARTUP ---------//
WindowManager.prototype.start = function() {
    var self = this;
    var app = this.getApp();
    this.closeWindows();

    var top_win = undefined;
    _.each(app.onStartup, function(win_id) {
        var win = self.getWindow(win_id).window;
        win.closed = false;
        if (top_win == undefined || top_win.zIndex < win.zIndex) top_win = win;
        self.updateWindow(win);
    });

    this.grabFocus(top_win.id);
}

//--------- CLOSE ---------//
WindowManager.prototype.quit = function() {
    this.closeWindows();
}

//--------- GETTERS ---------//
WindowManager.prototype.getWindows = function() {
    var app = this.getApp();
    return app.layout.windows.filter(function(win) {
        return (win.closed == false);
    });
}

WindowManager.prototype.getWindow = function(window_id) {
    var app = this.getApp();
    ret = {}
    ret.window = _.find(app.layout.windows, function(window, index) {
        if (window.id == window_id) {
            ret.index = index;
            return window;
        }
    });
    return ret;
}

WindowManager.prototype.getTabs = function(pane_id, invert, closed) {
    var app = this.getApp();
    var tabs;
    if (pane_id == undefined)
        tabs = app.layout.tabs.filter(function(tab) {
            if (closed)
                return (tab.closed == true);
            else
                return (tab.closed == false);
        });
    else
        tabs = app.layout.tabs.filter(function(tab) {
            if (invert)
                if (closed)
                    return (tab.pane_id != pane_id && tab.closed == true);
                else
                    return (tab.pane_id != pane_id && tab.closed == false);
            else
                if (closed)
                    return (tab.pane_id == pane_id && tab.closed == true);
                else
                    return (tab.pane_id == pane_id && tab.closed == false);
        });
    
    return tabs;
}

WindowManager.prototype.getClosedTabs = function() {
    return this.getTabs(undefined, undefined, true);
}

WindowManager.prototype.getTab = function(tab_id) {
    var app = this.getApp();
    ret = {};
    ret.tab = _.find(app.layout.tabs, function (tab, index) {
        if (tab.id == tab_id) {
            ret.index = index; // set the index of the ret object
            return tab;
        }
    });
    return ret;
}

WindowManager.prototype.getTabContent = function(tab_id) {
    var tab = this.getTab(tab_id).tab;
    return Template[tab.template];
}

WindowManager.prototype.getWMWindows = function() {
    var self = this;
    return this.windows.filter(function(wm_window) {
        var win = self.getWindow(wm_window.id());
        return (win.closed == false);
    });
}

WindowManager.prototype.getWMWindow = function(window_id) {
    return _.find(this.windows, function(wm_window, index) {
        if (wm_window.id() == window_id)
            return wm_window;
    });
}

WindowManager.prototype.getMenu = function(window_id) {
    var win = this.getWindow(window_id).window;
    return win.menubar;
}
//--------- END GETTERS ---------//

//--------- DB UPDATERS ---------//
WindowManager.prototype.updateWindow = function(new_window, old_window_id) {
    if (old_window_id == undefined)
        var win = this.getWindow(new_window.id);
    else
        var win = this.getWindow(old_window_id);
    var update = { }
    var key = "layout.windows." + win.index;
    update[key] = new_window;
    
    this.updateLayout(update);
}

WindowManager.prototype.updateTab = function(new_tab) {
    var tabWithIndex = this.getTab(new_tab.id);
    var update = { }
    var key = "layout.tabs." + tabWithIndex.index;
    update[key] = new_tab;

    this.updateLayout(update);
}
//--------- END DB UPDATERS ---------//

//--------- WINDOW FUNCTIONS ---------//
WindowManager.prototype.grabFocus = function(win_id) {
    this.application.grabFocus();
    if (win_id != undefined) {
        var app = this.getApp();
        var win = this.getWindow(win_id).window;
        if (win.focused == false) {
            this.correctZIndices();

            win.zIndex = app.zLayer * this.application.layerDepth + this.windows.length + 1;
            win.focused = true;
            this.updateWindow(win);
        }
    }
}

WindowManager.prototype.correctZIndices = function() {
    var self = this;

    var app = this.getApp();
    var layer = app.zLayer * this.application.layerDepth;

    var windows = _.map(this.windows, function(_win) {
        return self.getWindow(_win.id()).window;
    });

    var sorted = _.sortBy(windows, function(_win) {
        return _win.zIndex;
    });

    var counter = 0;
    _.each(sorted, function(_win) {
        _win.zIndex = counter + layer;
        _win.focused = false;
        self.updateWindow(_win);
        counter += 1;
    });
}

WindowManager.prototype.setWindowPos = function(win_id, pos, minimized, maximized) {
    var win = this.getWindow(win_id).window;
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


WindowManager.prototype.minimizeWindow = function(win_id) {
    var wm_window = this.getWMWindow(win_id);
    if (!wm_window.maximized) wm_window.saveWindowInfo();
    this.minimize(win_id);    
}

WindowManager.prototype.defaultMinimizeFunction = function(win_id) {
    var wm_window = this.getWMWindow(win_id);
    var new_height = wm_window.titleBar.height() + 5 + 'px'

    var pos = {
        top : 'calc(100% - ' + new_height + ')',
        left : 'auto',
        width : '300px',
        height : new_height
    }

    this.setWindowPos(win_id, pos, true, false);
}

WindowManager.prototype.maximizeWindow = function(win_id) {
    var wm_window = this.getWMWindow(win_id);
    if (!wm_window.minimized) wm_window.saveWindowInfo();

    var pos = {
        top : '0px',
        left : '0px',
        width : '100%',
        height : '100%'
    }

    this.setWindowPos(win_id, pos, false, true);
}

WindowManager.prototype.restoreWindow = function(win_id) {
    var wm_window = this.getWMWindow(win_id);
    var info = wm_window.loadWindowInfo();
    this.setWindowPos(win_id, info, false, false);
}

WindowManager.prototype.isClosed = function(win_id) {
    var win = this.getWindow(win_id).window;
    return win.closed;
}

// This should only be called from Application.quitApp()
WindowManager.prototype.closeWindows = function() {
    var self = this;
    var app = this.getApp();
    _.each(app.layout.windows, function(win) {
        win.closed = true;
        self.updateWindow(win);
    });
}

WindowManager.prototype.closeWindow = function(win_id) {
    var win = this.getWindow(win_id).window;
    win.closed = true;
    win.focused = false;
    this.updateWindow(win);

    var open_windows = this.getWindows();
    if (open_windows.length == 0) {
        this.application.quitApp(this);
        return;
    }

    var new_focused_window = _.max(this.getWindows(), function(_win) {
        return _win.zIndex;
    });
    
   this.grabFocus(new_focused_window.id);
}

WindowManager.prototype.setTitle = function(win_id, title) {
    var win = this.getWindow(win_id).window;
    win.title = title;
    this.updateWindow(win);
}
//--------- END WINDOW FUNCTIONS ---------//

//--------- TAB FUNCTIONS ---------//
WindowManager.prototype.setTabActive = function(tab_id) {
    var new_active_tab = this.getTab(tab_id).tab;
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

WindowManager.prototype.renameTab = function(tab_id, name) {
    var tab = this.getTab(tab_id).tab;
    tab.title = name;
    this.updateTab(tab);
}

WindowManager.prototype.moveTab = function(tab_id, to_pane_id) {
    var self = this;
    var tab = this.getTab(tab_id).tab;
    var from_pane_id = tab.pane_id;
    
    if (tab.active) { // If we were active, activate a tab in our old pane
        old_pane_tabs = this.getTabs(from_pane_id);
        if (old_pane_tabs.length > 1) {
            if (old_pane_tabs[0].id == tab.id) {
                old_pane_tabs[1].active = true;
                this.updateTab(old_pane_tabs[1]);
            } else {
                old_pane_tabs[0].active = true;
                this.updateTab(old_pane_tabs[0]);
            }
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

WindowManager.prototype.closeTab = function(tab_id) {
    var tab = this.getTab(tab_id).tab;

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

WindowManager.prototype.closeTabsInPane = function(pane_id) {
    var self = this;
    _.each(this.getTabs(pane_id), function(tab) {
        self.closeTab(tab.id);
    });
}

WindowManager.prototype.openTab = function(tab_id, dst_pane_id) {
    var self = this;

    var otherTabs = this.getTabs(dst_pane_id);
    _.each(otherTabs, function(other_tab) {
        if (other_tab.active) {
            other_tab.active = false;
            self.updateTab(other_tab);
        }
    });
    
    var tab = this.getTab(tab_id).tab;
    tab.closed = false;
    tab.active = true;
    tab.pane_id = dst_pane_id;
    this.updateTab(tab);
}
//--------- END TAB FUNCTIONS ---------//

//--------- PANE FUNCTIONS ---------//
WindowManager.prototype.setPanePos = function(win_id, parent_con_id, new_percentage) {
    var win = this.getWindow(win_id).window;
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

WindowManager.prototype.splitPaneVertically = function(win_id, pane_id, percentage, moveTabsToSplit) {
    var win = this.getWindow(win_id).window;
    this.splitPaneHelper(win.pane_tree, pane_id, percentage, 'vertical', moveTabsToSplit);
    this.updateWindow(win);
}

WindowManager.prototype.splitPaneHorizontally = function(win_id, pane_id, percentage, moveTabsToSplit) {
    var win = this.getWindow(win_id).window;
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

WindowManager.prototype.closePane = function(win_id, pane_id) {
    var win = this.getWindow(win_id).window;
    var old_id = win_id;
    this.closeTabsInPane(pane_id);
    this.closePaneHelper(win.pane_tree, pane_id, undefined, win_id);
    
    var wm_window = this.getWMWindow(win_id);
    if (!wm_window.isClosed())
        this.updateWindow(win, old_id);
}

WindowManager.prototype.closePaneHelper = function(pane_tree, pane_id, parent_tree, win_id) {
    if (pane_tree.id == pane_id) {
        if (parent_tree == undefined) {
            this.closeWindow(win_id);
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
    if (this.closePaneHelper(pane_tree.panes.pane1, pane_id, pane_tree, win_id)) return true;
    if (this.closePaneHelper(pane_tree.panes.pane2, pane_id, pane_tree, win_id)) return true;
    
    return false;
}
//--------- END PANE FUNCTIONS ---------//

// ---------------------------------------------------------------//
// End Window Management Code
// ---------------------------------------------------------------//
