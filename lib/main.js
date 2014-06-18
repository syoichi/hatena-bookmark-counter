'use strict';

var ORIGIN = 'http://b.hatena.ne.jp',
    info = require('sdk/self'),
    {Page} = require('sdk/page-worker'),
    {ActionButton} = require('sdk/ui/button/action'),
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
      }
    },
    page = Page({
      contentURL: info.data.url('canvas.html')
    }).on('message', dataURL => {
      button.state('tab', {
        icon: dataURL,
        disabled: false
      });
    }),
    button = ActionButton(state).on('click', () => {
      var hatebuURL = ORIGIN + '/entry/' + encodeURIComponent(decodeURI(
        tabs.activeTab.url
      ));

      // can't set relatedToCurrent
      // tabs.open(hatebuURL);
      windowUtils.getMostRecentBrowserWindow()
        .gBrowser.loadOneTab(hatebuURL, {
          referrerURI: null,
          charset: null,
          postData: null,
          inBackground: false,
          allowThirdPartyFixup: false,
          relatedToCurrent: true
        });
    }),
    url;

function main() {
  if (url === tabs.activeTab.url) {
    return;
  }

  url = tabs.activeTab.url;

  button.state('tab', {
    icon: state.icon,
    disabled: true
  });

  // FIXME?: don't filter "https"
  if (/^(?:ftps|about|chrome|resource|data):/.test(url)) {
    return;
  }

  Request({
    url: ORIGIN + '/my.entry?url=' + encodeURIComponent(decodeURI(url))
  }).on('complete', ({json}) => {
    page.postMessage({
      count: json.count || '0',
      duplicated: !!json.bookmarked_data
    });
  }).get();
}

main();

tabs.on('activate', main).on('ready', main).on('pageshow', main);
