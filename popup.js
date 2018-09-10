
const githubEl = document.getElementById('github');
const statusEl = document.getElementById('status');

chrome.runtime.getBackgroundPage(background => {
  statusEl.innerHTML =`status: ${background.getStatus()}`;

  background.listenForStatus(status => {
    statusEl.innerHTML =`status: ${status}`;
  });
});

let tabId;
chrome.tabs.query({
  currentWindow: true,
  active: true
}, tabs => {
  const firstTabWithId = tabs.find(tab => tab.id);
  
  if (!firstTabWithId) {
    statusEl.innerHTML =`status: no tabId found.`;
    return;
  }

  tabId = firstTabWithId.id;
  githubEl.removeAttribute('disabled');
});

function execBug() {
  chrome.runtime.getBackgroundPage(async background => {
    await background.attach(tabId);

    githubEl.innerHTML = 'Go offline and reload';
    githubEl.onclick = async () => {
      await background.goOfflineAndReload(tabId);
      
      githubEl.innerHTML = 'Attach debugger';
      githubEl.onclick = execBug;
    };
  });
}

githubEl.onclick = execBug;