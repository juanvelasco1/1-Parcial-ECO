
let socket = io("http://localhost:3000");

document.getElementById("start-button").addEventListener("click", () => {
  // Start the game once there are enough players
  socket.emit("startGame");
});

socket.on("userJoined", (players) => {
  // Update the list of players
  document.getElementById("players-list").innerHTML = players.map(player => `<li>${player}</li>`).join('');
});

socket.on("gameStarted", (roles) => {
  // Navigate to the gameplay screen when the game starts
  window.location.href = "gameplay.html";
});
