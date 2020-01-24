'use strict';

/**
 * Keep track of the StumbleRevived tab
 */
var stumbleTabId;

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
        var split = allText.split('\n')
        var randomNum = Math.floor(Math.random() * split.length);
        randomLine = split[randomNum]
        console.log("Random Line\n" + randomLine)
      }
    }

    // Switch to exiting tab 
    if (stumbleTabId) {
      chrome.tabs.update(stumbleTabId, {
        url: randomLine,
        active: true
      }, function (tab) {

      })
    }
    // or Open New tab
    else {
      chrome.tabs.create({
        url: randomLine,
      }, function (tab) {
        stumbleTabId = tab.id
      })
    }
  }

  // Initiate the request for the file
  rawFile.send(null);

}

// Load a page on click
chrome.browserAction.onClicked.addListener(
  function (tab) {
    loadUrl()
  }
);

// When a tab closes, if it's the Stumble tab, clear the id
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  if (tabId === stumbleTabId) {
    stumbleTabId = null;
  }
})
