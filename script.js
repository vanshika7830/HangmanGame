const wordDisplay = document.getElementById("wordDisplay");
const keyboard = document.getElementById("keyboard");
const wrongCountEl = document.getElementById("wrongCount");
const messageEl = document.getElementById("message");
const newGameBtn = document.getElementById("newGameBtn");
const hangmanDrawing = document.getElementById("hangmanDrawing");

const hintBtn = document.getElementById("hintBtn");
const hintInfo = document.getElementById("hintInfo");
const meaningText = document.getElementById("meaningText");

const confettiBox = document.getElementById("confetti");


let selectedWord = "";
let guessedLetters = [];
let wrongCount = 0;
let maxWrong = 6;

// ✅ Hint points carry forward between games
let hintsLeft = 2;

const hangmanStages = ["🙂", "😐", "😕", "😟", "😨", "😰", "💀"];

// ✅ Sounds
const correctSound = new Audio("assets/sounds/correct.mp3");
const wrongSound = new Audio("assets/sounds/wrong.mp3");
const winSound = new Audio("assets/sounds/win.mp3");
const loseSound = new Audio("assets/sounds/lose.mp3");

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function createKeyboard() {
  keyboard.innerHTML = "";
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const btn = document.createElement("button");
    btn.innerText = letter;

    btn.addEventListener("click", () => handleGuess(letter, btn));
    keyboard.appendChild(btn);
  }
}

function updateWordDisplay() {
  let display = "";
  for (let letter of selectedWord) {
    display += guessedLetters.includes(letter) ? letter + " " : "_ ";
  }
  wordDisplay.innerText = display.trim();
}

function disableKeyboard() {
  const buttons = keyboard.querySelectorAll("button");
  buttons.forEach(btn => (btn.disabled = true));
}

function updateHintUI() {
  hintInfo.innerText = `Hints left: ${hintsLeft}`;
  hintBtn.disabled = hintsLeft <= 0;
}

function disableHints() {
  hintBtn.disabled = true;
}

function handleGuess(letter, btn) {
  btn.disabled = true;

  if (selectedWord.includes(letter)) {
    playSound(correctSound);

    if (!guessedLetters.includes(letter)) guessedLetters.push(letter);
    updateWordDisplay();
    checkWin();
  } else {
    wrongCount++;
    wrongCountEl.innerText = wrongCount;
    hangmanDrawing.innerText = hangmanStages[wrongCount];

    // ✅ Prevent double sound on last wrong
    if (wrongCount >= maxWrong) {
      checkLose(); // plays lose sound
    } else {
      playSound(wrongSound);
      checkLose();
    }
  }
}

function checkWin() {
  const wordArr = selectedWord.split("");
  const isWin = wordArr.every(letter => guessedLetters.includes(letter));

  if (isWin) {
    messageEl.innerText = "🎉 You Win!";
    disableKeyboard();
    disableHints();

    playSound(winSound);
    launchConfetti();


    // ✅ Reward: +1 hint after winning
    hintsLeft++;
    updateHintUI();
  }
}

function checkLose() {
  if (wrongCount >= maxWrong) {
    messageEl.innerText = `💀 You Lost! Word was: ${selectedWord}`;
    disableKeyboard();
    disableHints();

    playSound(loseSound);
  }
}

// ✅ Hint reveals one random hidden letter (costs 1 hint)
function useHint() {
  if (hintsLeft <= 0) return;

  const hiddenLetters = selectedWord
    .split("")
    .filter(letter => !guessedLetters.includes(letter));

  if (hiddenLetters.length === 0) return;

  const randomLetter =
    hiddenLetters[Math.floor(Math.random() * hiddenLetters.length)];

  guessedLetters.push(randomLetter);
  updateWordDisplay();

  // disable that letter button
  const buttons = keyboard.querySelectorAll("button");
  buttons.forEach(btn => {
    if (btn.innerText === randomLetter) btn.disabled = true;
  });

  hintsLeft--;
  updateHintUI();
  checkWin();
}

hintBtn.addEventListener("click", useHint);

// ✅ Meaning is ALWAYS shown (free)
async function fetchMeaning(word) {
  try {
    meaningText.innerText = "Meaning: Loading...";

    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
    );
    const data = await res.json();

    const meaning = data[0]?.meanings?.[0]?.definitions?.[0]?.definition;

    if (!meaning) {
      meaningText.innerText = "Meaning: Not found 😅";
      return;
    }

    meaningText.innerText = `Meaning: ${meaning}`;
  } catch (error) {
    meaningText.innerText = "Meaning: Not found 😅";
  }
}

async function fetchRandomWord() {
  try {
    messageEl.innerText = "Loading word...";

    wrongCount = 0;
    guessedLetters = [];
    wrongCountEl.innerText = wrongCount;
    hangmanDrawing.innerText = hangmanStages[0];

    updateHintUI();

    // reset meaning text
    meaningText.innerText = "Meaning: Loading...";

    const res = await fetch(
      "https://random-word-api.herokuapp.com/word?number=1"
    );
    const data = await res.json();

    selectedWord = data[0].toUpperCase();

    // avoid long words
    if (selectedWord.length > 10) {
      return fetchRandomWord();
    }

    // fetch meaning
    fetchMeaning(selectedWord);

    createKeyboard();
    updateWordDisplay();
    messageEl.innerText = "";
  } catch (error) {
    messageEl.innerText = "⚠️ API error. Try again!";
    console.log(error);
  }
}

newGameBtn.addEventListener("click", fetchRandomWord);

function launchConfetti() {
  confettiBox.innerHTML = "";

  for (let i = 0; i < 80; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti-piece");

    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDuration = (Math.random() * 2 + 2) + "s";
    confetti.style.width = (Math.random() * 8 + 6) + "px";
    confetti.style.height = (Math.random() * 10 + 8) + "px";

    // random color
    confetti.style.background = `hsl(${Math.random() * 360}, 100%, 60%)`;

    confettiBox.appendChild(confetti);
  }

  // remove after 3 seconds
  setTimeout(() => {
    confettiBox.innerHTML = "";
  }, 3000);
}


// Start game
fetchRandomWord();
