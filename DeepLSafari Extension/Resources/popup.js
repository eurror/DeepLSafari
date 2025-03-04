document.addEventListener('DOMContentLoaded', function() {
    const translateButton = document.getElementById('translateButton');
    const sourceText = document.getElementById('sourceText');
    const targetLang = document.getElementById('targetLang');
    const resultDiv = document.getElementById('result');

    // Check if there's selected text from the active tab
    browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
        browser.tabs.sendMessage(tabs[0].id, {action: "getSelectedText"}, function(response) {
            if (response && response.selectedText) {
                sourceText.value = response.selectedText;
            }
        });
    });

    translateButton.addEventListener('click', function() {
        if (sourceText.value.trim() === '') {
            resultDiv.textContent = 'Please enter text to translate';
            return;
        }

        resultDiv.textContent = 'Translating...';

        // Send message to background script to handle API call
        browser.runtime.sendMessage({
            action: 'translate',
            text: sourceText.value,
            targetLang: targetLang.value
        }, function(response) {
            if (response.error) {
                resultDiv.textContent = 'Error: ' + response.error;
            } else {
                resultDiv.innerHTML = '<strong>Translation:</strong><br>' + response.translation;
            }
        });
    });
});
