
let socket = io("http://localhost:3000");

socket.on("gameStarted", (roles) => {
  const { marco, specialPolo, polos } = roles;
  document.getElementById("game-status").textContent = `Game started! Marco is ${marco}.`;
  const role = marco === socket.id ? "Marco" : (specialPolo === socket.id ? "Special Polo" : "Polo");
  document.getElementById("role").textContent = `You are: ${role}`;

  // Show the appropriate button based on the player's role
  if (role === "Marco") {
    document.getElementById("marco-button").style.display = "block";
  } else {
    document.getElementById("polo-button").style.display = "block";
  }
});

document.getElementById("marco-button").addEventListener("click", () => {
  // Marco calls "Marco!"
  socket.emit("marcoCalled");
});

document.getElementById("polo-button").addEventListener("click", () => {
  // Polo responds "Polo!"
  socket.emit("poloResponded", socket.id);
});

socket.on("marcoCalled", () => {
  document.getElementById("game-status").textContent = "Marco has called!";
});

socket.on("poloResponded", (player) => {
  document.getElementById("game-status").textContent += ` ${player} has responded!`;
});

socket.on("newMarco", ({ newMarco, oldMarco }) => {
  document.getElementById("game-status").textContent = `${oldMarco} selected ${newMarco} as the new Marco!`;
});

socket.on("gameOver", ({ winner }) => {
  document.getElementById("game-status").textContent = `Game over! The winner is ${winner}`;
});
