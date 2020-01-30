'use strict';

/**
 * Keep track of the StumbleUponAwesome tab
 */
var stumbleTabId = null;

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
      // Switch to exiting tab 
      if (stumbleTabId !== null) {
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

function resetIcon() {
  
}

// Load a page on click
chrome.browserAction.onClicked.addListener(
  function (tab) {
    loadUrl()
    animateIcon();
  }
);

// When a tab closes, if it's the Stumble tab, clear the id
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  if (tabId === stumbleTabId) {
    stumbleTabId = null;
  }
})
