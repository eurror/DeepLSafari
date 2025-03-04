document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const defaultTargetLangSelect = document.getElementById('defaultTargetLang');
    const saveButton = document.getElementById('saveButton');
    const statusDiv = document.getElementById('status');

    // Load saved settings
    browser.storage.local.get(['apiKey', 'defaultTargetLang'], function(data) {
        if (data.apiKey) {
            apiKeyInput.value = data.apiKey;
        }

        if (data.defaultTargetLang) {
            defaultTargetLangSelect.value = data.defaultTargetLang;
        }
    });

    // Save settings
    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        const defaultTargetLang = defaultTargetLangSelect.value;

        if (!apiKey) {
            showStatus('Please enter your DeepL API key', 'error');
            return;
        }

        // Save to storage
        browser.storage.local.set({
            apiKey: apiKey,
            defaultTargetLang: defaultTargetLang
        }, function() {
            // Notify background script about the new API key
            browser.runtime.sendMessage({
                action: 'saveApiKey',
                apiKey: apiKey
            }, function() {
                showStatus('Settings saved successfully!', 'success');
            });
        });
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        statusDiv.style.display = 'block';

        setTimeout(function() {
            statusDiv.style.display = 'none';
        }, 3000);
    }
});
