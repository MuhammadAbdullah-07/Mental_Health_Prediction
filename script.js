const API_URL = "http://127.0.0.1:8000/predict";

const FIELDS = [
  "Age", "Gender", "Country", "Academic_Level",
  "Most_Used_Platform", "Purpose_Of_Use", "Avg_Daily_Usage_Hours",
  "Daily_Unlocks", "Study_Hours", "Physical_Activity_Hours",
  "Sleep_Hours_Per_Night", "Stress_Level"
];

/* ── Progress Tracker ── */
function updateProgress() {
  let filled = 0;
  FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value.trim() !== "") filled++;
  });
  const pct = Math.round((filled / FIELDS.length) * 100);
  document.getElementById("progressBar").style.width = pct + "%";
  document.getElementById("progressLabel").textContent =
    `${filled} of ${FIELDS.length} fields completed`;
}

// Attach progress listeners
window.addEventListener("DOMContentLoaded", () => {
  FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateProgress);
  });
});

/* ── Validate ── */
function validate() {
  for (const id of FIELDS) {
    const el = document.getElementById(id);
    if (!el || el.value.trim() === "") {
      el?.focus();
      showError(`Please fill in: ${id.replaceAll("_", " ")}`);
      return false;
    }
  }
  return true;
}

/* ── Main Predict Function ── */
async function predict() {
  if (!validate()) return;

  setLoading(true);
  hideError();
  hideResult();

  const payload = {
    Age:                     parseInt(document.getElementById("Age").value),
    Gender:                  document.getElementById("Gender").value,
    Country:                 document.getElementById("Country").value,
    Academic_Level:          document.getElementById("Academic_Level").value,
    Most_Used_Platform:      document.getElementById("Most_Used_Platform").value,
    Purpose_Of_Use:          document.getElementById("Purpose_Of_Use").value,
    Avg_Daily_Usage_Hours:   parseFloat(document.getElementById("Avg_Daily_Usage_Hours").value),
    Daily_Unlocks:           parseInt(document.getElementById("Daily_Unlocks").value),
    Study_Hours:             parseFloat(document.getElementById("Study_Hours").value),
    Physical_Activity_Hours: parseFloat(document.getElementById("Physical_Activity_Hours").value),
    Sleep_Hours_Per_Night:   parseFloat(document.getElementById("Sleep_Hours_Per_Night").value),
    Stress_Level:            document.getElementById("Stress_Level").value,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Server error. Please try again.");
    }

    const data = await response.json();
    showResult(data.predicted_mental_score);

  } catch (err) {
    if (err.message.includes("Failed to fetch")) {
      showError("Cannot connect to the API. Make sure uvicorn is running on http://127.0.0.1:8000");
    } else {
      showError(err.message);
    }
  } finally {
    setLoading(false);
  }
}

/* ── Show Result ── */
function showResult(score) {
  const card   = document.getElementById("resultCard");
  const scoreEl = document.getElementById("resultScore");
  const barFill = document.getElementById("resultBarFill");
  const msgEl  = document.getElementById("resultMessage");

  scoreEl.textContent = score.toFixed(2);

  // Color + message based on score (assuming 1–10 scale)
  let color, message;
  if (score >= 7.5) {
    color = "#4ade80";
    message = "Great news! Your mental health score looks strong. Keep maintaining your healthy habits — sleep, physical activity, and balanced screen time are clearly working for you.";
  } else if (score >= 5) {
    color = "#facc15";
    message = "Your score is in the moderate range. Consider reducing screen time, improving sleep, or adding more physical activity to your routine to boost your wellbeing.";
  } else {
    color = "#f87171";
    message = "Your score suggests some areas need attention. Consider speaking with a counselor or mental health professional, and try to reduce stress and improve your daily habits.";
  }

  barFill.style.background = color;
  scoreEl.style.color = color;
  msgEl.textContent = message;

  // Animate bar (score out of 10)
  const pct = Math.min((score / 10) * 100, 100);
  setTimeout(() => { barFill.style.width = pct + "%"; }, 100);

  card.classList.remove("hidden");
  card.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ── UI Helpers ── */
function setLoading(state) {
  const btn     = document.getElementById("predictBtn");
  const btnText = document.getElementById("btnText");
  const spinner = document.getElementById("btnSpinner");
  btn.disabled = state;
  btnText.textContent = state ? "Analyzing..." : "Predict Mental Health Score";
  spinner.classList.toggle("hidden", !state);
}

function showError(msg) {
  const card = document.getElementById("errorCard");
  document.getElementById("errorText").textContent = msg;
  card.classList.remove("hidden");
  card.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideError() {
  document.getElementById("errorCard").classList.add("hidden");
}

function hideResult() {
  document.getElementById("resultCard").classList.add("hidden");
}

function resetForm() {
  FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  hideResult();
  hideError();
  updateProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
