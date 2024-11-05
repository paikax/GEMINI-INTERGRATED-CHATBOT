//@ts-checkss
let currentLang = 'en'; // Ngôn ngữ mặc định

// Hàm cập nhật ngôn ngữ trong URL mà không tải lại trang
function setLanguageInURL(lang) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('lang', lang);
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
    window.location.reload(); // Trigger page reload
}

// Hàm dịch khi tải trang
async function applyTranslation() {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get('lang');

    // Nếu URL có tham số 'lang', cập nhật ngôn ngữ hiện tại
    if (langFromUrl && langFromUrl !== 'en') {
        currentLang = langFromUrl;
        document.getElementById('languageSelect').value = currentLang;
        await translatePage(currentLang);
    } else {
        // Nếu không, đặt mặc định là tiếng Anh và hiển thị văn bản gốc
        resetToOriginalTexts();
    }
}

// Gán sự kiện thay đổi ngôn ngữ
document.getElementById('languageSelect').addEventListener('change', async () => {
    const select = document.getElementById('languageSelect');
    const targetLang = select.value;

    // Kiểm tra nếu ngôn ngữ đích là tiếng Anh
    if (targetLang === 'en') {
        resetToOriginalTexts();
    } else if (targetLang !== currentLang) {
        await translatePage(targetLang); // Dịch trang
        currentLang = targetLang;
    }

    // Đồng bộ hóa URL với ngôn ngữ mới
    setLanguageInURL(currentLang);
});

// Tải dịch khi tải trang
applyTranslation();

// Hàm hiển thị nội dung gốc nếu ngôn ngữ là tiếng Anh
function resetToOriginalTexts() {
    const elementsToTranslate = document.querySelectorAll('.translatable, [placeholder]');
    elementsToTranslate.forEach(el => {
        if (el.hasAttribute('data-original-text')) {
            if (el.hasAttribute('placeholder')) {
                el.placeholder = el.getAttribute('data-original-text');
            } else {
                el.innerText = el.getAttribute('data-original-text');
            }
        }
    });
}

async function translatePage(targetLang) {
    const elementsToTranslate = document.querySelectorAll('.translatable, [placeholder]');
    const textsToTranslate = Array.from(elementsToTranslate).map(el => {
        // Lưu văn bản gốc vào thuộc tính data-original-text nếu chưa có
        if (!el.hasAttribute('data-original-text')) {
            el.setAttribute('data-original-text', el.placeholder || el.innerText);
        }
        return el.placeholder || el.innerText;
    });

    const translatedTexts = await translateTexts(textsToTranslate, 'en', targetLang);

    elementsToTranslate.forEach((el, index) => {
        if (el.hasAttribute('placeholder')) {
            el.placeholder = translatedTexts[index];
        } else {
            el.innerText = translatedTexts[index];
        }
    });
}

async function translateTexts(texts, sourceLang, targetLang) {
    try {
        const translationPromises = texts.map(async (text) => {
            const cacheKey = `${sourceLang}-${targetLang}-${text}`;
            const cachedTranslation = localStorage.getItem(cacheKey);

            if (cachedTranslation) {
                return cachedTranslation;
            }

            // Mã hóa văn bản trước khi gửi yêu cầu
            const encodedText = encodeURIComponent(text);
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${sourceLang}|${targetLang}`);
            if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);

            const data = await response.json();
            const translatedText = data.responseData.translatedText;

            // Lưu trữ bản dịch vào Local Storage
            localStorage.setItem(cacheKey, translatedText);
            return translatedText;
        });

        return await Promise.all(translationPromises);

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while translating: ' + error.message);
        return texts;
    }
}