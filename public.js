const socket = io();

document.getElementById("joinButton").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const room = document.getElementById("room").value;

  if (username && room) {
    socket.emit("joinRoom", { room, username });
    document.getElementById("joinRoom").style.display = "none";
    document.getElementById("quizRoom").style.display = "block";
    document.getElementById("roomName").textContent = room;
  }
});

socket.on("joinedRoom", ({ room, players }) => {
  const playersDiv = document.getElementById("players");
  playersDiv.innerHTML = players.map((p) => `<p>${p.username}</p>`).join("");
});

document.getElementById("startQuizButton").addEventListener("click", () => {
  const room = document.getElementById("room").value;
  socket.emit("startQuiz", room);
});

socket.on("quizStart", (questions) => {
  let currentQuestion = 0;
  const quizDiv = document.getElementById("quiz");
  const questionDiv = document.getElementById("question");
  const optionsDiv = document.getElementById("options");

  quizDiv.style.display = "block";

  const loadQuestion = () => {
    const question = questions[currentQuestion];
    questionDiv.textContent = question.question;
    optionsDiv.innerHTML = question.options
      .map(
        (opt, i) =>
          `<button class="option" data-index="${i}">${opt}</button>`
      )
      .join("");

    document.querySelectorAll(".option").forEach((button) => {
      button.addEventListener("click", () => {
        const score = button.dataset.index == question.correct ? 10 : 0;
        socket.emit("submitAnswer", {
          room: document.getElementById("room").value,
          username: document.getElementById("username").value,
          score,
        });
      });
    });
  };

  loadQuestion();

  document.getElementById("nextQuestion").addEventListener("click", () => {
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      loadQuestion();
    } else {
      quizDiv.innerHTML = "<h2>Quiz Completed!</h2>";
    }
  });
});

socket.on("scoreUpdate", (scores) => {
  const playersDiv = document.getElementById("players");
  playersDiv.innerHTML = Object.keys(scores)
    .map((player) => `<p>${player}: ${scores[player]}</p>`)
    .join("");
});