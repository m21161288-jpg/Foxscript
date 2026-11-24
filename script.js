const ideas = [
  "سيناريو هجوم سريع",
  "سيناريو دفاع متوازن",
  "مؤشر تسارع مفاجئ",
  "نقطة تحول مبكرة",
  "نمط تعاوني",
  "خيار احتياطي",
];

const levels = ["مستقر", "متوسط", "مرتفع", "غير مؤكد"];

const generateButton = document.querySelector("#generateButton");
const scenarioTitle = document.querySelector("#scenarioTitle");
const ideaValue = document.querySelector("#ideaValue");
const levelValue = document.querySelector("#levelValue");
const platformScreen = document.querySelector("#platformScreen");
const platformOptions = document.querySelectorAll(".platform-option");
const continueButton = document.querySelector("#continueButton");
const demoUserId = document.querySelector("#demoUserId");
const demoCode = document.querySelector("#demoCode");
const codeError = document.querySelector("#codeError");
const gameTabs = document.querySelectorAll(".game-tab");
const appleGrid = document.querySelector("#appleGrid");
const appleBoxes = document.querySelectorAll(".apple-box");
const menuButton = document.querySelector("#menuButton");
const adminPanel = document.querySelector("#adminPanel");
const adminClose = document.querySelector("#adminClose");
const adminGenerate = document.querySelector("#adminGenerate");
const codeDuration = document.querySelector("#codeDuration");
const codeResult = document.querySelector("#codeResult");
const generatedCode = document.querySelector("#generatedCode");
const copyCode = document.querySelector("#copyCode");
const heroIcon = document.querySelector(".hero-icon");
const codeCountdown = document.querySelector("#codeCountdown");
const countdownValue = document.querySelector("#countdownValue");
const accountCount = document.querySelector("#accountCount");

let selectedPlatform = "";
let selectedGame = "airplane";
const demoCodeState = (() => {
  try {
    return JSON.parse(localStorage.getItem("foxscriptDemoCode")) || null;
  } catch {
    return null;
  }
})();

let activeDemoCode = demoCodeState &&
  demoCodeState.expiresAt > Date.now()
  ? demoCodeState.code
  : null;
let codeExpiryTimer = null;
let countdownTimer = null;

const demoAdminUserHash = "d90274902a39266d63121006f4c884c4527941cb4e5b38dca723901e39e4a197";
const demoAdminCodeHash = "ec735023546e9ee5029b47ffffc7f9fcaa66c8629892001c591a779c6edb342c";

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getCodeAccountCount() {
  try {
    return Number(localStorage.getItem("foxscriptCodeAccountCount")) || 0;
  } catch {
    return 0;
  }
}

function updateCodeAccountCount() {
  accountCount.textContent = String(getCodeAccountCount());
}

updateCodeAccountCount();

if (demoCodeState && !activeDemoCode) {
  localStorage.removeItem("foxscriptDemoCode");
}

function normalizeDemoCode(value) {
  return value.trim().toUpperCase();
}

function startCodeCountdown(expiresAt) {
  window.clearInterval(countdownTimer);
  codeCountdown.hidden = false;

  const updateCountdown = () => {
    const remainingMilliseconds = expiresAt - Date.now();

    if (remainingMilliseconds <= 0) {
      window.clearInterval(countdownTimer);
      codeCountdown.hidden = true;
      countdownValue.textContent = "00:00";
      localStorage.removeItem("foxscriptDemoCode");
      activeDemoCode = null;
      platformScreen.classList.remove("hidden");
      platformScreen.setAttribute("aria-hidden", "false");
      demoCode.value = "";
      demoUserId.value = "";
      updateContinueState();
      codeError.textContent = "انتهت مدة الكود وتم تسجيل الخروج";
      return;
    }

    const totalSeconds = Math.floor(remainingMilliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    countdownValue.textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  updateCountdown();
  countdownTimer = window.setInterval(updateCountdown, 1000);
}

function getActiveDemoCode() {
  const storedCodeState = (() => {
    try {
      return JSON.parse(localStorage.getItem("foxscriptDemoCode")) || null;
    } catch {
      return null;
    }
  })();

  if (!storedCodeState || storedCodeState.expiresAt <= Date.now()) {
    localStorage.removeItem("foxscriptDemoCode");
    activeDemoCode = null;
    return null;
  }

  activeDemoCode = storedCodeState.code;
  return storedCodeState.code;
}

getActiveDemoCode();

if (activeDemoCode) {
  const storedCodeState = JSON.parse(localStorage.getItem("foxscriptDemoCode"));
  codeExpiryTimer = window.setInterval(() => {
    if (storedCodeState.expiresAt > Date.now()) return;

    window.clearInterval(codeExpiryTimer);
    activeDemoCode = null;
    localStorage.removeItem("foxscriptDemoCode");
  }, 1000);
}

function setAdminPanel(open) {
  const isAdminSession = sessionStorage.getItem("foxscriptDemoAdmin") === "true";
  if (open && !isAdminSession) return;
  adminPanel.classList.toggle("open", open);
  adminPanel.setAttribute("aria-hidden", String(!open));
  menuButton.setAttribute("aria-expanded", String(open));
}

menuButton.addEventListener("click", () => {
  if (sessionStorage.getItem("foxscriptDemoAdmin") !== "true") {
    setAdminPanel(false);
    return;
  }
  setAdminPanel(!adminPanel.classList.contains("open"));
});

adminClose.addEventListener("click", () => setAdminPanel(false));

adminGenerate.addEventListener("click", () => {
  if (sessionStorage.getItem("foxscriptDemoAdmin") !== "true") {
    setAdminPanel(false);
    return;
  }

  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 8; index += 1) {
    code += characters[Math.floor(Math.random() * characters.length)];
  }

  const durationMinutes = Number(codeDuration.value);
  generatedCode.textContent = code;
  codeResult.hidden = false;
  codeResult.dataset.duration = `${durationMinutes} دقيقة`;
  activeDemoCode = code;
  localStorage.setItem("foxscriptDemoCode", JSON.stringify({
    code,
    expiresAt: Date.now() + durationMinutes * 60 * 1000,
  }));

  window.clearInterval(codeExpiryTimer);
  const expiresAt = Date.now() + durationMinutes * 60 * 1000;
  codeExpiryTimer = window.setInterval(() => {
    if (Date.now() < expiresAt) return;

    window.clearInterval(codeExpiryTimer);
    activeDemoCode = null;
    localStorage.removeItem("foxscriptDemoCode");
    codeResult.hidden = true;
  }, 1000);
});

copyCode.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.textContent);
    copyCode.textContent = "تم النسخ";
    window.setTimeout(() => {
      copyCode.textContent = "نسخ";
    }, 1200);
  } catch {
    copyCode.textContent = "فشل النسخ";
  }
});

function updateContinueState() {
  continueButton.disabled = !selectedPlatform ||
    demoUserId.value.trim().length === 0 ||
    demoCode.value.trim().length === 0;
}

platformOptions.forEach((option) => {
  option.addEventListener("click", () => {
    platformOptions.forEach((item) => {
      item.classList.remove("selected");
      item.setAttribute("aria-checked", "false");
    });

    option.classList.add("selected");
    option.setAttribute("aria-checked", "true");
    selectedPlatform = option.dataset.platform;
    updateContinueState();
  });
});

demoUserId.addEventListener("input", updateContinueState);
demoCode.addEventListener("input", () => {
  demoCode.classList.remove("invalid");
  codeError.textContent = "";
  updateContinueState();
});

continueButton.addEventListener("click", async () => {
  if (!selectedPlatform) return;
  const enteredUserHash = await sha256(demoUserId.value.trim());
  const enteredCodeHash = await sha256(normalizeDemoCode(demoCode.value));
  const isDemoAdmin = enteredUserHash === demoAdminUserHash &&
    enteredCodeHash === demoAdminCodeHash;
  const currentDemoCode = getActiveDemoCode();
  const hasValidDemoCode = Boolean(currentDemoCode) &&
    normalizeDemoCode(demoCode.value) === normalizeDemoCode(currentDemoCode);

  if (!isDemoAdmin && !hasValidDemoCode) {
    demoCode.classList.add("invalid");
    codeError.textContent = "الكود غير صحيح أو انتهت صلاحيته";
    return;
  }

  platformScreen.classList.add("hidden");
  platformScreen.setAttribute("aria-hidden", "true");
  sessionStorage.setItem("foxscriptPlatform", selectedPlatform);
  sessionStorage.setItem("foxscriptDemoAdmin", String(isDemoAdmin));

  if (!isDemoAdmin && currentDemoCode) {
    const activeCodeState = (() => {
      try {
        return JSON.parse(localStorage.getItem("foxscriptDemoCode"));
      } catch {
        return null;
      }
    })();

    if (activeCodeState) {
      startCodeCountdown(activeCodeState.expiresAt);

      const loginKey = `${normalizeDemoCode(currentDemoCode)}:${demoUserId.value.trim()}`;
      const loggedAccounts = (() => {
        try {
          return JSON.parse(localStorage.getItem("foxscriptCodeLogins")) || [];
        } catch {
          return [];
        }
      })();

      if (!loggedAccounts.includes(loginKey)) {
        loggedAccounts.push(loginKey);
        localStorage.setItem("foxscriptCodeLogins", JSON.stringify(loggedAccounts));
        localStorage.setItem("foxscriptCodeAccountCount", String(loggedAccounts.length));
        updateCodeAccountCount();
      }
    }
  }

  if (isDemoAdmin) {
    setAdminPanel(true);
  }
});

gameTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    gameTabs.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });

    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    selectedGame = tab.dataset.game;
    scenarioTitle.textContent = tab.dataset.game === "airplane"
      ? "توقع الطيارة"
      : "توقع التفاحة";
    heroIcon.innerHTML = tab.dataset.game === "airplane"
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 16l8-3V7l2-2 2 2v6l8 3v2l-8-2-2 4-2-4-8 2v-2Z"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8c-2-2-5-1-6 2-2 5 2 10 6 10s8-5 6-10c-1-3-4-4-6-2Zm0 0V5m0 0c1-2 3-2 4-1-1 2-2 2-4 1Z"/></svg>';
    appleGrid.hidden = tab.dataset.game !== "apple";
    appleBoxes.forEach((box) => box.classList.remove("selected"));
    ideaValue.textContent = "—";
    levelValue.textContent = "—";
  });
});

appleBoxes.forEach((box) => {
  box.addEventListener("click", () => {
    appleBoxes.forEach((item) => item.classList.remove("selected"));
    box.classList.add("selected");
    ideaValue.textContent = `المربع ${box.dataset.box}`;
  });
});

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

generateButton.addEventListener("click", () => {
  generateButton.classList.add("loading");
  generateButton.disabled = true;

  window.setTimeout(() => {
    const airplaneResults = ["1.20x", "1.45x", "1.80x", "2.10x", "غير مؤكد"];
    let idea;

    if (selectedGame === "airplane") {
      idea = randomItem(airplaneResults);
      appleBoxes.forEach((box) => box.classList.remove("selected"));
    } else {
      const selectedBox = randomItem([...appleBoxes]);
      appleBoxes.forEach((box) => box.classList.remove("selected"));
      selectedBox.classList.add("selected");
      idea = `المربع ${selectedBox.dataset.box}`;
    }

    const level = randomItem(levels);

    scenarioTitle.textContent = selectedGame === "airplane"
      ? "توقع الطيارة العشوائي"
      : "توقع التفاحة العشوائي";
    ideaValue.textContent = idea;
    levelValue.textContent = level;

    generateButton.classList.remove("loading");
    generateButton.disabled = false;
  }, 500);
});