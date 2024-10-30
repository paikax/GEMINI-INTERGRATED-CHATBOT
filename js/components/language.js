let currentLang = 'en'; // Ngôn ngữ hiện tại

// Lấy ngôn ngữ từ URL khi tải trang
const urlParams = new URLSearchParams(window.location.search);
const langFromUrl = urlParams.get('lang');
if (langFromUrl) {
    currentLang = langFromUrl; // Cập nhật ngôn ngữ hiện tại từ URL
}

// Cập nhật chọn ngôn ngữ ban đầu
document.getElementById('languageSelect').value = currentLang;

document.getElementById('languageSelect').addEventListener('change', async () => {
    const select = document.getElementById('languageSelect');
    const targetLang = select.value;

    // Kiểm tra xem ngôn ngữ được chọn có giống ngôn ngữ hiện tại không
    if (targetLang === currentLang) {
        return; // Không làm gì nếu ngôn ngữ giống nhau
    }

    const elementsToTranslate = document.querySelectorAll('.translatable');
    const textsToTranslate = Array.from(elementsToTranslate).map(el => el.innerText);

    console.log('Translating texts:', textsToTranslate, 'to language:', targetLang); // In ra để kiểm tra

    const translatedTexts = await translateTexts(textsToTranslate, currentLang, targetLang);
    
    elementsToTranslate.forEach((el, index) => {
        el.innerText = translatedTexts[index];
    });

    // Cập nhật ngôn ngữ hiện tại
    currentLang = targetLang;

    // Cập nhật URL với ngôn ngữ mới
    urlParams.set('lang', currentLang);
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
});

async function translateTexts(texts, sourceLang, targetLang) {
    try {
        // Tạo một mảng chứa các yêu cầu dịch cho từng văn bản
        const requests = texts.map(text => {
            return fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => data.responseData.translatedText); // Trả về văn bản đã dịch
        });

        // Đợi tất cả các yêu cầu hoàn thành
        return await Promise.all(requests);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while translating: ' + error.message);
        return texts; // Trả về văn bản gốc nếu có lỗi
    }
}
