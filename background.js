
function _onUnexpectedDetach(source, detachReason) {
  // when we detach we save this error and show it in the popup
  chrome.storage.local.set({ 'errormsg': `${detachReason}` }, function() {
  });
}

function run() {
  chrome.storage.local.set({ 'errormsg': '' });
  chrome.tabs.create({'url': 'https://www.github.com'}, tab => {
    const tabId = tab.id;
    
    function sendCommand(method, params) {
      return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({tabId}, method, params || {}, result => {
          console.log(result);
          resolve(result);
        });
      });
    }

    chrome.debugger.onDetach.addListener(this._onUnexpectedDetach);
    setTimeout(function() {
      
        // When we go offline we detach, this is a small repro
      chrome.debugger.attach({ tabId }, '1.1', async () => {
        await sendCommand('Network.enable');
        await sendCommand('Network.emulateNetworkConditions', {
          offline: true,
          // values of 0 remove any active throttling. crbug.com/456324#c9
          latency: 0,
          downloadThroughput: 0,
          uploadThroughput: 0,
        });
        
        await sendCommand('Page.enable');
        await sendCommand('Page.navigate', {url: 'https://www.github.com'});
      });
    }, 3000);
  });
}
