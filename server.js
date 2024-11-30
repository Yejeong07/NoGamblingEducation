const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const admin = require("firebase-admin");

// Firebase 초기화
const serviceAccount = require("./firebase-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-firebase-project.firebaseio.com",
});
const db = admin.firestore();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let activeRooms = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // 방 참여
  socket.on("joinRoom", ({ room, username }) => {
    socket.join(room);
    if (!activeRooms[room]) {
      activeRooms[room] = { players: [], scores: {}, questions: [] };
    }
    activeRooms[room].players.push({ id: socket.id, username });

    socket.emit("joinedRoom", { room, players: activeRooms[room].players });
    io.to(room).emit("playerUpdate", activeRooms[room].players);
  });

  // 퀴즈 시작
  socket.on("startQuiz", async (room) => {
    const questionsSnapshot = await db.collection("questions").get();
    const questions = questionsSnapshot.docs.map((doc) => doc.data());
    activeRooms[room].questions = questions;

    io.to(room).emit("quizStart", questions);
  });

  // 점수 업데이트
  socket.on("submitAnswer", ({ room, username, score }) => {
    if (!activeRooms[room].scores[username]) {
      activeRooms[room].scores[username] = 0;
    }
    activeRooms[room].scores[username] += score;

    io.to(room).emit("scoreUpdate", activeRooms[room].scores);
  });

  // 사용자 연결 해제
  socket.on("disconnect", () => {
    for (let room in activeRooms) {
      activeRooms[room].players = activeRooms[room].players.filter(
        (player) => player.id !== socket.id
      );
      io.to(room).emit("playerUpdate", activeRooms[room].players);
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});