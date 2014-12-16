if (Meteor.isClient) {
    Meteor.startup(function() {
        context.init({preventDoubleContext: false});
    });

    // Applications iterator
    Template.Applications.helpers({
        applications : function() {
            var apps = AppManager.getAppsData();
            return apps;
        }
    });

    Template.AppManagerApplication.helpers({
        isAppOpen : function() {
            return this.appOpen;
        },

        layout : function() {
            return { windows : this.layout.windows, tabs : this.layout.tabs }
        },

        isWindowOpen : function() {
            return !this.closed;
        }
    });

    // Window rendered
    Template.AppManagerAppWindow.rendered = function() {
        var data = this.data;
        $(this.findAll('.window')).each(function(index, element) {
            element = $(element);
            var window_manager = AppManager.getWindowManager(element.data('appid'));
            window_manager.registerWindow(element, data);
        });
    }

    Template.AppManagerAppWindow.helpers({
        isFocused : function() {
            return this.focused;
        },

        isMinimized : function() {
            return this.minimized;
        },

        isMaximized : function() {
            return this.maximized;
        },

        hasMenubar : function() {
            return (this.menubar != undefined);
        },

        hasMaximizeButton : function() {
            return this.maximize_button;
        },

        hasMinimizeButton : function() {
            return this.minimize_button;
        },
        
        hasRestoreButton : function() {
            return this.restore_button;
        },

        isResizable : function() {
            return this.resizable;
        },

        paneTree : function() {
            return _.extend(this.pane_tree, { appID : this.appID });
        },

        isTabbed : function() {
            return (this.type == Application.TABBED_WINDOW);
        },

        noTabsTemplate : function() {
            return { noTabsContent : Template[this.template] };
        }
    });

    // -------------------- //
    //     Panes code       //
    // -------------------- //
    Template.panes.helpers({
        paneChildTop : function() {
            return _.extend(this.panes.pane1, { appID : this.appID });
        },

        paneChildBottom : function() {
            return _.extend(this.panes.pane2, { appID : this.appID });
        },

        paneChildLeft : function() {
            return _.extend(this.panes.pane1, { appID : this.appID });
        },

        paneChildRight : function() {
            return _.extend(this.panes.pane2, { appID : this.appID });
        },

        isLeaf : function() {
            return (this.panes == undefined);
        },

        splitIsVertical : function() {
            return (this.panes.split_orientation == 'vertical');
        },

        splitPercentages : function() {
            var div_width = 8;
            var split_percent = 'calc(' + this.panes.split_percent + ' - ' + (div_width/2) + 'px)';
            var inv_split_percent = 'calc(' + (100 - parseInt(
                            this.panes.split_percent.substring(
                                0,this.panes.split_percent.length - 1))) + '% - ' + (div_width/2) + 'px)';
            var pane_start = 'calc(' + this.panes.split_percent + ' + ' + (div_width/2) + 'px)';
            var div_pos = 'calc(' + this.panes.split_percent + ' - ' + (div_width/2 - 2) + 'px)';
            return _.extend(this, { 
                pane1_percent : split_percent,
                pane2_percent : inv_split_percent,
                pane2_start : pane_start,
                divider_position : div_pos
            });
        }
    });

    Template.pane_divider_vertical.rendered = function() {
        paneDividerRegistrar($(this.findAll('.pane-divider')));
    }

    Template.pane_divider_horizontal.rendered = function() {
        paneDividerRegistrar($(this.findAll('.pane-divider')));
    }

    var paneDividerRegistrar = function(element) {
        var win = $(element.closest('.window'));
        var window_manager = AppManager.getWindowManager(win.data('appid'));
        var wm_window = window_manager.getWMWindow(win.attr('id'));
        if (wm_window != undefined) wm_window.registerDivider(element);
    }

    Template.pane_content.rendered = function() {
        var element = $(this.findAll('.panel-body'));
        var par_window = element.closest('.window');
        var par_window_id = $(par_window).attr('id');
        if (par_window_id != undefined) {
            var window_manager = AppManager.getWindowManager(par_window.data('appid'));
            var wm_window = window_manager.getWMWindow(par_window_id);
            if (wm_window != undefined) wm_window.registerPaneContextMenu(element);
        }
        element.each(function(index, element) {
            registerDroppable($(element));
        });
    }

    Template.pane_content.helpers({
        tabs : function() {
            var appID = this.appID;
            var window_manager = AppManager.getWindowManager(appID);
            var tabs = _.map(window_manager.getTabs(this.id), function(tab) {
                tab.appID = appID;
                return tab;
            });
            return { windowTabs : tabs };
        }
    });

    // -------------------- //
    //       Tab code       //
    // -------------------- //
    Template.tab_head.rendered = function() {
        var element = $(this.findAll('.tab-head'))
        var win = $(element.closest('.window'));
        var window_manager = AppManager.getWindowManager(win.data('appid'));
        var wm_window = window_manager.getWMWindow(win.attr('id'));
        if (wm_window != undefined) wm_window.registerTabContextMenu(element);
        
        $(this.findAll('.draggableTab')).each(function(index, element) {
            registerDraggable(element);
        });
        
        $($(this.findAll('.tab-head')).find('a')).each(function(index, element) {
            element = $(element);
            element.click(function() {
                window_manager.setTabActive($(this).parent().attr('id').split('head_')[1]);
            });
        });
    }

    Template.tab_head.helpers({
        isActive : function() {
            return this.active;
        }
    });

    Template.tab_body.helpers({
        tabContentContext : function() {
            var window_manager = AppManager.getWindowManager(this.appID);
            return { tabTemplate : window_manager.getTabContent(this.id) }
        },

        isActive : function() {
            return this.active;
        }
    });
    
    // -------------------- //
    //     Menubar code     //
    // -------------------- //
    Template.menubarMenu.helpers({
        menuContext : function(window_id) {
            var window_manager = AppManager.getWindowManager(this.appID);
            return { menu : window_manager.getMenu(window_id) };
        }
    });

    Template.menubarMenuItem.helpers({
        isDivider : function() {
            return (this.text == undefined);
        },

        hasSubmenu : function() {
            return (this.subMenu != undefined);
        }
    });

    Template.menubarMenuItem.events({
        'click .menubarAction' : function(event) {
            var element = $(event.target);
            var window_manager = AppManager.getWindowManager(element.closest('.window').data('appid'));
            window_manager.menubarActions[parseInt(element.data('action'))](element);
        }
    });

    // -------------------- //
    //       UI code        //
    // -------------------- //
    var hoverPane = undefined;
    var hoverWindow = undefined;
    var pane_outline_1 = undefined;
    var pane_outline_2 = undefined;
    var widthThirds = undefined, heightHalves = undefined, leftPosThirds = undefined, topPosHalves = undefined;
    var hoverBox = { thickness: 2 };
    var dropInPane = undefined;
    var PANE_MASK = {
        FULL: 0,
        LEFT: 1,
        RIGHT: 2,
        BOTTOM: 3
    }

    var registerDroppable = function(element) {
        element = $(element);
        var appID = element.closest('.window').data('appid');
        element.droppable(
            {
                tolerance: 'intersect',
                greedy: true,
                over: function(event, ui) {
                    var draggable = $($(ui.draggable)[0]);
                    var draggableAppID = draggable.closest('.window').data('appid');
                    if (draggableAppID != appID) { // We are hovering over a window not in our application
                        return;
                    }

                    ui.helper.css({pointerEvents: 'none'});
                    var onto = $(document.elementFromPoint(event.clientX, event.clientY));
                    ui.helper.css({pointerEvents: ''});
                    if (onto.closest('.window').has($(this)).length === 0)
                        return;

                    if ($(this) != hoverPane && hoverPane != undefined)
                        hoverPane.closest('.window').find('.dest-pane-outline-1,.dest-pane-outline-2').hide();
                    
                    hoverPane = $(this);
                    hoverWindow = hoverPane.closest('.window');
                    
                    pane_outline_1 = hoverWindow.find('.dest-pane-outline-1');
                    pane_outline_2 = hoverWindow.find('.dest-pane-outline-2');
                    
                    var relPaneOffset = hoverPane.offset();
                    relPaneOffset.top -= hoverWindow.offset().top;
                    relPaneOffset.left -= hoverWindow.offset().left;
                    widthThirds = {
                        full: hoverPane.width() - hoverBox.thickness,
                        one: (hoverPane.width() - 2 * hoverBox.thickness) / 3,
                        two: 2 * (hoverPane.width() - 2 * hoverBox.thickness) / 3
                    }
                    heightHalves = {
                        full: hoverPane.height() - hoverBox.thickness,
                        one: (hoverPane.height() - 2 * hoverBox.thickness) / 2,
                    }
                    leftPosThirds = {
                        zero: relPaneOffset.left,
                        one: relPaneOffset.left + widthThirds.one + hoverBox.thickness,
                        two: relPaneOffset.left + widthThirds.two + hoverBox.thickness
                    }
                    topPosHalves = {
                        zero: relPaneOffset.top,
                        one: relPaneOffset.top + heightHalves.one + hoverBox.thickness,
                        two: relPaneOffset.top + heightHalves.two + hoverBox.thickness
                    }
                },
                out: function(event, ui) {
                    ui.helper.css({pointerEvents: 'none'});
                    var onto = $(document.elementFromPoint(event.clientX, event.clientY));
                    ui.helper.css({pointerEvents: ''});
                    if (onto.closest('.window').has($(this)).length === 0)
                        return;

                    if (pane_outline_1 != undefined) {
                        pane_outline_1.hide();
                        pane_outline_1.css({top:0,left:0,width:0,height:0});
                    }
                    if (pane_outline_2 != undefined) {
                        pane_outline_2.hide();
                        pane_outline_2.css({top:0,left:0,width:0,height:0});
                    }
                    hoverPane = undefined;
                    hoverWindow = undefined;
                    pane_outline_1 = undefined;
                    pane_outline_2 = undefined;
                    var widthThirds = undefined, heightHalves = undefined, leftPosThirds = undefined, topPosHalves = undefined;
                },
                drop: function(event, ui) {
                    var draggable = $($(ui.draggable)[0]);
                    var draggableAppID = draggable.closest('.window').data('appid');
                    if (draggableAppID != appID) { // We are hovering over a window not in our application
                        return;
                    }

                    ui.helper.css({pointerEvents: 'none'});
                    var onto = $(document.elementFromPoint(event.clientX, event.clientY));
                    ui.helper.css({pointerEvents: ''});
                    if (onto.closest('.window').has($(this)).length === 0)
                        return;

                    if (pane_outline_1 != undefined) {
                        pane_outline_1.hide();
                        pane_outline_1.css({top:0,left:0,width:0,height:0});
                    }
                    if (pane_outline_2 != undefined) {
                        pane_outline_2.hide();
                        pane_outline_2.css({top:0,left:0,width:0,height:0});
                    }

                    var tab_id = draggable.attr('id').split('head_')[1];
                    var new_pane = $(this).closest('.pane-container');
                    var new_pane_id = new_pane.attr('id');
                    var old_pane = $(draggable.closest('.pane-container'));
                    var old_pane_id = old_pane.attr('id');
                    
                    var didSplitPane = false;
                            
                    var win = new_pane.closest('.window');
                    var window_manager = AppManager.getWindowManager(win.data('appid'));
                    var wm_window = window_manager.getWMWindow(win.attr('id'));
                    
                    switch (dropInPane) {
                        case PANE_MASK.FULL:
                            break;
                        case PANE_MASK.LEFT:
                            wm_window.splitPaneVertically(new_pane, '33%', true);
                            new_pane_id += '.1';
                            didSplitPane = true;
                            break;
                        case PANE_MASK.RIGHT:
                            wm_window.splitPaneVertically(new_pane, '67%');
                            new_pane_id += '.2';
                            didSplitPane = true;
                            break;
                        case PANE_MASK.BOTTOM:
                            wm_window.splitPaneHorizontally(new_pane, '50%');
                            new_pane_id += '.2';
                            didSplitPane = true;
                            break;
                    }
                    
                    if (new_pane_id == old_pane_id)
                        return;

                    window_manager.moveTab(tab_id, new_pane_id);
                }
            });
    }

    var registerDraggable = function(element) {
        element = $(element);
        element.draggable({
            opacity: 0.9, 
            helper: 'clone',
            appendTo: 'body',
            containment: 'DOM',
            zIndex: 1500,
            start: function(e, ui){
                $(ui.helper).addClass("draggingTab");
            },
            drag: function(e, ui) {
                if (hoverPane != undefined) {
                    if (ui.position.left < hoverPane.offset().left + hoverPane.width() / 4) {
                        pane_outline_1.css('top', topPosHalves.zero);
                        pane_outline_1.css('left', leftPosThirds.zero);
                        pane_outline_1.css('width', widthThirds.one);
                        pane_outline_1.css('height', heightHalves.full);
                        pane_outline_1.show();
                        pane_outline_2.css('top', topPosHalves.zero);
                        pane_outline_2.css('left', leftPosThirds.one);
                        pane_outline_2.css('width', widthThirds.two);
                        pane_outline_2.css('height', heightHalves.full);
                        pane_outline_2.show();
                        dropInPane = PANE_MASK.LEFT;
                    } else if (ui.position.left < hoverPane.offset().left + 3 * hoverPane.width() / 4) {
                        if (ui.position.top < hoverPane.offset().top + 3 * hoverPane.height() / 4) {
                            pane_outline_1.css('top', topPosHalves.zero);
                            pane_outline_1.css('left', leftPosThirds.zero);
                            pane_outline_1.css('width', widthThirds.full);
                            pane_outline_1.css('height', heightHalves.full);
                            pane_outline_1.show();
                            pane_outline_2.hide();
                            dropInPane = PANE_MASK.FULL;
                        } else {
                            pane_outline_1.css('top', topPosHalves.zero);
                            pane_outline_1.css('left', leftPosThirds.zero);
                            pane_outline_1.css('width', widthThirds.full);
                            pane_outline_1.css('height', heightHalves.one);
                            pane_outline_1.show();
                            pane_outline_2.css('top', topPosHalves.one);
                            pane_outline_2.css('left', leftPosThirds.zero);
                            pane_outline_2.css('width', widthThirds.full);
                            pane_outline_2.css('height', heightHalves.one);
                            pane_outline_2.show();
                            dropInPane = PANE_MASK.BOTTOM;
                        }
                    } else {
                        pane_outline_1.css('top', topPosHalves.zero);
                        pane_outline_1.css('left', leftPosThirds.zero);
                        pane_outline_1.css('width', widthThirds.two);
                        pane_outline_1.css('height', heightHalves.full);
                        pane_outline_1.show();
                        pane_outline_2.css('top', topPosHalves.zero);
                        pane_outline_2.css('left', leftPosThirds.two);
                        pane_outline_2.css('width', widthThirds.one);
                        pane_outline_2.css('height', heightHalves.full);
                        pane_outline_2.show();
                        dropInPane = PANE_MASK.RIGHT;
                    }
                }
            },
            stop: function(e, ui) {
                if (pane_outline_1 != undefined) {
                    pane_outline_1.hide();
                    pane_outline_1.css({top:0,left:0,width:0,height:0});
                }
                if (pane_outline_2 != undefined) {
                    pane_outline_2.hide();
                    pane_outline_2.css({top:0,left:0,width:0,height:0});
                }
                hoverPane = undefined;
                hoverWindow = undefined;
                pane_outline_1 = undefined;
                pane_outline_2 = undefined;
                var widthThirds = undefined, heightHalves = undefined, leftPosThirds = undefined, topPosHalves = undefined;
                
            }
        });
    }        

}
