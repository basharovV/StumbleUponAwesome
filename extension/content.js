function showStumbleInfo(request) {

    var div = document.createElement("div");
    div.classList = ['sax-info-box'];

    // Create elements here
    var top = document.createElement('div');
    top.className = 'sax-info-box-top';

    var text = document.createElement('div');
    text.className = 'sax-label';
    text.innerHTML = `<span class="sax-label-secondary">Stumble No.</span><span class="sax-label-primary">${request.visited}</span><span class="sax-label-secondary">`;

    var icon = document.createElement('img');
    icon.src = chrome.extension.getURL('images/icon_32.png')
    icon.className = 'sax-info-box-icon'

    top.appendChild(icon);
    top.appendChild(text);

    var progress = document.createElement('div');
    progress.className = 'sax-progress';
    var progressOuter = document.createElement('div');
    progressOuter.className = 'sax-progress-outer';

    var progressInner = document.createElement('div');
    progressInner.className = 'sax-progress-inner';
    progressInner.style.width = `${(request.visited / request.totalUrls) * 100}%`;
    progress.append(progressOuter, progressInner);

    div.classList.add('sax-hide')
    div.appendChild(top);
    // div.appendChild(progress);
    setTimeout(() => {
        div.classList.add('sax-show');
        div.classList.remove('sax-hide');

        // clearTimeout();
        setTimeout(() => {
            div.classList.add('sax-hide')
            div.classList.remove('sax-show');
        }, 2500);
    }, 100)

    document.body.prepend(div);

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
    <b>You stumbled on your first site!
    </b>
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