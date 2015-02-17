Package.describe({
  name: 'jchristman:application-manager',
  summary: 'Meteor package to easily allow desktop-like applications in meteor',
  version: '1.0.7_2',
  git: 'https://github.com/suntzuII/meteor-application-manager'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.0');

  api.use('accounts-base',['client','server']);
  api.use('underscore');
  api.use('templating', 'client');
  api.use('jquery','client');
  api.use('mizzao:jquery-ui@1.11.2','client')
  api.use('jchristman:context-menu@1.1.4','client');

  api.addFiles([
      'collections/AppCollection.js',
      'lib/UserManager.js',
      'lib/WindowManager/WindowManager.js',
      'lib/Application.js',
      'lib/ApplicationManager.js',
  ],['client','server']);

  api.addFiles([
      'lib/WindowManager/Window.js',
      'lib/style.css',
      'lib/context-menus/tab-context-menu-config.js',
      'lib/context-menus/pane-context-menu-config.js',
      'lib/context-menus/context-menu-funcs.js',
      'lib/template/LoaderTemplate.html',
      'lib/template/WindowsTemplates.html',
      'lib/template/WindowsTemplates.js',
      'lib/template/content/tabbed-window.html',
      'lib/template/content/tabbed-window.js',
      'lib/template/content/tabbed-window.css',
      'lib/template/content/paged-window.html',
      'lib/template/content/paged-window.js',
      'lib/template/content/paged-window.css',
  ],['client']);

  api.export([
        'ApplicationManager',
        'AppManager',
        'AppCollection',
        'Application',
        'CONTEXT_MENU_FUNCS'
  ], ['client','server']); 
});
