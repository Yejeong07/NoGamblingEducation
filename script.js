let currentQuestionIndex = 0;
let score = 0;
let timer;

document.getElementById("start-quiz-btn").addEventListener("click", startQuiz);
document.getElementById("info-btn").addEventListener("click", showInfo);
document.getElementById("leaderboard-btn").addEventListener("click", showLeaderboard);

async function loadQuestions() {
  const response = await fetch("questions.json");
  return await response.json();
}

function startQuiz() {
  document.querySelector("main > section:not(.hidden)").classList.add("hidden");
  document.getElementById("quiz-section").classList.remove("hidden");
  loadQuestions().then((questions) => {
    displayQuestion(questions);
  });
}

function displayQuestion(questions) {
  const question = questions[currentQuestionIndex];
  document.getElementById("question-title").innerText = question.question;
  const answersList = document.getElementById("answers-list");
  answersList.innerHTML = "";

  question.answers.forEach((answer, index) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.innerText = answer;
    button.addEventListener("click", () => checkAnswer(index, question.correct, questions));
    li.appendChild(button);
    answersList.appendChild(li);
  });

  startTimer(questions);
}

function checkAnswer(selectedIndex, correctIndex, questions) {
  clearInterval(timer);
  if (selectedIndex === correctIndex) score++;
  nextQuestion(questions);
}

function nextQuestion(questions) {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    displayQuestion(questions);
  } else {
    endQuiz();
  }
}

function endQuiz() {
  document.querySelector("main > section:not(.hidden)").classList.add("hidden");
  document.getElementById("result-section").classList.remove("hidden");
  document.getElementById("score").innerText = score;
}

function startTimer(questions) {
  let timeRemaining = 10;
  document.getElementById("time-remaining").innerText = timeRemaining;
  timer = setInterval(() => {
    timeRemaining--;
    document.getElementById("time-remaining").innerText = timeRemaining;
    if (timeRemaining <= 0) {
      clearInterval(timer);
      nextQuestion(questions);
    }
  }, 1000);
}

function showInfo() {
  document.querySelector("main > section:not(.hidden)").classList.add("hidden");
  document.getElementById("info-section").classList.remove("hidden");
}

function showLeaderboard() {
  document.querySelector("main > section:not(.hidden)").classList.add("hidden");
  document.getElementById("leaderboard-section").classList.remove("hidden");
}