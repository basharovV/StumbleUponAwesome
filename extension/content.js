
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

    var title = document.createElement('p');
    title.innerHTML = `<span id="sax-label-secondary">Stumble No.</span><span id="sax-label-primary">${request.visited}</span><span id="sax-label-secondary">`;
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
    ui.appendChild(bottom);


    // div.appendChild(progress);
    enterTimeoutId = setTimeout(() => {
        console.log('check');
        console.log('timeout');
        ui.classList.add('sax-show');
        ui.classList.remove('sax-hide');

        isDisplayed = true;

        // clearTimeout();
        exitTimeoutId = setTimeout(() => {
            ui.classList.add('sax-hide')
            ui.classList.remove('sax-show');
            isDisplayed = false;
        }, 5000);
    }, 100)


    ui.addEventListener("mouseenter", () => {
        console.log('mouse enter');
        clearTimeout(exitTimeoutId);
    });

    ui.addEventListener("mouseleave", () => {
        console.log('mouse leave');
        if (isDisplayed) {
            // clearTimeout();
            exitTimeoutId = setTimeout(() => {
                ui.classList.add('sax-hide');
                ui.classList.remove('sax-show');
                isDisplayed = false;
            }, 1300);
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
    })
    rabbitHole.addEventListener('mouseleave', () => {
        rabbitHole.setAttribute('src', chrome.extension.getURL('images/rabbithole.png'));
    })
    rabbitHole.addEventListener('click', () => {
        chrome.runtime.sendMessage({ message: 'rabbit-hole-enter' })
    })
    var rabbitHoleExitButton = document.getElementById('sax-rabbit-hole-exit-button');

    rabbitHoleExitButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ message: 'rabbit-hole-exit' })
    });

    console.log('check');

}

function showRabbitHoleEnabled() {

    var rabbitHoleEnabled = document.getElementById('sax-rabbit-hole-bubble');
    rabbitHoleEnabled.classList.add('sax-show');
    rabbitHoleEnabled.classList.remove('sax-hide');

    var rabbitHoleDisabled = document.getElementById('sax-rabbit-hole');
    rabbitHoleDisabled.classList.add('sax-gone');
    rabbitHoleDisabled.classList.remove('sax-show');
}

function showRabbitHoleDisabled() {
    var rabbitHoleEnabled = document.getElementById('sax-rabbit-hole-bubble');
    rabbitHoleEnabled.classList.add('sax-hide');
    rabbitHoleEnabled.classList.remove('sax-show');

    var rabbitHoleDisabled = document.getElementById('sax-rabbit-hole');
    rabbitHoleDisabled.classList.add('sax-show');
    rabbitHoleDisabled.classList.remove('sax-gone');
}

function toggleStumbleInfo(request) {
    var bubblesInfo = document.getElementById('sax-info-box');
    console.log(`Bubbles info box: ${bubblesInfo}`);
    if (bubblesInfo !== null) {
        if (isDisplayed) {
            bubblesInfo.classList.add('sax-hide');
            bubblesInfo.classList.remove('sax-show');
            isDisplayed = false;
        } else {
            bubblesInfo.classList.add('sax-show');
            bubblesInfo.classList.remove('sax-hide');
            isDisplayed = true;
        }
    } else {
        showStumbleInfo(request);
    }
}

function hideWelcomeInfo() {
    document.body.removeChild(document.getElementById('sax-welcome'))
}

function showWelcomeInfo(request) {
    os = request.os;

    div = document.createElement('div');
    div.id = "sax-welcome";
    icon = document.createElement('img');

    icon.id = 'sax-welcome-icon';
    icon.src = chrome.extension.getURL('images/icon_128.png');

    text = document.createElement('div');
    text.innerHTML = `<p id="sax-welcome-text-title">
    You stumbled on your first site!
    </p>
    </br>
    <p id="sax-welcome-text-body">
    This extension gives you endless hours of developer-friendly internet discovery. 
    Keep clicking on the ⚡️ icon in the toolbar, or press <span id="sax-keyboard-shortcut">${os === 'mac' ? "Alt+Shift+S" : "Alt+Shift+S"}
    </span>
    </br></br>
    <p id="sax-welcome-text-body">
    💬 I'll improve this extension with <a id="sax-welcome-text-body-feedback-link" href="mailto:stumbleuponawesome@gmail.com">your feedback</a>
    </p>
    <p id="sax-welcome-text-opensource">
    ℹ This extension is open-source! 
    <a id="sax-welcome-text-opensource-link" href="https://raw.githubusercontent.com/basharovV/StumbleUponAwesome/master/extension/urls.txt"> 
    See the code and URLs 
    </a></p>`;
    text.classList = ['sax-welcome-text']

    close = document.createElement('a')
    close.innerHTML = "Awesome, got it! 🤘"
    close.id = 'sax-welcome-close';

    div.appendChild(icon);
    div.appendChild(text);
    div.appendChild(close);
    close.addEventListener('click', hideWelcomeInfo);
    document.body.prepend(div);
    chrome.storage.local.set({ 'welcome_seen': true }, function () {
        console.log("Welcome seen for StumbleUponAwesome")
    });
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(JSON.stringify(request));
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
        }
    }
);