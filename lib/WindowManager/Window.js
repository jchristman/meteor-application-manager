WMWindow = function(element, manager, data) {
    this.element = $(element);
    this.manager = manager;
    this.minimized = data.minimized;
    this.maximized = data.maximized;
    this.init();
}

WMWindow.prototype.init = function() {
    var self = this; // this is replaced in the mousedown function, so save a reference
    
    /* ------- CLICK ------- */
    this.element.click(function() {
        self.click();
    });

    /* ------- TITLE BAR ------- */
    this.titleBar = $('.windowtitlebar', this.element);
    this.titleBar.mousedown(function(event) {
            self.startMove(event);
        });
    this.titleBar.css({userSelect: 'none'});
    this.titleBar.children().css({userSelect: 'none'});

    this.titleBarText = $('.titlebartext', this.element);
    this.titleBarText.onselectstart = this.cancel;
    this.titleBarText.unselectable = "on";
    
    /* ------- BUTTONS ------- */
    this.buttons = this.titleBar.find('.horizbuts').mousedown(this.cancel).children();
    this.buttons.eq(0).click(function() { self.minimize(this); return false; });
    this.buttons.eq(1).click(function() { self.restore(this); return false; });
    this.buttons.eq(2).click(function() { self.maximize(this); return false; });
    this.buttons.eq(3).click(function() { self.close(this); return false; });

    /* ------- MOVER ------- */
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.moverBoxPosition = {
        top : 0,
        left : 0,
        width : 0,
        height : 0
    }
    this.moverProxy = $('<div id="moverproxy">').mousemove(function(event) {
            return self.updateMove(event);
        })
        .mouseup(function() {
            return self.endMove();
        });
    this.moverProxyContainer = $('<div>').appendTo(this.moverProxy);
    this.moverProxy.onselectstart = this.cancel;
    
    /* ------- RESIZER ------- */
    this.resizeMask = 0;
    this.resizeBoxPosition = {
        right : 0,
        bottom : 0,
        width : 0,
        height : 0
    }

    this.element.find('.resizer-tl,.resizer-t,.resizer-tr,.resizer-r,.resizer-br,' + 
        '.resizer-b,.resizer-bl,.resizer-l').mousedown(function() {
            return self.startResize(this);
        });

    this.resizerProxy = $('<div id="resizerproxy">').mousemove(function(event) {
            return self.updateResize(event);
        })
        .mouseup(function() {
            return self.endResize();
        });
    this.resizerProxyContainer = $('<div>').appendTo(this.resizerProxy);
    this.resizerProxy.onselectstart = this.cancel;

    /* -------- SAVE -------- */
    this.savedPosition = {
        top : 0,
        left : 0,
        width : 0,
        height : 0
    }

    /* -------- DIVIDER ------- */
    this.registerDividers();

    /* ------- CONTEXT MENUS ------- */
    this.registerContextMenus();
}

WMWindow.prototype.registerDividers = function() {
    var self = this;
    this.registerDivider();

    this.paneDividerProxy = $('<div id="paneDividerProxy">').mousemove(function(event) {
            return self.updateMovePaneDivider(event);
        })
        .mouseup(function() {
            return self.endMovePaneDivider();
        });
    this.paneDividerProxyContainer = $('<div>').appendTo(this.paneDividerProxy);
    this.paneDividerProxy.onselectstart = this.cancel;
}

WMWindow.prototype.registerDivider = function(element) {
    var self = this;
    if (element == undefined) {
        this.element.find('.pane-divider').mousedown(function() {
                return self.startMovePaneDivider(this);
            });
    } else {
        element.mousedown(function() {
            return self.startMovePaneDivider(this);
        });
    }
}

WMWindow.prototype.registerContextMenus = function() {
    this.registerTabContextMenu();
    this.registerPaneContextMenu();
}

WMWindow.prototype.registerTabContextMenu = function(element) {
    var self = this;
    if (element == undefined) {
        this.element.find('.tab-head').each(function(index, tab_head) {
            context.attach(tab_head, TAB_CONTEXT_MENU);
        });
    } else {
        context.attach(element, TAB_CONTEXT_MENU);
    }
}

WMWindow.prototype.registerPaneContextMenu = function(element) {
    var self = this;
    if (element == undefined) {
        this.element.find('.panel-body').each(function(index, panel_body) {
            context.attach(panel_body, PANE_CONTEXT_MENU);
        });
    } else {
        context.attach(element, PANE_CONTEXT_MENU);
    }
}

WMWindow.prototype.startMove = function(event) {
    if (event.button && event.button == 2) return true;
    // TODO: double click?
    
    this.manager.grabFocus(this);

    this.moverBoxPosition = this.getWindowInfo();
    this.moverBoxPosition.bottom = this.moverBoxPosition.right = 'auto';

    this.moverProxyContainer.css(this.moverBoxPosition);
    this.moverProxy.appendTo($(document.body));
    this.moverProxy.show();

    this.winOffsetY = event.pageY - this.moverBoxPosition.top;
    this.winOffsetX = event.pageX - this.moverBoxPosition.left;

    return false;
}

WMWindow.prototype.updateMove = function(event) {
    this.moverBoxPosition.top = event.pageY - this.winOffsetY;
    this.moverBoxPosition.left = event.pageX - this.winOffsetX;
    
    this.moverProxyContainer.css(this.moverBoxPosition);

    return false;
}

WMWindow.prototype.endMove = function() {
    this.manager.setWindowPos(this, this.translatePosition(this.moverBoxPosition));

    this.moverProxy.hide();
    this.moverProxy.detach();

    return false;
}

WMWindow.prototype.startResize = function(resizeHandle) {
    resizeHandle = $(resizeHandle);
    var match = resizeHandle.attr('class').match(/resizer\-(\w+)/);
    if (match.length != 2) return true;

    var type = match[1];
    this.resizeMask = 0;
    if (type[0] == 't') this.resizeMask |= R_MASK.TOP;
    else if (type[0] == 'b') this.resizeMask |= R_MASK.BOTTOM;
    if (type.match(/l/)) this.resizeMask |= R_MASK.LEFT;
    else if (type.match(/r/)) this.resizeMask |= R_MASK.RIGHT;

    this.manager.grabFocus(this);

    this.resizerBoxPosition = this.getWindowInfo();
    this.resizerBoxPosition.right = this.resizerBoxPosition.left + this.resizerBoxPosition.width;
    this.resizerBoxPosition.bottom = this.resizerBoxPosition.top + this.resizerBoxPosition.height;
    
    this.resizerProxyContainer.css(this.resizerBoxPosition);
    this.resizerProxy.appendTo($(document.body));
    this.resizerProxy.show();

    return false;
}

WMWindow.prototype.updateResize = function(event) {
    if (this.resizeMask & R_MASK.TOP)           this.resizerBoxPosition.top = event.pageY;
    else if (this.resizeMask & R_MASK.BOTTOM)   this.resizerBoxPosition.bottom = event.pageY;
    if (this.resizeMask & R_MASK.LEFT)          this.resizerBoxPosition.left = event.pageX;
    else if (this.resizeMask & R_MASK.RIGHT)    this.resizerBoxPosition.right = event.pageX;

    this.resizerBoxPosition.height = Math.abs(this.resizerBoxPosition.top - this.resizerBoxPosition.bottom) + 2;
    this.resizerBoxPosition.width = Math.abs(this.resizerBoxPosition.left - this.resizerBoxPosition.right) + 2;
    this.resizerProxyContainer.css(this.resizerBoxPosition);

    return false;
}

WMWindow.prototype.endResize = function() {
    this.manager.setWindowPos(this, this.translatePosition(this.resizerBoxPosition));

    this.resizerProxy.hide();
    this.resizerProxy.detach();

    return false;
}

WMWindow.prototype.startMovePaneDivider = function(dividerHandle) {
    dividerHandle = $(dividerHandle);
    
    this.dividerParentContainer = dividerHandle.parent();
    this.dividerOrientationVertical = dividerHandle.hasClass('pane-divider-vertical');
    if (this.dividerOrientationVertical)
        this.dividerAnchor = this.dividerParentContainer.offset().top;
    else
        this.dividerAnchor = this.dividerParentContainer.offset().left;

    this.manager.grabFocus(this);
    this.dividerBoxPosition = dividerHandle.offset();
    if (this.dividerOrientationVertical) {
        this.dividerBoxPosition.top = this.dividerParentContainer.offset().top;
        this.dividerBoxPosition.height = this.dividerParentContainer.height();
        this.dividerBoxPosition.width = 4;
    } else {
        this.dividerBoxPosition.left = this.dividerParentContainer.offset().left;
        this.dividerBoxPosition.height = 4;
        this.dividerBoxPosition.width = this.dividerParentContainer.width();
    }

    this.paneDividerProxyContainer.css(this.dividerBoxPosition);
    this.paneDividerProxy.appendTo($(document.body));
    this.paneDividerProxy.show();

    return false;
}

WMWindow.prototype.updateMovePaneDivider = function(event) {
    if (this.dividerOrientationVertical) {
        var dividerRight = this.dividerParentContainer.offset().left + this.dividerParentContainer.width() - 4;
        this.dividerBoxPosition.top = this.dividerAnchor;
        this.dividerBoxPosition.left = Math.min(Math.max(event.pageX, this.dividerParentContainer.offset().left), dividerRight);
    } else {
        var dividerBottom = this.dividerParentContainer.offset().top + this.dividerParentContainer.height() - 4;
        this.dividerBoxPosition.top = Math.min(Math.max(event.pageY, this.dividerParentContainer.offset().top), dividerBottom);
        this.dividerBoxPosition.left = this.dividerAnchor;
    }

    this.paneDividerProxyContainer.css(this.dividerBoxPosition);

    return false;
}

WMWindow.prototype.endMovePaneDivider = function() {
    var percentage;
    if (this.dividerOrientationVertical)
        percentage = (this.dividerBoxPosition.left - this.dividerParentContainer.offset().left) / this.dividerParentContainer.width();
    else
        percentage = (this.dividerBoxPosition.top - this.dividerParentContainer.offset().top) / this.dividerParentContainer.height(); 
    percentage = (percentage * 100).toFixed(2);
    percentage += '%';
    
    WindowManager.setPanePos(this, this.dividerParentContainer.attr('id'), percentage);

    this.paneDividerProxy.hide();
    this.paneDividerProxy.detach();

    return false;
}

WMWindow.prototype.click = function() {
    this.manager.grabFocus(this);
}

WMWindow.prototype.minimize = function() {
    this.manager.minimizeWindow(this);
    this.minimized = true;
    this.maximized = false;
}

WMWindow.prototype.restore = function() {
    this.manager.restoreWindow(this);
    this.minimized = false;
    this.maximized = false;
}

WMWindow.prototype.maximize = function() {
    this.manager.maximizeWindow(this);
    this.minimized = false;
    this.maximized = true;
}

WMWindow.prototype.close = function() {
    this.manager.closeWindow(this);
}

WMWindow.prototype.saveWindowInfo = function() {
    this.savedPosition = this.getWindowInfo();
}

WMWindow.prototype.loadWindowInfo = function() {
    return this.savedPosition;
}

WMWindow.prototype.getWindowInfo = function() {
    var info = this.element.offset();
    info.width = this.element.width() + 2;
    info.height = this.element.height() + 2;

    var parentInfo = this.element.parent().offset();
    info.parentTop = parentInfo.top;
    info.parentLeft = parentInfo.left;
    info.parentWidth = this.element.parent().width();
    info.parentHeight = this.element.parent().height();

    return info;
}

WMWindow.prototype.translatePosition = function(pos) {
    return {
        top : pos.top - pos.parentTop,
        left : pos.left - pos.parentLeft,
        width : pos.width,
        height : pos.height,
        parentWidth : pos.parentWidth,
        parentHeight: pos.parentHeight
    };
}

WMWindow.prototype.cancel = function() {
    return false;
}

WMWindow.prototype.splitPaneVertically = function(pane, percent, moveTabsToSplit) {
    pane_id = pane.attr('id');
    WindowManager.splitPaneVertically(this, pane_id, percent, moveTabsToSplit);
}

WMWindow.prototype.splitPaneHorizontally = function(pane, percent, moveTabsToSplit) {
    pane_id = pane.attr('id');
    WindowManager.splitPaneHorizontally(this, pane_id, percent, moveTabsToSplit);
}

WMWindow.prototype.closePane = function(pane) {
    pane_id = pane.attr('id');
    WindowManager.closePane(this, pane_id);
}

WMWindow.prototype.closeAllTabs = function() {
    this.element.find('.pane-container').each(function(idx, el) {
        pane_id = $(el).attr('id');
        WindowManager.closeTabsInPane(pane_id);
    });
}

WMWindow.prototype.isClosed = function() {
    return WindowManager.isClosed(this);
}

WMWindow.prototype.id = function() {
    return this.element.attr('id');
}

var R_MASK = {
    TOP : 1,
    RIGHT : 2,
    BOTTOM : 4,
    LEFT : 8,
}
