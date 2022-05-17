(function() {
    var iframeContainers = document.querySelectorAll('.privacy-embed');

    iframeContainers.forEach(function(container) {
        if(container.dataset.thumbnailUrl) {
            container.style.backgroundImage = 'url("' + container.dataset.thumbnailUrl + '")';
        }

        var button = container.querySelector('.privacy-embed-button');
        var iframe = container.querySelector('iframe');
        if(!iframe || !iframe.dataset.privacyEmbedSrc) return;
        var parsedSrc = new URL(iframe.dataset.privacyEmbedSrc);
        iframe.dataset.host = parsedSrc.host;
        button.addEventListener('click', function() {
            if(parsedSrc && parsedSrc.host) {
                addAllowedHost(parsedSrc.host);
                enableByHost(parsedSrc.host);
            }
        });

        var overlayText = container.querySelector('.privacy-embed-content');
        overlayText.innerHTML = overlayText.innerHTML.replace(/(\$Host)/g, parsedSrc.host);
    });

    getAllowedHosts().forEach(function(host) {
        enableByHost(host);
    });

    function enableByHost(host) {
        iframeContainers.forEach(function(container) {
            var iframe = container.querySelector('iframe');
            var overlay = container.querySelector('.privacy-embed-overlay')
            if(!iframe || !iframe.dataset.privacyEmbedSrc || iframe.dataset.host !== host) return;

            iframe.src = iframe.dataset.privacyEmbedSrc;
            container.style.backgroundImage = '';
            container.removeChild(overlay);
        });
    }

    function getAllowedHosts() {
        var hostsStr = window.sessionStorage.getItem('privacy-embed-allowed-hosts');
        if(!hostsStr) hostsStr = '[]';

        return JSON.parse(hostsStr);
    }

    function addAllowedHost(host) {
        var hosts = getAllowedHosts();
        if(hosts.indexOf(host) !== -1) return;

        hosts.push(host);
        window.sessionStorage.setItem('privacy-embed-allowed-hosts', JSON.stringify(hosts));
    }
})();