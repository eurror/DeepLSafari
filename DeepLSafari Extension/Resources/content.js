let translateOverlay = null;
let translationPopup = null;

function createTranslateButton() {
    const button = document.createElement('div');
    button.id = 'deepl-translate-button';
    button.innerHTML = 'Translate';
    button.style.display = 'none';

    button.addEventListener('click', function() {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            // Get default target language from storage
            browser.runtime.sendMessage({
                action: 'translate',
                text: selectedText,
                targetLang: 'EN' // Default to English, can be changed in settings
            }, function(response) {
                showTranslationPopup(response.translation || response.error);
            });
        }
    });

    document.body.appendChild(button);
    return button;
}

function createTranslationPopup() {
    const popup = document.createElement('div');
    popup.id = 'deepl-translation-popup';
    popup.style.display = 'none';

    const closeButton = document.createElement('div');
    closeButton.id = 'deepl-popup-close';
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', function() {
        popup.style.display = 'none';
    });

    const content = document.createElement('div');
    content.id = 'deepl-popup-content';

    popup.appendChild(closeButton);
    popup.appendChild(content);
    document.body.appendChild(popup);

    return popup;
}

function showTranslationPopup(text) {
    if (!translationPopup) {
        translationPopup = createTranslationPopup();
    }

    const content = document.getElementById('deepl-popup-content');
    content.textContent = text;

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    translationPopup.style.display = 'block';
    translationPopup.style.top = `${rect.bottom + window.scrollY + 10}px`;
    translationPopup.style.left = `${rect.left + window.scrollX}px`;
}

document.addEventListener('mouseup', function(event) {
    const selectedText = window.getSelection().toString().trim();

    if (selectedText.length > 0) {
        if (!translateOverlay) {
            translateOverlay = createTranslateButton();
        }

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        translateOverlay.style.display = 'block';
        translateOverlay.style.top = `${rect.bottom + window.scrollY + 10}px`;
        translateOverlay.style.left = `${rect.left + window.scrollX}px`;
    } else if (translateOverlay) {
        translateOverlay.style.display = 'none';
    }
});

// Listen for messages from background script
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getSelectedText") {
        sendResponse({selectedText: window.getSelection().toString().trim()});
    } else if (request.action === "showTranslation") {
        showTranslationPopup(request.translation);
    }
});
