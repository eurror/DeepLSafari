// DeepL API configuration
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
let DEEPL_API_KEY = '';

// Load API key from storage
browser.storage.local.get('apiKey', function(data) {
    if (data.apiKey) {
        DEEPL_API_KEY = data.apiKey;
    }
});

// Create context menu for translation
browser.contextMenus.create({
    id: "translate-selection",
    title: "Translate with DeepL",
    contexts: ["selection"]
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "translate-selection") {
        const selectedText = info.selectionText;

        // Get user's preferred target language from storage
        browser.storage.local.get('defaultTargetLang', function(data) {
            const targetLang = data.defaultTargetLang || 'EN';

            // Send the text to be translated
            translateText(selectedText, targetLang, function(translation) {
                // Send the translation back to the content script
                browser.tabs.sendMessage(tab.id, {
                    action: "showTranslation",
                    translation: translation
                });
            });
        });
    }
});

// Listen for messages from popup or content scripts
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'translate') {
        if (!DEEPL_API_KEY) {
            sendResponse({error: 'DeepL API key not set. Please set it in the options.'});
            return true;
        }

        translateText(request.text, request.targetLang, function(translation, error) {
            if (error) {
                sendResponse({error: error});
            } else {
                sendResponse({translation: translation});
            }
        });
        return true; // Required for async response
    } else if (request.action === 'saveApiKey') {
        DEEPL_API_KEY = request.apiKey;
        browser.storage.local.set({apiKey: request.apiKey});
        sendResponse({success: true});
        return true;
    }
});

// Function to translate text using DeepL API
function translateText(text, targetLang, callback) {
    if (!DEEPL_API_KEY) {
        callback(null, 'API key not set');
        return;
    }

    const formData = new FormData();
    formData.append('text', text);
    formData.append('target_lang', targetLang);

    fetch(DEEPL_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.translations && data.translations.length > 0) {
            callback(data.translations[0].text);
        } else {
            callback(null, 'No translation returned');
        }
    })
    .catch(error => {
        callback(null, error.message);
    });
}
