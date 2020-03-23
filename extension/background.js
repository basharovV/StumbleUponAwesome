'use strict';

/**
 * Keep track of the StumbleUponAwesome tab
 */
var stumbleTabId = null;

/**
 * The focused window ID
 */
var windowId = null;

var totalUrls = 0; // to be counted on first run
var os = 'mac'; // mac", "win", "android", "cros", "linux"

/**
 * @typedef {Object} StumbleURL
 * @property {string} url
 * @property {string=} title
 * @property {string} listUrl The URL of the collection.
 * @property {string=} listTitle The title of the collection.
 */

/**
* @type {StumbleURL}
*/
var stumbleUrl;

var isPendingStumble = false;

chrome.runtime.getPlatformInfo(function (info) {
  os = info.os;
})

/**
 * Find a random URL from the file and load it
 * 
 * The URLs in the urls.txt file have been scraped from each README pages collected
 * in https://github.com/sindresorhus/awesome/blob/master/readme.md
 * 
 * Huge props to @sindresorhus for curating all that content
 */
function loadUrl() {
  var randomLine;
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", "urls.txt", true);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200) {
        var allText = rawFile.responseText;
        var lines = allText.split('\n');
        totalUrls = lines.length;
        var randomNum = Math.floor(Math.random() * lines.length);
        randomLine = lines[randomNum].split(',');
        stumbleUrl = {
          url: randomLine[0],
          title: randomLine[1].trim().length > 0 ? randomLine[1].trim() : undefined,
          listUrl: randomLine[2],
          listTitle: randomLine[3]
        }
        console.log("Random Line\n" + randomLine)
      }
      // Switch to exiting tab 
      if (stumbleTabId !== null) {
        try {
          chrome.tabs.update(stumbleTabId, {
            url: stumbleUrl.url,
            active: true
          }, function (tab) {
          })
        } catch (exception) {
          chrome.tabs.update({
            url: stumbleUrl.url,
          }, async function (tab) {
            await saveStumbleTabId(tab.id);
          })
        }
      }
      // or Open New tab
      else {
        chrome.tabs.create({
          url: stumbleUrl.url,
        }, async function (tab) {
          await saveStumbleTabId(tab.id);
        })
      }
    }
  }

  // Initiate the request for the file
  rawFile.send(null);

}
var interval = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function animateIcon() {
  const size = 48;
  var canvas = document.createElement('canvas')
  canvas.setAttribute('id', 'canvas')
  canvas.width = size
  canvas.height = size
  canvas.style.position = 'absolute'
  canvas.style.top = '0'
  canvas.style.left = '0'

  var context = canvas.getContext('2d');
  var lines = 8;

  var boxWidth = size;
  var boxHeight = size;

  var iconWidth = boxWidth * 0.7;
  var iconHeight = boxHeight * 0.9;
  var iconHalfHeight = iconHeight / 2;
  var iconHalfWidth = iconWidth / 2;

  context.beginPath();
  context.fillStyle = "red";
  context.strokeRect(0, 0, boxWidth, boxHeight);
  context.strokeStyle = "green"
  context.strokeRect((boxWidth - iconWidth) / 2, (boxHeight - iconHeight) / 2, iconWidth, iconHeight);
  context.translate(((boxWidth - iconWidth) / 2), (boxHeight - iconHeight) / 2)

  for (var i = 0; i < lines; i++) {
    await sleep(20);
    context.clearRect(0, 0, boxWidth, boxHeight);
    // Within icon bounds now
    switch (i) {
      case 0:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        break;
      case 1:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        context.moveTo(iconWidth, 0);
        break;
      case 2:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        context.moveTo(iconWidth, 0);
        context.lineTo(0, iconHalfHeight);
        break;
      case 3:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        context.moveTo(iconWidth, 0);
        context.lineTo(0, iconHalfHeight);
        context.lineTo(iconHalfWidth, iconHalfHeight);
        context.strokeStyle = '#27d7dd';
        break;
      case 4:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        context.moveTo(iconWidth, 0);
        context.lineTo(0, iconHalfHeight);
        context.lineTo(iconHalfWidth, iconHalfHeight);
        context.lineTo(0, iconHeight);
        context.strokeStyle = "#8b27dd";
        break;
      case 5:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        context.moveTo(iconWidth, 0);
        context.lineTo(0, iconHalfHeight);
        context.lineTo(iconHalfWidth, iconHalfHeight);
        context.lineTo(0, iconHeight);
        context.lineTo(iconWidth, iconHalfHeight);
        context.strokeStyle = "#e6f7de";
        break;
      case 6:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        context.moveTo(iconWidth, 0);
        context.lineTo(0, iconHalfHeight);
        context.lineTo(iconHalfWidth, iconHalfHeight);
        context.lineTo(0, iconHeight);
        context.lineTo(iconWidth, iconHalfHeight);
        context.lineTo(iconHalfWidth, iconHalfHeight);
        context.strokeStyle = "#e6f7de";
        break;
      case 7:
        context.beginPath();
        context.moveTo(iconWidth, 0);
        context.moveTo(iconWidth, 0);
        context.lineTo(0, iconHalfHeight);
        context.lineTo(iconHalfWidth, iconHalfHeight);
        context.lineTo(0, iconHeight);
        context.lineTo(iconWidth, iconHalfHeight);
        context.lineTo(iconHalfWidth, iconHalfHeight);
        context.closePath()
        context.strokeStyle = "#e07128";
        break;
    }
    context.lineWidth = 2.5;
    // context.strokeStyle = 'rgba(216, 151, 131, 1)';
    context.stroke();

    var imageData = context.getImageData((boxWidth - iconWidth) / 2, (boxHeight - iconHeight) / 2, iconWidth, iconHeight);

    chrome.browserAction.setIcon({
      imageData: imageData
    });
  }

  await sleep(200);
  context.fillStyle = 'rgba(216, 151, 131, 1)';
  context.fill();

  var imageData = context.getImageData((boxWidth - iconWidth) / 2, (boxHeight - iconHeight) / 2, iconWidth, iconHeight);
  chrome.browserAction.setIcon({
    imageData: imageData
  });

  await sleep(400);
  chrome.browserAction.setIcon({
    imageData: null,
    path: "./images/icon_16.png"
  });
}

const saveStumbleTabId = tabId => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ 'stumbleTabId': tabId }, function () {
      console.log(`Saved stumble tabId: ${tabId}`);
      stumbleTabId = tabId;
      resolve();
    });
  })
}

const getStumbleTabId = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['stumbleTabId'], function (result) {
      if (result.stumbleTabId) {
        resolve(result.stumbleTabId);
      } else {
        resolve(null);
      }
    })
  });
}

function update() {
  chrome.storage.local.get(['visited', 'totalUrls', 'welcome_seen'], function (result) {

    if (result.welcome_seen === undefined || result.welcome_seen === false || result.welcome_seen === null) {
      console.log('Setting welcome');
      chrome.tabs.executeScript({
        file: 'styles.css'
      }, function () {
        chrome.tabs.executeScript({
          file: 'content.js'
        }, function () {
          notifyTabWelcome();
        });
      });
    } else {
      console.log('Visited is' + result.visited);
      const count = result.visited === undefined ? 0 : parseInt(result.visited)
      const incremented = count + 1;
      // Set new value
      chrome.storage.local.set({ 'visited': incremented, 'totalUrls': totalUrls }, function () {
        console.log('Visited is now set to ' + incremented);
        notifyTabStumble(incremented, totalUrls);
      });
    }
  });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // make sure the status is 'complete' and it's the right tab
  if (isPendingStumble && tabId === stumbleTabId && changeInfo.status === 'complete') {
    update();
    isPendingStumble = false;
  }
});

function notifyTabStumble(visited, totalUrls) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(stumbleTabId, { "message": "stumble", 'visited': visited, 'totalUrls': totalUrls, stumbleUrl });
  });
}

function notifyTabWelcome() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(stumbleTabId, { "message": "welcome", "os": os });
  });
}

// Load a page on click
chrome.browserAction.onClicked.addListener(
  async function (tab) {

    const currentWindowId = await getFocusedWindowId();
    console.log(`oldWindow: ${windowId} newWindow: ${currentWindowId}`)
    // Get stumble tab Id
    const savedStumbleTabId = await getStumbleTabId();
    const tabs = await getBrowserTabs();
    const tabIds = tabs.map(t=>t.id);

    // Reset if necessary
    if (windowId !== currentWindowId || !stumbleTabId || !tabIds.includes(savedStumbleTabId)) {
      windowId = currentWindowId;
      chrome.storage.local.remove(['stumbleTabId'], () => {
        stumbleTabId = null;
      })
    }

    isPendingStumble = true;
    loadUrl();
    animateIcon();
  }
);

// When a tab closes, if it's the Stumble tab, clear the id
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  if (tabId === stumbleTabId) {
    stumbleTabId = null;
  }
})

function clearCounter() {
  chrome.storage.local.remove(['visited'])
}

chrome.runtime.onInstalled.addListener(function () {
  // For development purposes only, uncomment when needed
  // chrome.storage.local.remove(['visited', 'welcome_seen', 'totalUrls'])

  chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create({
      id: "stumbleuponawesome",
      title: 'Give feedback to improve the extension',
      contexts: ["browser_action"]
    });
  })
});

/**
 * Return the list of Chrome tabs
 * @returns {Promise<Array<chrome.tabs.Tab>>}
 */
const getBrowserTabs = async () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({currentWindow: true}, function (tabs) {
      resolve(tabs);
    });
  })
}

/**
 * Return the recently focused window id.
 * @returns {Promise<number>}
 */
const getFocusedWindowId = () => {
  return new Promise((resolve, reject) => {
    chrome.windows.getCurrent(window => {
      resolve(window.id);
    });
  });
}

/*
Context menu
*/
chrome.contextMenus.onClicked.addListener(function (event) {
  if (event.menuItemId === "stumbleuponawesome") {

    chrome.tabs.create({
      url: 'mailto:stumbleuponawesome@gmail.com?subject=Feedback on StumbleUponAwesome&body=Tell me! :)',
    }, function (tab) {
    })
  }
});