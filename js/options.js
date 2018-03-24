function loadOptions() {
  chrome.storage.sync.get({
    ghToken: '',
  }, function(items) {
    document.getElementById('token').value = items.ghToken;
  });
}

function saveOptions() {
  let ghToken = document.getElementById("token").value;

  chrome.storage.sync.set({
    ghToken: ghToken,
  }, function() {
    // Update status to let user know options were saved.
    let status = document.getElementById('status');
    status.textContent = 'Token saved';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("submit").addEventListener("click", saveOptions);
  loadOptions();
});
