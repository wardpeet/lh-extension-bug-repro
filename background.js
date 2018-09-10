let status = '';
let statusCallback;

function setStatus(msg) {
  status = msg;

  if (statusCallback) {
    statusCallback(status);
  }
}

function getStatus() {
  return status;
}

function listenForStatus(cb) {
  statusCallback = cb;
}

function _onUnexpectedDetach(source, detachReason) {
  // when we detach we save this error and show it in the popup
  setStatus(`debugger detached because ${detachReason}`);
}

function _sendCommand(tabId, method, params) {
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand({tabId}, method, params || {}, result => {
      resolve(result);
    });
  });
}

function attach(tabId) {
  chrome.debugger.onDetach.addListener(_onUnexpectedDetach);
  
  return new Promise(resolve => {
    chrome.debugger.attach({ tabId }, '1.1', resolve);
  });
}

async function goOfflineAndReload(tabId) {
  const sendCommand = _sendCommand.bind(null, tabId);
  await sendCommand('Network.enable');
  await sendCommand('Network.emulateNetworkConditions', {
    offline: true,
    // values of 0 remove any active throttling. crbug.com/456324#c9
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
  });
  
  await sendCommand('Page.enable');
  await sendCommand('Page.reload', {ignoreCache: true});
}
