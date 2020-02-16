
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(JSON.stringify(request))
        if (request.message === "browser_action") {

            var div = document.createElement("div");
            div.id = 'counter';

            // Create elements here
            var text = document.createElement('div');
            text.className = 'sax-label';
            text.innerHTML = `<span class="sax-label-secondary">Sites visited:</span><span class="sax-label-primary">${request.visited}</span><span class="sax-label-secondary"> out of </span><span class="sax-label-primary">${request.totalUrls}</span>`;
            var icon = document.createElement('img');
            var progress = document.createElement('div');
            progress.className = 'sax-progress';
            var progressOuter = document.createElement('div');
            progressOuter.className = 'sax-progress-outer';

            var progressInner = document.createElement('div');
            progressInner.className = 'sax-progress-inner';
            progressInner.style.width = `${(request.visited / request.totalUrls) * 100}%`;
            progress.append(progressOuter, progressInner);

            icon.src=chrome.extension.getURL('images/icon_16.png')
            icon.className = 'sax-icon'
            div.className = 'sax-info-box'

            div.appendChild(icon);
            div.appendChild(text);
            div.appendChild(progress);

            setTimeout(() => {
                div.classList.add('sax-show')
                div.classList.remove('sax-hide');
                clearTimeout();
                setTimeout(() => {
                    div.classList.add('sax-hide')
                    div.classList.remove('sax-show');
                }, 2000);

            }, 500);

            document.body.prepend(div);

        
        }
    }
);