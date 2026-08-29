var serverUrl = (function () {
  if (window.location && window.location.origin) {
    return window.location.origin;
  }
  return '';
})();

function convertFileSrc (url) {
  if (!url) {
    return url;
  }
  if (!serverUrl) {
    return url;
  }
  if (url.indexOf('cdvfile://') === 0) {
    return serverUrl + '/_cdvfile_/' + encodeURIComponent(url);
  }
  var assetPrefix = 'file:///android_asset/www/';
  if (url.indexOf(assetPrefix) === 0) {
    return serverUrl + '/' + url.substring(assetPrefix.length);
  }
  return url;
}

window.WEBVIEW_SERVER_URL = serverUrl;
window.WEBVIEW_LOCALSERVER = true;
window.GeckoViewEngine = window.GeckoViewEngine || {};
window.GeckoViewEngine.convertFileSrc = convertFileSrc;
if (typeof window.convertFileSrc !== 'function') {
  window.convertFileSrc = convertFileSrc;
}

module.exports = {
  getInfo: function () {
    return Promise.resolve({
      engine: 'geckoview',
      provider: 'Mozilla Gecko',
      embedded: true,
      server: serverUrl
    });
  },
  convertFileSrc: convertFileSrc
};
