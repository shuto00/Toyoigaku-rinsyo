// 変数
let currentQuestions =[];
let currentQuestionIndex = 0;
let score = 0;
let wrongQuestionsIds = JSON.parse(localStorage.getItem("wrongQuestions")) ||[];

// 画面要素
const homeScreen = document.getElementById("home-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const categoryList = document.getElementById("category-list");
const contextBox = document.getElementById("context-box");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const explanationBox = document.getElementById("explanation-box");
const homeBtn = document.getElementById("home-btn");

// 初期化（カテゴリボタンの生成）
function init() {
    quizData.forEach(categoryObj => {
        const btn = document.createElement("button");
        btn.className = "category-btn";
        btn.textContent = `${categoryObj.category} (${categoryObj.questions.length}問)`;
        btn.onclick = () => startQuiz(categoryObj.questions);
        categoryList.appendChild(btn);
    });

    document.getElementById("review-btn").onclick = startReview;
    document.getElementById("next-btn").onclick = nextQuestion;
    homeBtn.onclick = showHome;
    document.getElementById("back-home-btn").onclick = showHome;
    
    updateReviewButton();
}

// 復習ボタンの更新
function updateReviewButton() {
    const btn = document.getElementById("review-btn");
    if (wrongQuestionsIds.length === 0) {
        btn.textContent = "間違えた問題はありません";
        btn.disabled = true;
    } else {
        btn.textContent = `間違えた問題を解く (${wrongQuestionsIds.length}問)`;
        btn.disabled = false;
    }
}

// すべての問題をフラットな配列にするヘルパー関数
function getAllQuestions() {
    return quizData.reduce((acc, cat) => acc.concat(cat.questions),[]);
}

// 復習モード開始
function startReview() {
    const allQuestions = getAllQuestions();
    const reviewQuestions = allQuestions.filter(q => wrongQuestionsIds.includes(q.id));
    startQuiz(reviewQuestions);
}

// クイズ開始
function startQuiz(questions) {
    if (questions.length === 0) return;
    currentQuestions = [...questions]; // コピーを作成
    // ランダムに出題したい場合はここでシャッフル: currentQuestions.sort(() => Math.random() - 0.5);
    currentQuestionIndex = 0;
    score = 0;

    homeScreen.style.display = "none";
    resultScreen.style.display = "none";
    quizScreen.style.display = "block";
    homeBtn.style.display = "block";

    showQuestion();
}

// 問題の表示
function showQuestion() {
    explanationBox.style.display = "none";
    optionsContainer.innerHTML = "";
    
    const q = currentQuestions[currentQuestionIndex];
    document.getElementById("progress").textContent = `問題 ${currentQuestionIndex + 1} / ${currentQuestions.length}`;

    // 連続問題（共通文）の表示処理
    if (q.context) {
        contextBox.style.display = "block";
        contextBox.innerText = q.context;
    } else {
        contextBox.style.display = "none";
    }

    questionText.innerText = q.text;

    // 選択肢の生成
    q.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = option;
        btn.onclick = () => checkAnswer(index, btn);
        optionsContainer.appendChild(btn);
    });
}

// 正誤判定
function checkAnswer(selectedIndex, selectedBtn) {
    // 選択肢を無効化
    const buttons = optionsContainer.querySelectorAll(".option-btn");
    buttons.forEach(btn => btn.disabled = true);

    const q = currentQuestions[currentQuestionIndex];
    const isCorrect = (selectedIndex === q.answer);

    if (isCorrect) {
        score++;
        selectedBtn.classList.add("correct");
        document.getElementById("result-title").textContent = "⭕ 正解！";
        // 正解した問題は、間違えたリストから削除
        wrongQuestionsIds = wrongQuestionsIds.filter(id => id !== q.id);
    } else {
        selectedBtn.classList.add("wrong");
        buttons[q.answer].classList.add("correct"); // 正解をハイライト
        document.getElementById("result-title").textContent = "❌ 不正解...";
        // 間違えたリストに追加（重複防止）
        if (!wrongQuestionsIds.includes(q.id)) {
            wrongQuestionsIds.push(q.id);
        }
    }

    // ローカルストレージを更新
    localStorage.setItem("wrongQuestions", JSON.stringify(wrongQuestionsIds));

    // 解説の表示
    document.getElementById("explanation-text").innerText = q.explanation;
    explanationBox.style.display = "block";
}

// 次の問題へ
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

// 結果画面
function showResult() {
    quizScreen.style.display = "none";
    resultScreen.style.display = "block";
    document.getElementById("score-text").textContent = `正解数: ${score} / ${currentQuestions.length}`;
    updateReviewButton();
}

// ホームに戻る
function showHome() {
    quizScreen.style.display = "none";
    resultScreen.style.display = "none";
    homeScreen.style.display = "block";
    homeBtn.style.display = "none";
    updateReviewButton();
}

// アプリの起動
init();
