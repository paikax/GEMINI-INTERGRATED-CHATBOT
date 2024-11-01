document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("chatInput");
    const promptContainer = document.getElementById("promptContainer");
    const subRecommendations = document.getElementById("subRecommendations");
    const prompts = ["Code", "Get Advice", "Summarize Text", "Make Plan", "Help Me Write", "Surprise Me"];
    let lastDisplayedSuggestions = [];
    let showAllPrompts = false;

    const detailedSuggestions = {
        "Code": [
            "Viết một hàm trong JavaScript",
            "Sửa lỗi mã nguồn Python",
            "Tối ưu hóa các truy vấn SQL",
            "Chuyển đổi mã nguồn sang ngôn ngữ khác",
            "Tạo một API RESTful với Node.js",
            "Thêm xác thực trong ứng dụng web",
            "Kiểm tra tính năng với Jest",
            "Viết mã theo kiến trúc MVC",
            "Giải thích thuật toán bubble sort",
            "Viết mã HTML cho biểu mẫu liên hệ",
            "Tích hợp Google Analytics vào trang",
            "Viết mã CSS cho responsive design"
        ],
        "Get Advice": [
            "Gợi ý các tài nguyên học lập trình",
            "Mẹo nâng cao năng suất",
            "Lời khuyên cho phát triển sự nghiệp",
            "Cân bằng giữa công việc và cuộc sống",
            "Làm sao để trở thành lập trình viên giỏi",
            "Các công cụ hỗ trợ lập trình hiệu quả",
            "Cách tối ưu hóa thời gian học tập",
            "Phát triển kỹ năng làm việc nhóm",
            "Cách xây dựng tư duy phản biện",
            "Quản lý công việc và thời gian hiệu quả",
            "Những kỹ năng mềm cần thiết",
            "Tư vấn về phát triển bản thân"
        ],
        "Summarize Text": [
            "Tóm tắt một bài viết về AI",
            "Đưa ra tổng quan về blockchain",
            "Rút gọn báo cáo dài",
            "Tóm tắt bài báo khoa học",
            "Tóm lược nội dung sách",
            "Chắt lọc thông tin từ tài liệu",
            "Tóm gọn email dài",
            "Đưa ra điểm chính từ hội nghị",
            "Tóm tắt cuộc họp kinh doanh",
            "Tóm gọn tài liệu dự án",
            "Tổng quan nghiên cứu thị trường",
            "Tóm lược một bài thuyết trình"
        ],
        "Make Plan": [
            "Lập kế hoạch dự án công việc",
            "Hướng dẫn lập kế hoạch học tập",
            "Tạo danh sách việc cần làm hàng ngày",
            "Tổ chức kế hoạch phát triển bản thân",
            "Lên kế hoạch tuần mới",
            "Xây dựng lộ trình học lập trình",
            "Tạo kế hoạch cho dự án nhóm",
            "Lên lịch trình ôn tập",
            "Tạo bảng phân công công việc",
            "Thiết kế lịch học tối ưu",
            "Lập kế hoạch tiết kiệm chi phí",
            "Lên ý tưởng dự án mới"
        ],
        "Help Me Write": [
            "Viết một bài giới thiệu bản thân",
            "Lên ý tưởng bài viết blog",
            "Tạo bài viết quảng cáo",
            "Viết nội dung mô tả sản phẩm",
            "Viết một bức thư xin việc",
            "Soạn email cảm ơn",
            "Lập danh sách từ khóa SEO",
            "Viết kịch bản video",
            "Viết lời mời sự kiện",
            "Viết bài báo cáo kết quả dự án",
            "Tạo bài đăng mạng xã hội",
            "Viết bài phân tích dữ liệu"
        ],
        "Surprise Me": [
            "Cho tôi một thử thách mới",
            "Gợi ý một ý tưởng sáng tạo",
            "Đưa ra lời khuyên bất ngờ",
            "Câu đố thú vị về công nghệ",
            "Một dự án thú vị để thực hiện",
            "Thử nghiệm ngôn ngữ mới",
            "Ý tưởng ứng dụng di động",
            "Chủ đề blog độc đáo",
            "Gợi ý một podcast hay",
            "Kể một câu chuyện ngắn",
            "Gợi ý một câu đố vui",
            "Lời khuyên phát triển bản thân"
        ]
    };

    function displayInitialPrompts() {
        promptContainer.innerHTML = "";
        prompts.slice(0, 4).forEach(prompt => createPromptButton(prompt));
        createPromptButton("More", true);
    }

    function createPromptButton(prompt, isMore = false) {
        const button = document.createElement("button");
        button.classList.add("recommend-btn");
        button.textContent = prompt;
        button.onclick = () => isMore ? toggleAllPrompts() : handlePromptClick(prompt);
        promptContainer.appendChild(button);
    }

    function handlePromptClick(prompt) {
        showSubRecommendations(prompt);
        promptContainer.classList.add("hidden");
    }

    function toggleAllPrompts() {
        if (showAllPrompts) {
            displayInitialPrompts();
        } else {
            promptContainer.innerHTML = "";
            prompts.forEach(prompt => createPromptButton(prompt));
        }
        showAllPrompts = !showAllPrompts;
    }

    function showSubRecommendations(prompt) {
        const suggestions = detailedSuggestions[prompt];
        let newSuggestions;
        do {
            newSuggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 4);
        } while (JSON.stringify(newSuggestions) === JSON.stringify(lastDisplayedSuggestions));

        lastDisplayedSuggestions = newSuggestions;

        subRecommendations.innerHTML = "";
        subRecommendations.classList.remove("hidden");
        newSuggestions.forEach(suggestion => {
            const suggestionBtn = document.createElement("button");
            suggestionBtn.innerText = suggestion;
            suggestionBtn.onclick = () => {
                chatInput.value = suggestion;
                closeSubRecommendations();
            };
            subRecommendations.appendChild(suggestionBtn);
        });
    }

    chatInput.addEventListener("input", () => {
        if (chatInput.value === "") {
            closeSubRecommendations();
        }
    });

    function closeSubRecommendations() {
        subRecommendations.classList.add("hidden");
        promptContainer.classList.remove("hidden");
    }

    // Xử lý sự kiện nhấn phím trong trường nhập
    chatInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            // Ẩn danh sách prompt và gợi ý khi nhấn Enter
            promptContainer.classList.add("hidden");
            subRecommendations.classList.add("hidden");
            chatInput.value = ""; // Xóa nội dung trong trường nhập
        }
    }); 


    displayInitialPrompts();
});