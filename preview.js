
function setupProfileMenuDismiss() {
  document.addEventListener("click", (e) => {
    const openMenu = document.querySelector(".profile-menu[open]");
    if (!openMenu) return;
    if (!openMenu.contains(e.target)) {
      openMenu.removeAttribute("open");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".profile-menu[open]").forEach((m) => {
        m.removeAttribute("open");
      });
    }
  });
}const tests = [
  {
    id: 41,
    title: "41-test",
    description: "Testda qatnashish bepul",
    questions: [
      { text: "2 + 4 = ?", a: "4", b: "5", c: "6", d: "7", correct: "c" },
      { text: "3 + 4 = ?", a: "5", b: "6", c: "7", d: "8", correct: "c" },
      { text: "12 - 5 = ?", a: "6", b: "7", c: "8", d: "9", correct: "b" }
    ]
  },
  {
    id: 42,
    title: "42-test",
    description: "Testda qatnashish bepul",
    questions: [
      { text: "5 * 3 = ?", a: "8", b: "10", c: "15", d: "20", correct: "c" },
      { text: "10 / 2 = ?", a: "3", b: "5", c: "6", d: "7", correct: "b" }
    ]
  }
];

const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearch");
const testsGrid = document.getElementById("testsGrid");
const testPanel = document.getElementById("testPanel");
const emptyText = document.getElementById("emptyText");

const profileInitials = document.getElementById("profileInitials");
const guestProfile = document.getElementById("guestProfile");
const userProfile = document.getElementById("userProfile");
const pfFirst = document.getElementById("pfFirst");
const pfLast = document.getElementById("pfLast");
const pfRegion = document.getElementById("pfRegion");
const pfTg = document.getElementById("pfTg");
const editProfileBtn = document.getElementById("editProfileBtn");

let submittedTests = new Set();

function getQueryProfile() {
  const params = new URLSearchParams(window.location.search);
  const firstName = (params.get("first_name") || "").trim();
  const lastName = (params.get("last_name") || "").trim();
  const region = (params.get("region") || "").trim();
  const telegramId = (params.get("tg_id") || "").trim();

  if (!firstName || !lastName) return null;
  return { firstName, lastName, region, telegramId };
}

function loadProfile() {
  const fromQuery = getQueryProfile();
  if (fromQuery) {
    localStorage.setItem("prime_profile", JSON.stringify(fromQuery));
    return fromQuery;
  }

  try {
    const raw = localStorage.getItem("prime_profile");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.firstName || !data.lastName) return null;
    return data;
  } catch {
    return null;
  }
}

function saveProfile(profile) {
  localStorage.setItem("prime_profile", JSON.stringify(profile));
}

function showProfile(profile) {
  if (!profile) {
    profileInitials.textContent = "IN";
    guestProfile.classList.remove("hidden");
    userProfile.classList.add("hidden");
    return;
  }

  const initials = `${profile.firstName[0] || ""}${profile.lastName[0] || ""}`.toUpperCase();
  profileInitials.textContent = initials || "IN";
  pfFirst.textContent = profile.firstName;
  pfLast.textContent = profile.lastName;
  pfRegion.textContent = profile.region || "-";
  pfTg.textContent = profile.telegramId || "-";

  guestProfile.classList.add("hidden");
  userProfile.classList.remove("hidden");
}

function wireProfileEditor() {
  editProfileBtn.addEventListener("click", () => {
    const current = loadProfile();
    if (!current) return;

    const firstName = (prompt("Yangi ismingiz:", current.firstName) || "").trim();
    if (firstName.length < 2) {
      alert("Ism kamida 2 ta harf bo'lishi kerak.");
      return;
    }

    const lastName = (prompt("Yangi familiyangiz:", current.lastName) || "").trim();
    if (lastName.length < 2) {
      alert("Familiya kamida 2 ta harf bo'lishi kerak.");
      return;
    }

    const region = (prompt("Yangi viloyat:", current.region || "") || "").trim();
    if (region.length < 2) {
      alert("Viloyat kamida 2 ta harf bo'lishi kerak.");
      return;
    }

    const next = {
      firstName,
      lastName,
      region,
      telegramId: current.telegramId || ""
    };

    saveProfile(next);
    showProfile(next);
    alert("Profil ma'lumoti yangilandi.");
  });
}

function renderTests(list) {
  testsGrid.innerHTML = "";

  list.forEach((t) => {
    const card = document.createElement("article");
    card.className = "test-card fade-in";

    const done = submittedTests.has(t.id);
    card.innerHTML = `
      <span class="badge">${done ? "Topshirildi" : "Yangi test"}</span>
      <h3>${t.title}</h3>
      <p>${t.description}</p>
      <button class="btn ${done ? "btn-soft" : "btn-primary"}" type="button" ${done ? "disabled" : ""}>
        ${done ? "Qayta topshirib bo'lmaydi" : "Testni ochish"}
      </button>
    `;

    const btn = card.querySelector("button");
    if (!done) {
      btn.addEventListener("click", () => openTest(t));
    }

    testsGrid.appendChild(card);
  });

  emptyText.classList.toggle("hidden", list.length > 0);
}

function openTest(test) {
  testPanel.classList.remove("hidden");
  testPanel.classList.add("fade-in");

  const questionsHtml = test.questions
    .map((q, i) => {
      return `
        <article class="question" data-correct="${q.correct}">
          <h3>${i + 1}-savol: ${q.text}</h3>
          ${["a", "b", "c", "d"]
            .map(
              (key) => `
                <label class="option">
                  <input type="radio" name="q_${i}" value="${key}" />
                  <span class="dot"></span>
                  <span>${q[key]}</span>
                </label>
              `
            )
            .join("")}
        </article>
      `;
    })
    .join("");

  testPanel.innerHTML = `
    <div class="row-between">
      <h2>${test.title}</h2>
      <span class="badge">Bir martalik topshirish</span>
    </div>

    <form id="quizForm" class="quiz-form">
      ${questionsHtml}
      <div class="actions">
        <button type="submit" class="btn btn-primary">Javoblarni tekshirish</button>
        <button type="button" id="closeTest" class="btn btn-soft">Yopish</button>
      </div>
    </form>

    <div id="resultBox" class="result-box hidden"></div>
  `;

  const quizForm = document.getElementById("quizForm");
  const closeBtn = document.getElementById("closeTest");
  const resultBox = document.getElementById("resultBox");

  quizForm.addEventListener("change", (e) => {
    const t = e.target;
    if (t.type !== "radio") return;
    document.querySelectorAll(`input[name="${t.name}"]`).forEach((radio) => {
      radio.closest(".option").classList.remove("selected");
    });
    t.closest(".option").classList.add("selected");
  });

  closeBtn.addEventListener("click", () => {
    testPanel.classList.add("hidden");
    testPanel.innerHTML = "";
  });

  quizForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (submittedTests.has(test.id)) return;

    const qBlocks = [...quizForm.querySelectorAll(".question")];
    let score = 0;

    for (const block of qBlocks) {
      const correct = block.dataset.correct;
      const picked = block.querySelector("input[type='radio']:checked");

      if (!picked) {
        alert("Barcha savollarga javob berish majburiy.");
        return;
      }

      block.querySelectorAll(".option").forEach((opt) => {
        opt.classList.remove("opt-correct", "opt-wrong", "selected");
      });

      block.querySelectorAll("input").forEach((inp) => {
        const wrapper = inp.closest(".option");
        if (inp.value === correct) wrapper.classList.add("opt-correct");
        if (inp.checked && inp.value !== correct) wrapper.classList.add("opt-wrong");
        inp.disabled = true;
      });

      if (picked.value === correct) score += 1;
    }

    submittedTests.add(test.id);
    const total = qBlocks.length;
    resultBox.textContent = `Natija: ${score}/${total}`;
    resultBox.classList.remove("hidden");

    const submitBtn = quizForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Topshirildi";

    renderTests(filterTests(searchInput.value));
  });
}

function filterTests(query) {
  const q = query.trim().toLowerCase();
  return tests.filter((t) => t.title.toLowerCase().includes(q));
}

searchInput.addEventListener("input", () => {
  renderTests(filterTests(searchInput.value));
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  renderTests(tests);
});

setupProfileMenuDismiss();
wireProfileEditor();
showProfile(loadProfile());
renderTests(tests);


