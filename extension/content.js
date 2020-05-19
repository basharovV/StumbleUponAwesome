
/**
 * 
 * @param {{visited: number, stumbleUrl: StumbleURL}} request 
 */
function showStumbleInfo(request) {

    var enterTimeoutId = null;
    var exitTimeoutId = null;
    var isDisplayed = false;

    // UI
    var div = document.createElement("div");
    div.id = 'sax-info-box';

    // Top bubble
    var top = document.createElement("div");
    top.id = 'sax-info-box-top';

    var topContent = document.createElement('div');
    topContent.id = 'sax-info-box-top-content';

    var text = document.createElement('div');
    text.id = 'sax-label';

    var title = document.createElement('p');
    title.innerHTML = `<span id="sax-label-secondary">Stumble No.</span><span id="sax-label-primary">${request.visited}</span><span id="sax-label-secondary">`;
    text.append(title);

    var icon = document.createElement('img');
    icon.src = chrome.extension.getURL('images/icon_32.png')
    icon.id = 'sax-info-box-icon'

    topContent.appendChild(icon);
    topContent.appendChild(text);

    var progress = document.createElement('div');
    progress.className = 'sax-progress';
    var progressOuter = document.createElement('div');
    progressOuter.className = 'sax-progress-outer';

    var progressInner = document.createElement('div');
    progressInner.className = 'sax-progress-inner';
    progressInner.style.width = `${(request.visited / request.totalUrls) * 100}%`;
    progress.append(progressOuter, progressInner);

    div.classList.add('sax-hide');
    top.appendChild(topContent);
    div.appendChild(top);

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
    div.appendChild(bottom);

    // div.appendChild(progress);
    enterTimeoutId = setTimeout(() => {
        console.log('check');
        console.log('timeout');
        div.classList.add('sax-show');
        div.classList.remove('sax-hide');

        isDisplayed = true;

        // clearTimeout();
        exitTimeoutId = setTimeout(() => {
            div.classList.add('sax-hide')
            div.classList.remove('sax-show');
            isDisplayed = false;
        }, 2800);
    }, 100)


    div.addEventListener("mouseenter", () => {
        console.log('mouse enter');
        clearTimeout(exitTimeoutId);
    });

    div.addEventListener("mouseleave", () => {
        console.log('mouse leave');
        if (isDisplayed) {
            // clearTimeout();
            exitTimeoutId = setTimeout(() => {
                div.classList.add('sax-hide');
                div.classList.remove('sax-show');
                isDisplayed = false;
            }, 1300);
        }
    });

    document.body.prepend(div);

    // On hover change to GIF for rabbit hole
    var rabbitHole = document.getElementById('sax-rabbit-hole-image');
    rabbitHole.addEventListener('mouseenter', () => {
        rabbitHole.setAttribute('src', chrome.extension.getURL('images/rabbithole.gif'));
    })
    rabbitHole.addEventListener('mouseleave', () => {
        rabbitHole.setAttribute('src', chrome.extension.getURL('images/rabbithole.png'));
    })

    console.log('check');

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
        console.log(JSON.stringify(request))
        if (request.message === "stumble") {
            showStumbleInfo(request);
        } else if (request.message === "welcome") {
            showWelcomeInfo(request);
        }
    }
);