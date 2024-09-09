
let socket = io("http://localhost:3000");

document.getElementById("join-button").addEventListener("click", () => {
  const playerName = document.getElementById("username").value;
  if (playerName) {
    // Register player and navigate to the start screen
    socket.emit("joinGame", playerName);
    window.location.href = "start.html";
  }
});
