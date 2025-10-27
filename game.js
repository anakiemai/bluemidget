// game.js — UPDATED TO BLOCK INPUT DURING DELAY
const output = document.getElementById("output");
const input = document.getElementById("input");
const captainColor = "#00ffff";

let gameState = {
  currentRoom: "bridge",
  inventory: [],
  dialogueMode: false,
  dialogueStage: 0,
  gameEnded: false,
  hasEscapedStasis: false,
  isDialogueLocked: false // New flag to lock input during delay
};

function show(text) {
  const isFirst = output.innerHTML.trim() === "";
  const prefix = isFirst ? "" : "<br><br>";
  output.innerHTML += prefix + text;
  output.scrollTop = output.scrollHeight;
}

function look() {
  const room = game.rooms[gameState.currentRoom];
  if (!room) {
    show("<span style='color:red;'>ERROR: Room missing!</span>");
    return;
  }
  let text = (gameState.hasEscapedStasis && room.returnDesc) ? room.returnDesc : room.desc;
  text = text.replace(/\n/g, "<br>");
  if (room.items?.length > 0) {
    const items = room.items.map(i => (/^[aeiou]/i.test(i) ? "an " : "a ") + i);
    text += "<br>You can see: " + items.join(", ");
  }
  show(text);
}

function move(direction) {
  const room = game.rooms[gameState.currentRoom];
  if (room.exits[direction]) {
    gameState.currentRoom = room.exits[direction];
    look();
    if (gameState.currentRoom === "captain") {
      gameState.dialogueMode = true;
      gameState.dialogueStage = 1;
      show(`<span style="color:${captainColor};"><b>Captain:</b> Rory and Tobias. Again. Don't try looking at me with the fakest looks of surprise I've ever seen. I<em> know</em> what you did.</span>`);
    }
  } else {
    const responses = [
      "That is a wonderful idea. Except you try to do that and a warp star from 13,000 light years in the future snaps you back to reality. You can't go that way.",
      "I can't let you do that Dave.",
      "You can hear a mysterious whisper: 'Nah, you don't want to go that way, Spud.'",
      "No matter how hard you try your feet seem determined to stop you from going that way.",
      "Sorry travellers, you are unable to get your limbs to go that way."
    ];
    show(responses[Math.floor(Math.random() * responses.length)]);
  }
}

function take(item) {
  const room = game.rooms[gameState.currentRoom];
  const i = room.items.indexOf(item);
  if (i !== -1) {
    gameState.inventory.push(item);
    room.items.splice(i, 1);
    show("Taken.");
  } else {
    show("Not here.");
  }
}

function drop(item) {
  const i = gameState.inventory.indexOf(item);
  if (i !== -1) {
    gameState.inventory.splice(i, 1);
    game.rooms[gameState.currentRoom].items.push(item);
    show("Dropped.");
  } else {
    show("You don't have it.");
  }
}

function inventory() {
  show(gameState.inventory.length === 0 ? "Nothing." : "Carrying: " + gameState.inventory.join(", "));
}

function handlePlayerResponse(input) {
  if (gameState.gameEnded || gameState.isDialogueLocked) return; // Ignore input if locked
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
      gameState.dialogueMode = false; // Disable dialogue mode immediately
      gameState.isDialogueLocked = true; // Lock input
      input.disabled = true; // Disable input field
      console.log("Input disabled:", input.disabled); // Debug
      setTimeout(() => {
        input.disabled = false; // Re-enable input
        gameState.isDialogueLocked = false; // Unlock input
        console.log("Input re-enabled:", input.disabled); // Debug
        gameState.currentRoom = "stasis";
         look();
      }, 5000);
      break;
  }
}

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
    hasEscapedStasis: false,
    isDialogueLocked: false
  };
  game.rooms.bridge.buttonUsed = false;
  game.rooms.bridge.exits = {};
  output.innerHTML = "";
  show("<span style='font-size:30px; color:yellow; font-weight:bold;'><u>Welcome Explorers!</u></span>");
  look();
}

function handleCommand(cmd) {
  if (gameState.isDialogueLocked) {
    console.log("Input ignored during dialogue lock"); // Debug
    return; // Ignore commands during lock
  }
  const words = cmd.trim().toLowerCase().split(" ");
  const verb = words[0];
  const arg = words.slice(1).join(" ");

  if (["north", "south", "east", "west"].includes(verb) && words.length === 1) {
    show("Come on now, this is English.  Verbs are beautiful things.  How would you feel if I just said: 'Toast' or 'Tennis Racket.'");
    return;
  }

  if (["hello", "hello?"].includes(verb) && words.length === 1) {
    show("I love that you want to pass the time of day with me, but really?  Hello yerself.");
    return;
  }

  if (gameState.dialogueMode) {
    handlePlayerResponse(cmd);
    return;
  }

  const whatNowPatterns = [
    /what now\??/i,
    /what do (we|i) do now\??/i,
    /i don't know what to do/i,
    /we don't know what to do/i,
    /what should (we|i) do\??/i
  ];

  if (whatNowPatterns.some(pattern => pattern.test(cmd.trim()))) {
    show("Really?  You have one job.  Read the instructions and think creatively. Okay that's 2 jobs. I'm still not helping you though.");
    return;
  }

  switch (verb) {
    case "look":
      look();
      break;

    case "go":
      if (gameState.currentRoom === "bridge" && arg === "south") {
        const bridge = game.rooms.bridge;
        if (bridge.buttonUsed) {
          gameState.currentRoom = "captain";
          look();
          gameState.dialogueMode = true;
          gameState.dialogueStage = 1;
          show(`<span style="color:${captainColor};"><b>Captain:</b> Rory and Tobias. Again. Don't try looking at me with the fakest looks of surprise I've ever seen. I<em> know</em> what you did.</span>`);
        } else {
          show("There's a red button here.  Do you not see it?  Shall I lend you some glasses?");
        }
      } else {
        move(arg);
      }
      break;

    case "use":
    case "press":
      if (gameState.currentRoom === "bridge" && /button|it/i.test(arg)) {
        const bridge = game.rooms.bridge;
        if (!bridge.buttonUsed) {
          bridge.buttonUsed = true;
          bridge.exits.south = "captain";
          show("You press the red button.  *Bzzsshtzzshhzzzz*  The door opens reluctantly and then coughs.");
        } else {
          show("It's already open.");
        }
      } else if (gameState.currentRoom === "stasis" && /emergency|button|it/i.test(arg)) {
        show("*BZZT* Pod opens. You escape!");
        gameState.currentRoom = "stasisChamber";
        gameState.hasEscapedStasis = true;
        look();
      } else {
        show("Can't use that.");
      }
      break;

    case "take":
      take(arg);
      break;

    case "drop":
      drop(arg);
      break;

    case "inventory":
    case "i":
      inventory();
      break;

    case "help":
      show("look, go [dir], press [item], take [item], drop [item], inventory");
      break;

    default: {
      const responses = [
        "Well that didn’t work chaps.",
        "I love that you're being creative, but this is not AI, so don't get too excited. I don't have limitless understanding.  Unlike Grandad of course.",
        "No no no no no no no.",
        "What are you blithering about?"
      ];
      show(responses[Math.floor(Math.random() * responses.length)]);
      break;
    }
  }
}

input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const cmd = input.value.trim();
    if (cmd) {
      show(`<span style="color:#88ff88;">> ${cmd}</span>`);
      handleCommand(cmd);
    }
    input.value = "";
  }
});

// Debug input state on load
console.log("Initial input disabled state:", input.disabled);
console.log("Input elements:", document.querySelectorAll("input").length);
console.log("Elements with id='input':", document.querySelectorAll("#input").length);

show("<span style='font-size:30px; color:yellow; font-weight:bold;'><u>Welcome Explorers!</u></span>");
if (game.rooms && game.rooms.bridge) {
  look();
} else {
  show("<span style='color:red;'>ERROR: rooms/bridge.js failed to load.</span>");
}