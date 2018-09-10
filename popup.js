
document.getElementById('github').addEventListener('click', execBug);

showErrors(); 
function showErrors() {
  chrome.storage.local.get('errormsg', function(result) {
    console.log('storage', result);
    document.getElementById('error').innerHTML = `last error: ${result.errormsg}`;
  });
}

function execBug() {
  chrome.runtime.getBackgroundPage(background => {
    background.run();
  });
}
