// dialogue.js
const captainColor = "#00ffff";

window.handlePlayerResponse = function(input) {
  if (gameState.gameEnded) return;
  const answer = input.trim().toLowerCase();

  if (answer === "yes") {
    show(`<span style="color:${captainColor};"><b>Captain:</b> Thank you, I'll send one of my quietly insane guards round and we'll dissect the cat. You can go about your business now, I don't want to see you again. Ever.</span>`);
    endGame("You upset the captain, and managed to kill a cat on your first day, well done! If you'd like to try again, press enter...");
    return;
  }

  switch (gameState.dialogueStage) {
    case 1:
      show(`<span style="color:${captainColor};"><b>Captain:</b> Don't even try to act innocent with me.  Rory.  Tobias.  Do you have a cat?.</span>`);
      gameState.dialogueStage = 2;
      break;
    case 2:
      show(`<span style="color:${captainColor};"><b>Captain:</b> Not only are you pair so stupid you brings aboard an unquarantined animal and kindise every man and woman on this ship -- not only that -- but you take a photograph of yourselves <i>with</i> the cat and send it to be processed in the ship's lab. Now, I'm going to ask you again, do you have a cat?</span>`);
      gameState.dialogueStage = 3;
      break;
    case 3:
      show(`<span style="color:${captainColor};"><b>Captain:</b> (The captain holds up a photo of Rory, Tobias and Frankenstein the cat) WHERE. IS. THE. CAT! It could be carrying all manner of infections and kill everyone on this ship!</span>`);
      gameState.dialogueStage = 4;
      break;
    case 4:
      show(`<span style="color:${captainColor};"><b>Captain:</b> Right. This is your last chance. If you don't give me the cat so we can cut it up into small pieces and find out whether you tried to genocide my crew or not, you will be placed into a stasis pod for the remainder of our journey back to earth, without pay. So guys. Come on. Let's get all warm and fuzzy and play nice together. Where is the cat?</span>`);
      gameState.dialogueStage = 5;
      break;
    case 5:
  show(`<span style="color:${captainColor};"><b>Captain:</b> That’s it. You’ve had your chances. GUARDS — STASIS POD!</span>`);
  input.disabled = true; // Disable input
  setTimeout(() => {
    input.disabled = false; // Re-enable input
    gameState.currentRoom = "stasis";
    gameState.dialogueMode = false;
    look();
  }, 5000);
  break;
  }
};

function endGame(message) {
  show(`<span style="color:white;">-----------------------------------------------------------------------------------------------------------------------------------</span>`);
  show(`<span class='blinking-yellow'><b>Game Over:</b> ${message}</span>`);
  gameState.gameEnded = true;
  const restartHandler = (e) => {
    if (e.key === "Enter") {
      input.removeEventListener("keydown", restartHandler);
      restartGame();
    }
  };
  input.addEventListener("keydown", restartHandler);
}

function restartGame() {
  gameState = {
    currentRoom: "bridge",
    inventory: [],
    dialogueMode: false,
    dialogueStage: 0,
    gameEnded: false,
    hasEscapedStasis: false
  };
  game.rooms.bridge.buttonUsed = false;
  game.rooms.bridge.exits = {};
  output.innerHTML = "";
  show("<span style='font-size:30px; color:yellow; font-weight:bold;'><u>Welcome Explorers!</u></span>");
  look();
}