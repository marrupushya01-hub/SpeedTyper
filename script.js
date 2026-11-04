const passageBank = {
  easy: [
    "The quick brown fox jumps over the lazy dog. Practice makes progress, so keep typing every day. Small steps today will turn into big results tomorrow, and soon typing will feel easy.",
    "Coding is a skill that grows with every small project. Start with something simple, fix what breaks, and learn from each mistake. Before you know it, you will be building things you once thought were hard.",
    "A journey of a thousand miles begins with a single step. Keep your eyes on the screen, relax your hands, and let the words flow. Speed comes naturally when you stay calm and focused.",
    "Every morning the city wakes up slowly. People walk to work with warm cups of tea, and the sound of buses fills the street. It is a simple day, but it feels full of possibility.",
    "Good habits are built one day at a time. Drink some water, take a short walk, and spend a little time learning something new. Over many weeks these tiny choices change your whole life."
  ],
  medium: [
    "Artificial intelligence is changing the way we build software. Developers now use machine learning models to write tests, find bugs, and summarize long documents, but good engineers still need to understand the fundamentals, because tools are only as useful as the person guiding them.",
    "A good algorithm is not just fast; it is also clear. When you name your variables well, break large problems into small functions, and write comments that explain why instead of what, your future self will thank you every time you open the file.",
    "Open source is a community built on curiosity and generosity. Anyone can read the code, report an issue, or submit a fix, and every contribution, however small, helps thousands of people who will never know your name.",
    "Hackathons teach you more in thirty-six hours than a month of lectures. You pick a problem, split the work, argue about the design, ship a rough demo at sunrise, and discover that teamwork matters more than any single clever idea.",
    "The internet runs on a simple idea: computers agree on rules for talking to each other. When you load a web page, your browser sends a request, a server finds the right files, and the response travels back across the world in a fraction of a second."
  ],
  hard: [
    "In 2024, the API returned 3,482 records in just 0.87 seconds; however, 12% of requests failed with HTTP 503 errors. The team added retries (max: 5), exponential back-off, and a cache with a 15-minute TTL to fix it.",
    "const total = items.filter((x) => x.price > 100).map((x) => x.price * 1.18).reduce((a, b) => a + b, 0); console.log(`Total: $${total}`);",
    "\"Don't panic!\" she said, staring at the screen; the build had failed 7 times since 9:45 a.m. Yet, step by step, they traced the bug to a missing semicolon, a stale cache, and one very misleading error message.",
    "Photosynthesis converts carbon dioxide (CO2) and water (H2O) into glucose and oxygen using sunlight; roughly 70% of the oxygen we breathe comes from oceanic plankton, not rainforests, which surprises almost everyone.",
    "Email me at hello@example.com by 5:30 PM on Friday, 14 March - or call +91 98765 43210 - and mention order #A-2045; the total, including 18% GST, comes to $1,249.50 (non-refundable)."
  ]
};
 

const timeLimit = 60;           
const MIN_SECONDS_FOR_BEST = 5;
const MIN_ACCURACY_FOR_BEST = 85;
const bestKeyPrefix = "speedTyperBestWpm_";
const difficultyKey = "speedTyperDifficulty";
 

const passageDiv = document.getElementById("passage");
const inputBox = document.getElementById("input");
const restartBtn = document.getElementById("restart");
const timeDisplay = document.getElementById("time");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const bestDisplay = document.getElementById("best-score");
 

let difficultySelect = document.getElementById("difficulty");
if (!difficultySelect) {
  const wrap = document.createElement("div");
  wrap.className = "difficulty";
  wrap.innerHTML =
    'Difficulty: <select id="difficulty">' +
    '<option value="easy">Easy</option>' +
    '<option value="medium">Medium</option>' +
    '<option value="hard">Hard</option>' +
    "</select>";
  const stats = document.querySelector(".stats");
  stats.parentNode.insertBefore(wrap, stats);
  difficultySelect = wrap.querySelector("select");
}
 

let errorsDisplay = document.getElementById("errors");
if (!errorsDisplay) {
  const p = document.createElement("p");
  p.innerHTML = 'Errors: <span id="errors">0</span>';
  document.querySelector(".stats").appendChild(p);
  errorsDisplay = p.querySelector("#errors");
}
 

let resultDiv = document.getElementById("result");
if (!resultDiv) {
  resultDiv = document.createElement("div");
  resultDiv.id = "result";
  restartBtn.parentNode.insertBefore(resultDiv, restartBtn);
}
 

let difficulty = "medium";
let currentPassage = "";
let lastPassage = "";
let timerId = null;
let timerStarted = false;
let testEnded = false;
let startTime = 0;
let correctChars = 0;
let totalKeystrokes = 0;
let mistakeKeystrokes = 0;
let prevLength = 0;
 
function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}
 
function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
   
  }
}
 
function getBestScore() {
  const saved = safeGet(bestKeyPrefix + difficulty);
  return saved === null ? 0 : Number(saved) || 0;
}
 
function showBestScore() {
  bestDisplay.textContent = getBestScore();
}
 
// ---------- Passage ----------
function getRandomPassage() {
  const list = passageBank[difficulty];
  let text = list[Math.floor(Math.random() * list.length)];
  // same passage lagataar repeat na ho
  if (list.length > 1) {
    while (text === lastPassage) {
      text = list[Math.floor(Math.random() * list.length)];
    }
  }
  lastPassage = text;
  return text;
}
 
function renderPassage(text) {
  passageDiv.innerHTML = "";
  text.split("").forEach((char) => {
    const span = document.createElement("span");
    span.textContent = char;
    passageDiv.appendChild(span);
  });
  const first = passageDiv.querySelector("span");
  if (first) first.classList.add("current");
}
 

function getElapsedSeconds() {
  if (!timerStarted) return 0;
  return Math.min((Date.now() - startTime) / 1000, timeLimit);
}
 
function calcAccuracy() {
  if (totalKeystrokes === 0) return 100;
  return Math.round(((totalKeystrokes - mistakeKeystrokes) / totalKeystrokes) * 100);
}
 
function updateStats() {
  const elapsed = getElapsedSeconds();
  let wpm = 0;
 
  
  if (elapsed >= 1) {
    wpm = Math.round(correctChars / 5 / (elapsed / 60));
  }
 
  wpmDisplay.textContent = wpm;
  accuracyDisplay.textContent = calcAccuracy();
  errorsDisplay.textContent = mistakeKeystrokes;
  timeDisplay.textContent = Math.max(0, Math.ceil(timeLimit - elapsed));
}
 
function startTimer() {
  startTime = Date.now();
  timerId = setInterval(function () {
    updateStats();
    if (getElapsedSeconds() >= timeLimit) {
      endTest();
    }
  }, 200);
}
 
function endTest() {
  if (testEnded) return; 
  testEnded = true;
 
  clearInterval(timerId);
  inputBox.disabled = true;
  updateStats();
 
  const elapsed = getElapsedSeconds();
  const finalWpm = Number(wpmDisplay.textContent);
  const accuracy = calcAccuracy();
 
  let message = "Done! " + finalWpm + " WPM, " + accuracy + "% accuracy.";
 
  if (elapsed < MIN_SECONDS_FOR_BEST || accuracy < MIN_ACCURACY_FOR_BEST) {
    message += " (Best score ke liye min " + MIN_SECONDS_FOR_BEST + "s aur " + MIN_ACCURACY_FOR_BEST + "% accuracy chahiye.)";
  } else if (finalWpm > getBestScore()) {
    safeSet(bestKeyPrefix + difficulty, finalWpm);
    showBestScore();
    message += " New best for " + difficulty + "!";
  }
 
  resultDiv.textContent = message;
}
 

function checkTyping() {
  if (testEnded) return;
 
  if (!timerStarted) {
    timerStarted = true;
    startTimer();
  }
 
  const typed = inputBox.value;
 
  
  if (typed.length > prevLength) {
    for (let i = prevLength; i < typed.length; i++) {
      totalKeystrokes++;
      if (typed[i] !== currentPassage[i]) mistakeKeystrokes++;
    }
  }
  prevLength = typed.length;
 
  const spans = passageDiv.querySelectorAll("span");
  correctChars = 0;
 
  spans.forEach((span, index) => {
    const typedChar = typed[index];
    span.classList.remove("correct", "incorrect", "current");
 
    if (typedChar === undefined) {
      if (index === typed.length) span.classList.add("current");
      return;
    }
    if (typedChar === span.textContent) {
      span.classList.add("correct");
      correctChars++;
    } else {
      span.classList.add("incorrect");
    }
  });
 
  updateStats();
 
  if (typed.length >= currentPassage.length) {
    endTest();
  }
}
 

function resetTest() {
  clearInterval(timerId);
  timerStarted = false;
  testEnded = false;
  startTime = 0;
  correctChars = 0;
  totalKeystrokes = 0;
  mistakeKeystrokes = 0;
  prevLength = 0;
 
  timeDisplay.textContent = timeLimit;
  wpmDisplay.textContent = 0;
  accuracyDisplay.textContent = 100;
  errorsDisplay.textContent = 0;
  resultDiv.textContent = "";
 
  currentPassage = getRandomPassage();
  renderPassage(currentPassage);
  showBestScore();
 
  inputBox.value = "";
  inputBox.maxLength = currentPassage.length;
  inputBox.disabled = false;
  inputBox.focus();
}
 

inputBox.addEventListener("input", checkTyping);
 

["paste", "drop", "cut"].forEach((evt) => {
  inputBox.addEventListener(evt, (e) => e.preventDefault());
});
 
restartBtn.addEventListener("click", resetTest);
 
difficultySelect.addEventListener("change", function () {
  difficulty = difficultySelect.value;
  safeSet(difficultyKey, difficulty);
  resetTest();
});
 

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") resetTest();
});
 

const savedDifficulty = safeGet(difficultyKey);
if (savedDifficulty && passageBank[savedDifficulty]) {
  difficulty = savedDifficulty;
}
difficultySelect.value = difficulty;
resetTest();