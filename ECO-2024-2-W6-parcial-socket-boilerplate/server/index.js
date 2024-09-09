
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express(); 
app.use(express.json()); 
app.use(cors());

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, '../client')));

// Set up the HTTP server
const httpServer = createServer(app);

// WebSocket setup
const io = new Server(httpServer, {
  path: "/real-time",
  cors: {
    origin: "*",
  },
});

const db = {
  players: [],
  roles: {},
  gameStarted: false,
};

function assignRoles() {
  const players = db.players;
  if (players.length < 3) {
    return false;
  }
  const shuffled = players.sort(() => 0.5 - Math.random());
  db.roles = {
    marco: shuffled[0],
    specialPolo: shuffled[1],
    polos: shuffled.slice(2),
  };
  return true;
}

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  socket.on("joinGame", (user) => {
    db.players.push(user);
    io.emit("userJoined", db.players);
  });

  socket.on("startGame", () => {
    if (db.players.length >= 3 && !db.gameStarted) {
      db.gameStarted = assignRoles();
      if (db.gameStarted) {
        io.emit("gameStarted", db.roles);
      }
    }
  });

  socket.on("marcoCalled", () => {
    io.emit("marcoCalled");
  });

  socket.on("poloResponded", (player) => {
    io.emit("poloResponded", player);
  });

  socket.on("marcoSelectsPolo", (selectedPolo) => {
    if (selectedPolo === db.roles.specialPolo) {
      io.emit("gameOver", { winner: db.roles.marco });
      db.gameStarted = false;
      db.players = [];
      db.roles = {};
    } else {
      const oldMarco = db.roles.marco;
      db.roles.marco = selectedPolo;
      db.roles.polos = db.roles.polos.map(p => (p === selectedPolo ? oldMarco : p));
      io.emit("newMarco", { newMarco: selectedPolo, oldMarco });
    }
  });

  socket.on("disconnect", () => {
    db.players = db.players.filter(p => p !== socket.id);
    if (db.players.length < 3 && db.gameStarted) {
      io.emit("gameInterrupted", "Not enough players to continue.");
      db.gameStarted = false;
    }
  });
});

// Ensure that 'register.html' is the first page served when accessing the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/register.html"));
});

// Start the server on port 3000
httpServer.listen(3000, () => {
  console.log("Server running on port 3000");
});
