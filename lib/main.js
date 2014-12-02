'use strict';

var ORIGIN = 'http://b.hatena.ne.jp',
    {Cu} = require('chrome'),
    {XPCOMUtils} = Cu.import('resource://gre/modules/XPCOMUtils.jsm', {}),
    info = require('sdk/self'),
    {Page} = require('sdk/page-worker'),
    {ActionButton} = require('sdk/ui/button/action'),
    {browserWindows} = require('sdk/windows'),
    tabs = require('sdk/tabs'),
    windowUtils = require('sdk/window/utils'),
    {Request} = require('sdk/request'),
    state = {
      id: info.name,
      label: 'Hatena Bookmark Counter',
      icon: {
        18: './icon/icon18.png',
        32: './icon/icon32.png',
        36: './icon/icon36.png',
        64: './icon/icon64.png'
      },
      disabled: true
    },
    page = Page({
      contentURL: './canvas.html',
      contentScriptFile: './canvas.js'
    }).on('message', dataURL => {
      button.state('tab', {
        icon: dataURL,
        disabled: false
      });
    }),
    button = ActionButton(state).on('click', () => {
      // can't set relatedToCurrent
      // tabs.open(hatebuURL);
      windowUtils.getMostRecentBrowserWindow()
        .gBrowser.loadOneTab(wm.get(tabs.activeTab), {
          referrerURI: null,
          charset: null,
          postData: null,
          inBackground: false,
          allowThirdPartyFixup: false,
          relatedToCurrent: true
        });
    }),
    wm = new WeakMap();

function decodeURLByUTF8Safely(url) {
  try {
    return decodeURI(url);
  } catch (err) { }

  return url;
}

({
  init: function init() {
    Object.create(this).listen();

    browserWindows.on('open', () => {
      Object.create(this).listen();
    });
  },
  listen: function listen() {
    var win = windowUtils.getMostRecentBrowserWindow();

    this.onLocationChange(null, null, {spec: tabs.activeTab.url});
    win.gBrowser.addProgressListener(this);

    // load event isn't dispatch.
    // win.addEventListener('load', this);
    win.addEventListener('unload', this);
  },
  handleEvent: function handleEvent(evt) {
    var win = evt.currentTarget;

    switch (evt.type) {/*
    case 'load':
      win.removeEventListener('load', this);
      win.gBrowser.addProgressListener(this);

      break;*/
    case 'unload':
      win.removeEventListener('unload', this);
      win.gBrowser.removeProgressListener(this);

      break;
    }
  },
  onLocationChange: function onLocationChange(progress, req, {spec}) {
    if (this.prevURL === spec) {
      return;
    }

    this.prevURL = spec;

    // FIXME?: don't filter "https"
    if (/^(?:ftps|about|chrome|resource|data):/.test(spec)) {
      return;
    }

    button.state('tab', null);

    Request({
      url: ORIGIN + '/my.entry?url=' + encodeURIComponent(
        decodeURLByUTF8Safely(spec)
      )
    }).on('complete', ({json}) => {
      wm.set(tabs.activeTab, json.entry_url || ORIGIN + '/entry/' + json.url);

      page.postMessage({
        count: json.count || '0',
        duplicated: !!json.bookmarked_data
      });
    }).get();
  },
  QueryInterface: XPCOMUtils.generateQI([
    'nsIWebProgressListener',
    'nsISupportsWeakReference'
  ])
}).init();
