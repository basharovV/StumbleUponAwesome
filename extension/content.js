
var isDisplayed = false;

/**
 * 
 * @param {string?} id Optional ID
 * @returns {HTMLDivElement}
 */
const div = (id) => {
    let createdDiv = document.createElement('div');
    if (id) createdDiv.id = id;
    return createdDiv;
}

/**
 * Fade out, then hide after 1 sec.
 * @param {HTMLElement} element 
 * @returns {number} timeoutId
 */
function fadeOutAndHide(element, secondsToFadeOut, secondsToGone, callback) {
    const timeoutId = setTimeout(() => {

        element.classList.add('sax-hide');
        element.classList.remove('sax-show');

        setTimeout(() => {
            element.classList.add('sax-gone');
            element.classList.remove('sax-hide');
            callback();
        }, secondsToGone * 1000);
    }, secondsToFadeOut * 1000);

    return timeoutId;
}

function showAndFadeIn(element, secondsToUnhidden, secondsToFadeIn, callback) {
    const timeoutId = setTimeout(() => {

        element.classList.remove('sax-gone');

        setTimeout(() => {
            element.classList.add('sax-show');
            callback();
        }, secondsToFadeIn * 1000);
    }, secondsToUnhidden * 1000);

    return timeoutId;
}

/**
 * 
 * @param {{visited: number, stumbleUrl: StumbleURL, isRabbitHoleEnabled: boolean}} request 
 */
function showStumbleInfo(request) {

    var enterTimeoutId = null;
    var exitTimeoutId = null;

    // UI
    var ui = document.createElement("div");
    ui.id = 'sax-info-box';

    // Horizontal top bubbles container
    var topBubbles = div('sax-top-bubbles');

    // Rabbit hole bubble
    var rabbitHoleBubble = document.createElement('div');
    rabbitHoleBubble.id = 'sax-rabbit-hole-bubble';
    rabbitHoleBubble.classList.add('sax-hide');
    rabbitHoleBubble.innerHTML = `
        <img id="sax-rabbit-hole-exit-button" src=${chrome.extension.getURL('images/close.svg')} />
        <img id="sax-rabbit-hole-spiral" src=${chrome.extension.getURL('images/spiral.png')} />
        <div id="sax-rabbit-hole-text">
            <p id="sax-rabbit-hole-text-top">In rabbit hole:</p>
            <p id="sax-rabbit-hole-text-bottom">${request.stumbleUrl.listTitle}</p>
        </div>
    `;

    // Top bubble
    var stumbleCounterBubble = document.createElement("div");
    stumbleCounterBubble.id = 'sax-info-box-top';

    var stumbleCounterContent = document.createElement('div');
    stumbleCounterContent.id = 'sax-info-box-top-content';

    var text = document.createElement('div');
    text.id = 'sax-label';

    var title = div('sax-info-box-top-title');
    title.innerHTML = `<span id="sax-label-secondary">Stumble No.</span><span id="sax-label-primary">${request.visited}</span>`;
    text.append(title);

    var icon = document.createElement('img');
    icon.src = chrome.extension.getURL('images/icon_32.png')
    icon.id = 'sax-info-box-icon'

    stumbleCounterContent.appendChild(icon);
    stumbleCounterContent.appendChild(text);

    var progress = document.createElement('div');
    progress.className = 'sax-progress';
    var progressOuter = document.createElement('div');
    progressOuter.className = 'sax-progress-outer';

    var progressInner = document.createElement('div');
    progressInner.className = 'sax-progress-inner';
    progressInner.style.width = `${(request.visited / request.totalUrls) * 100}%`;
    progress.append(progressOuter, progressInner);

    ui.classList.add('sax-hide');
    stumbleCounterBubble.appendChild(stumbleCounterContent);
    topBubbles.appendChild(rabbitHoleBubble);
    topBubbles.appendChild(stumbleCounterBubble);
    ui.appendChild(topBubbles);

    // Bottom bubble if title exists
    var bottom = document.createElement('div');
    bottom.id = 'sax-info-box-bottom';
    var content = document.createElement('div');
    content.id = 'sax-info-box-bottom-content';
    content.innerHTML = `
        <span id="sax-label-small-primary">
            Source: ${request.stumbleUrl.title ? `'${request.stumbleUrl.title}'` : `curated`} from awesome list about 
        </span>
        <span id="sax-label-small-secondary">
            <a id="sax-list-url" href=${request.stumbleUrl.listUrl}>
                ${request.stumbleUrl.listTitle}
            </a>
        </span>
        <div id="sax-rabbit-hole">
            <img id="sax-rabbit-hole-image" src=${chrome.extension.getURL('images/rabbithole.png')} />
        </div>
    `;
    bottom.append(content);

    // NEW popup
    var newFeaturePopup = div('sax-new-feature-popup');
    newFeaturePopup.innerHTML = `
        <p id='sax-new-feature-popup-badge'>NEW!</p>
        <p id='sax-new-feature-popup-text'>Stay on the same topic with <bold>rabbit hole</bold> mode :)</p>
    `;

    ui.appendChild(bottom);
    ui.appendChild(newFeaturePopup);

    enterTimeoutId = setTimeout(() => {
        ui.classList.add('sax-show');
        ui.classList.remove('sax-hide');

        isDisplayed = true;

        exitTimeoutId = fadeOutAndHide(ui, 5, 0.5, () => {
            isDisplayed = false;
        });

    }, 100)


    ui.addEventListener("mouseenter", () => {
        clearTimeout(exitTimeoutId);
    });

    ui.addEventListener("mouseleave", () => {
        if (isDisplayed) {
            // clearTimeout();
            exitTimeoutId = fadeOutAndHide(ui, 5, 0.5, () => {
                isDisplayed = false;
            });
        }
    });

    document.body.prepend(ui);

    if (request.isRabbitHoleEnabled) {
        showRabbitHoleEnabled();
    } else {
        showRabbitHoleDisabled();
    }

    // On hover change to GIF for rabbit hole
    var rabbitHole = document.getElementById('sax-rabbit-hole-image');
    rabbitHole.addEventListener('mouseenter', () => {
        rabbitHole.setAttribute('src', chrome.extension.getURL('images/rabbithole.gif'));
        // Show new feature popup
        showAndFadeIn(newFeaturePopup, 0.1, 0.1, () => {});
    });

    rabbitHole.addEventListener('mouseleave', () => {
        rabbitHole.setAttribute('src', chrome.extension.getURL('images/rabbithole.png'));
        // Hide new feature popup
        if (!request.isRabbitHoleEnabled) {
            fadeOutAndHide(newFeaturePopup, 3, 0.5, () => {});
        }
    });

    rabbitHole.addEventListener('click', () => {
        chrome.storage.local.set({ 'featureRabbitHole1Seen': true }, () => {
            const newFeaturePopup = document.getElementById('sax-new-feature-popup');
            newFeaturePopup.classList.remove('sax-show-fast');
            newFeaturePopup.classList.add('sax-gone');
        });
        chrome.runtime.sendMessage({ message: 'rabbit-hole-enter' })
    });

    var rabbitHoleExitButton = document.getElementById('sax-rabbit-hole-exit-button');

    rabbitHoleExitButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ message: 'rabbit-hole-exit' })
    });

    // Show / Hide the New feature popup depending on flag
    chrome.storage.local.get({ 'featureRabbitHole1Seen': false }, function (result) {
        const newFeaturePopup = document.getElementById('sax-new-feature-popup');

        if (request.isRabbitHoleEnabled || result.featureRabbitHole1Seen) {
            newFeaturePopup.classList.add('sax-hide-fast');
            newFeaturePopup.classList.remove('sax-show-fast');
        } else {
        }
    });
}

function showRabbitHoleEnabled() {

    var rabbitHoleEnabled = document.getElementById('sax-rabbit-hole-bubble');
    rabbitHoleEnabled.classList.add('sax-show');
    rabbitHoleEnabled.classList.remove('sax-hide');

    var rabbitHoleDisabled = document.getElementById('sax-rabbit-hole');
    // rabbitHoleDisabled.classList.add('sax-gone');
    rabbitHoleDisabled.classList.add('sax-rabbithole-no-width');
    rabbitHoleDisabled.classList.remove('sax-rabbithole-full-width');
    // rabbitHoleDisabled.classList.remove('sax-show');
}

function showRabbitHoleDisabled() {
    var rabbitHoleEnabled = document.getElementById('sax-rabbit-hole-bubble');
    rabbitHoleEnabled.classList.add('sax-hide');
    rabbitHoleEnabled.classList.remove('sax-show');

    var rabbitHoleDisabled = document.getElementById('sax-rabbit-hole');
    rabbitHoleDisabled.classList.add('sax-rabbithole-full-width');
    rabbitHoleDisabled.classList.remove('sax-rabbithole-no-width');
}

function toggleStumbleInfo(request) {
    var bubblesInfo = document.getElementById('sax-info-box');
    if (bubblesInfo !== null) {
        if (isDisplayed) {
            bubblesInfo.classList.add('sax-gone');
            bubblesInfo.classList.remove('sax-show');
            isDisplayed = false;
        } else {
            bubblesInfo.classList.add('sax-show');
            bubblesInfo.classList.remove('sax-gone');
            isDisplayed = true;
        }
    } else {
        showStumbleInfo(request);
    }
}

function hideInfo() {
    document.body.removeChild(document.getElementById('sax-info'))
}

function showWelcomeInfo(request) {
    os = request.os;

    const ui = document.createElement('div');
    ui.id = "sax-info";
    icon = document.createElement('img');

    icon.id = 'sax-info-icon';
    icon.src = chrome.extension.getURL('images/icon_128.png');

    text = div('sax-info-text');
    text.innerHTML = `<p id="sax-info-text-title">
    You stumbled on your first site!
    </p>
    </br>
    <p id="sax-info-text-body">
    This extension gives you endless hours of developer-friendly internet discovery. 
    </br>
    Stumble by clicking on the ⚡️ icon in the toolbar, or press <span id="sax-keyboard-shortcut">${os === 'mac' ? "Alt+Shift+S" : "Alt+Shift+S"}
    </span>
    </br></br>
    <div id="sax-info-new-feature">
        <img id="sax-rabbit-hole-spiral-2" src=${chrome.extension.getURL('images/spiral.png')} />
        <span id='sax-info-text-body-small-accent'>NEW!</span>
        </br>
        <span id='sax-info-text-body-small'>
            <span id='sax-info-text-body-small-white'>Rabbit hole: </span>You can now stay stumblin' on the same topic. On your next stumble, follow the rabbit...
        </span>
        <img id="sax-rabbit-hole-image-2" src=${chrome.extension.getURL('images/rabbithole_small.png')} />
    </div>
    </br></br>
    <p id="sax-info-text-body-smaller-white">
    💬 I'll improve this extension with <a id="sax-info-text-body-feedback-link" href="mailto:stumbleuponawesome@gmail.com">your feedback</a>
    </p>
    <p id="sax-info-text-opensource">
    ℹ Also, this extension is open-source! 
    <a id="sax-info-text-opensource-link" href="https://github.com/basharovV/StumbleUponAwesome"> 
    See the code and URLs
    </a></p>`;

    close = document.createElement('a')
    close.innerHTML = "Awesome, got it! 🤘"
    close.id = 'sax-info-close';

    ui.appendChild(icon);
    ui.appendChild(text);
    ui.appendChild(close);
    close.addEventListener('click', hideInfo);
    document.body.prepend(ui);
    chrome.storage.local.set({ 'welcome_seen': true }, function () {
    });
}

function showUpdateInfo() {

    const ui = document.createElement('div');
    ui.id = "sax-info";
    icon = document.createElement('img');

    icon.id = 'sax-info-icon';
    icon.src = chrome.extension.getURL('images/icon_128.png');

    text = div('sax-info-text');
    text.innerHTML = `<p id="sax-info-text-title">StumbleUponAwesome updated to 1.2.2!
    </p>
    </br>
   
    <p id="sax-info-text-body">
    In this update:
    </p>
    <p id="sax-info-text-body-smaller-white">
    - 🐞 Fixed a crash on update </br>
    - ⚠️ If your keyboard shortcut (Alt + Shift + S) stopped working, do this:</br>
        --> On Chrome/Brave: Go to chrome://extensions/shortcuts and re-add the shortcut!</br>
        --> On Firefox: Go to about:addons, then click on the ⚙️ -> Manage Extension Shortcuts and re-add the shortcut! 
    </p>
    </br>`;

    close = document.createElement('a');
    close.innerHTML = "Awesome, got it! 🤘";
    close.id = 'sax-info-close';

    ui.appendChild(icon);
    ui.appendChild(text);
    ui.appendChild(close);
    close.addEventListener('click', hideInfo);
    document.body.prepend(ui);
    chrome.storage.local.set({ 'show_update': false }, function () {
    });
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "stumble") {
            if (isDisplayed) {
                if (request.isRabbitHoleEnabled) {
                    showRabbitHoleEnabled();
                } else {
                    showRabbitHoleDisabled();
                }
            } else {
                toggleStumbleInfo(request);
            }
        } else if (request.message === "welcome") {
            showWelcomeInfo(request);
        } else if (request.message === "update") {
            showUpdateInfo(request);
        }
    }
);