meteor-application-manager
=============================

This library is a package designed to make desktop-like application in a web browser easy. Define a data structure that describes a series of windows and let the library do the rest! It's painless and the library has a bunch of cool features including:

- Draggable, minimizable, maximizable, resizeable, focuseable windows
- Window layering for multiple windows
- Optional menubar
- Resizable window pane system for splitting up a window
- Awesome right click menus:
  - Split panes horizontally and vertically
  - Close panes
  - Open/Close/Move tabs
  - Rename tabs
- Draggable tabs
  - Drag tabs between windows/panes
  - Drag and drop to create new panes on the fly
- Create an Application-Specific API that is accessible to other applications via an easy-to-use calling function

One of the main features of this library is that it is a **database-defined UI layout**. What does that mean? What it means is that when you (the application developer) define the window layout structure, a default "Window Manager Profile" is created in the WMCollection. When a user logs in for the first time, a copy of this profile is created for them. Then, any UI changes (like dragging windows, moving tabs, etc) updates their profile to reflect the changes, then the reactive templating system takes care of rerendering everything.

What is the significance of this? First, a user can leave and come back and the UI will be the exact same. Second, if two people are logged in from two places, their UI's will always be perfectly synchronized! This opens up some cool avenues for collaborative applications. I've created an example of how to use this library that you can check out by running the following commands. Once it's running, visit http://localhost:3000/ and sign in (link in top left corner) to start playing around with windows!

```
git clone https://github.com/suntzuII/meteor-window-manager.git
cd meteor-window-manager/example
meteor
```

Installation
============

meteor add jchristman:window-manager

Using the Applications
======================

After defining the applications (API explained below), you will need to include the "Applications" template like this:

```
{{#if currentUser}}
    {{> Applications}}
{{else}}
    {{> loginButtons}}
{{/if}}
```

It is important to note that this library **requires** the accounts system from meteor. If noone logs in, then there is no Windows Profile and this will not work. A simple of way of exposing this is with an if currentUser template statement. The "Applications" template is defined **by the library. Do not define your own "windows" template**.

Defining the Applications
=========================

Define your applications as an object:

```
var application = {
    appID : 'f6235091-95f3-4691-aa95-8105a8c40f01',
    appName : 'Example Application 1',
    appOpen : true,
    layout : {
        windows : [
            {
                id : "exampleApp1", 
                title : "Example Application 1",
                focused : true,
                top : "0%", 
                left : "0%", 
                width : "50%", 
                height : "75%",
                zIndex : 1,
                menubar : MENU_BAR
            }
        ],

        tabs : [
            {
                id : "exampleApp1-tab1",
                title : "Example App 1 Tab 1",
                pane_id : "exampleApp1_pane",
                active : true,
                template : "exampleApp1_template1"
            },
            {
                id : "exampleApp1-tab2",
                title : "Example App 1 Tab 2",
                pane_id : "exampleApp1_pane",
                active : false,
                template : "exampleApp1_template2"
            }
        ]
    },
    api : {
        setMessage : function(msg) {
            if (Meteor.isClient) Session.set('_app1_msg', msg);
        }
    }
};

AppManager.registerApp(application);

```

It is important that you *register* your application after defining it.

The fields on each application are defined by this:

| Application Field | Optional | Valid Values  | Description |
| ----------------- | :------: | :-----------: | ----------- |
| appID             | false    | string        | A unique UUID for the application. Omit this to have the library throw an error with a generated UUID. |
| appName           | false    | string        | Friendly name for the application. |
| layout            | false    | object        | Defines the layout of the app. Uses the API described in the next table |
| api               | true     | object        | Define an object of "string" function names to "function" API calls. This can be called by someone calling AppManager.getApp('example').call('api\_func', 'args'). This gives a way of defining an API that other applications can call. |


The fields on each window are defined by this:

| Window Field | Optional | Valid Values  | Description |
| ------------ | :------: | :-----------: | ----------- |
| id           | false    | string        | Identifier used for accessing DOM element |
| title        | true     | string        | Title of window |
| focused      | true     | boolean       | Whether or not the window will start with the focused CSS class |
| closed       | true     | boolean       | Whether or not the window will start closed |
| top          | false    | string (%,px) | Top position of the window in pixels (e.g. "10px") or as a percentage of the parent container |
| left         | false    | string (%,px) | Left position of the window in pixels (e.g. "10px") or as a percentage of the parent container |
| height       | false    | string (%,px) | Height of the window in pixels (e.g. "10px") or as a percentage of the parent container |
| width        | false    | string (%,px) | Width of the window in pixels (e.g. "10px") or as a percentage of the parent container |
| zIndex       | true     | integer       | Starting zIndex of the window |
| pane\_tree   | true     | object        | An optional starting pane layout (defined later) |
| menubar      | true     | object        | An optional menubar for the window (defined later) |

The fields on each window are defined by this:

|   Tab Field  | Optional | Valid Values  | Description |
| ------------ | :------: | :-----------: | ----------- |
| id           | false    | string        | Identifier used for accessing DOM element |
| title        | false    | string        | Title of tab |
| active       | true     | boolean       | Whether or not the tab is "active" by default |
| closed       | true     | boolean       | Whether or not the tab is closed by default |
| pane\_id     | false    | string        | The pane to which this tab is assigned |
| template     | false    | string        | The name of the template that supplies the tab's content |

Pane Tree Object
================

The pane tree is defined by an arbitrary-depth tree where a pane is defined by:

```
pane_tree : {
    id : "test_pane",
    panes : {
        split_orientation : 'vertical',
        split_percent : '60%',
        pane1 : {
            id : 'test_pane1'
        },
        pane2 : {
            id : 'test_pane2',
            panes : {
                split_orientation : 'horizontal',
                split_percent : '50%',
                pane1 : {
                    id : 'test_pane2.1'
                },
                pane2 : {
                    id : 'test_pane2.2'
                }
            }
        }
    }
}
```

In this object, the pane\_tree and each pane1/pane2 must have an 'id' and an optional 'panes' field. If it does not have the 'panes' field, it is treated as a "leaf node" of the tree and the templating system will attempt to load any tabs that are associated with the 'id'. The 'panes' object must have a 'split\_orientation', 'split\_percent', 'pane1', and 'pane2'.

| Pane Field | Optional | Valid Values  | Description |
| ---------- | :------: | :-----------: | ----------- |
| id         | false    | string        | Identifier used for matching which tabs belong to the pane/window |
| pane\_tree | true     | object        | The tree that defines the pane setup |
| pane\_tree.id | false | string        | Identifier used for DOM |
| pane\_tree.panes | true | object      | Panes object that must have a split orientation, split percent, pane1, and pane2 |
| pane\_tree.panes.split\_orientation | false | 'vertical' \| 'horizontal' | A vertical split has a left and right pane. A horizontal split has a top and bottom pane |
| pane\_tree.panes.split\_percent | false | string (%) | A percentage of how far to split from the top or left (depending on orientation) |
| pane\_tree.panes.pane1 | false | object | Object must conform to the same pane\_tree standard |
| pane\_tree.panes.pane2 | false | object | Object must conform to the same pane\_tree standard |

Menubar Object
==============

A menubar object must conform to the following data structure. Each menu has a field "text" and a menuItems array. A "menu item" has a "text" field, an optional subMenu of menuItems, and an optional "action" function that is called on click. An empty {} is treated as a divider in the menu.

```
MENU_BAR = [
    {
        text : 'File',
        menuItems : [
            {
                text : 'New...',
                subMenu : [
                        {
                            text : 'Project',
                            action : function(e) {
                                console.log('New project selected');
                            }
                        },
                        {
                            text : 'File',
                            action : function(e) {
                                console.log('New file selected');
                            }
                        }
                    ]
            },
            {
                text : 'Open...',
                action : function(e) {
                    console.log('Open... selected');
                }
            },
            {},
            {
                text : 'Exit',
                action : function(e) {
                    console.log('Exit selected');
                }
            }
        ]
    },
    {
        text : 'Edit',
        menuItems : [
            {
                text : 'Copy',
                disabled : true,
                action : function(e) {
                    console.log('Copy selected');
                }
            },
            {
                text : 'Paste',
                disabled : true,
                action : function(e) {
                    console.log('Paste selected');
                }
            }
        ]
    }
];
```
