function openVideoModal(url) {
  document.getElementById("videoModal").style.display = "flex";

  document.getElementById("videoFrame").src = url;

  document.body.style.overflow = "hidden";
}

function closeDashboard() {
  const panel = document.getElementById("billPanel");

  panel.classList.remove("active");

  panel.classList.remove("expanded");
}

function toggleBillExpand() {
  const panel = document.getElementById("billPanel");

  panel.classList.toggle("expanded");
}

function closeVideoModal() {
  document.getElementById("videoModal").style.display = "none";

  document.getElementById("videoFrame").src = "";

  document.body.style.overflow = "auto";
}

const messagesEl = document.getElementById("messages");

const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const docList = document.getElementById("docList");
const emptyDocs = document.getElementById("emptyDocs");
const pdfInput = document.getElementById("pdfInput");
const csvInput = document.getElementById("csvInput");
const uploadProgress = document.getElementById("uploadProgress");
const welcomeScreen = document.getElementById("welcomeScreen");
const userSelect = document.getElementById("userSelect");
const userAvatar = document.getElementById("userAvatar");
const stopBtn = document.getElementById("stopBtn");
const statusDot = document.getElementById("statusDot");
const statusTitle = document.getElementById("statusTitle");

let isBusy = false;
let docs = [];
let activeDoc = null;
let chatHistory = [];

let csvMode = false;

const csvModeBtn = document.getElementById("csvModeBtn");

csvModeBtn.onclick = () => {
  csvMode = !csvMode;

  if (csvMode) {
    csvModeBtn.innerText = "CSV ON";

    csvModeBtn.classList.add("csv-active");

    showToast("CSV Analytics Mode Enabled", "success");
  } else {
    csvModeBtn.innerText = "CSV Mode";

    csvModeBtn.classList.remove("csv-active");

    showToast("Normal Chat Mode Enabled", "success");
  }
};

// ── STOP GENERATION ──
let stopRequested = false;
let currentTypewriterTimeout = null;

function setStopVisible(visible) {
  stopBtn.classList.toggle("visible", visible);
}

function stopGeneration() {
  stopRequested = true;
  if (currentTypewriterTimeout) {
    clearTimeout(currentTypewriterTimeout);
    currentTypewriterTimeout = null;
  }
  setStopVisible(false);
  isBusy = false;
  sendBtn.disabled = false;
  chatInput.focus();
  setStatus("ready");
  // Append a subtle "stopped" indicator to last bot bubble
  const bubbles = messagesEl.querySelectorAll(".msg-row.bot .msg-bubble");
  const last = bubbles[bubbles.length - 1];
  if (last && !last.dataset.stopped) {
    last.dataset.stopped = "1";
    const pill = document.createElement("span");
    pill.style.cssText =
      "display:inline-block;margin-left:6px;padding:2px 8px;border-radius:50px;font-size:11px;background:var(--stop-bg);color:var(--stop-color);border:1px solid var(--stop-border);vertical-align:middle;";
    pill.textContent = "stopped";
    last.appendChild(pill);
  }
}

// ── STATUS ──
function setStatus(state) {
  if (state === "generating") {
    statusDot.style.background = "var(--accent)";
    statusDot.style.boxShadow = "0 0 6px var(--accent)";
    statusTitle.textContent = "Generating…";
  } else {
    statusDot.style.background = "var(--success)";
    statusDot.style.boxShadow = "0 0 6px var(--success)";
    statusTitle.textContent = "Ready to answer";
  }
}

// ── THEME TOGGLE ──
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);

// ── USER SELECT ──
userSelect.addEventListener("change", () => {
  const oldUser = localStorage.getItem("user") || "user1";

  // save old chat
  localStorage.setItem(
    `chat_${oldUser}`,
    document.querySelector(".msg-group").innerHTML,
  );

  const user = userSelect.value;

  userAvatar.textContent = user === "user1" ? "U1" : "U2";
  localStorage.setItem("user", user);

  // load new user chat
  const savedChat = localStorage.getItem(`chat_${user}`);

  if (savedChat) {
    document.querySelector(".msg-group").innerHTML = savedChat;
  } else {
    clearChat();
  }

  loadDocuments();
});

// ── TEXTAREA AUTO RESIZE ──
chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = Math.min(chatInput.scrollHeight, 130) + "px";
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ── PDF UPLOAD ──

// ── CSV / PARQUET UPLOAD ──

csvInput.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);

  if (!files.length) return;

  csvInput.value = "";

  for (const file of files) {
    const valid = file.name.endsWith(".csv") || file.name.endsWith(".parquet");

    if (!valid) {
      showToast("Only CSV or Parquet allowed", "error");

      continue;
    }

    await uploadAnalyticsFile(file);
  }
});

pdfInput.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  pdfInput.value = "";
  for (const file of files) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Only PDF files allowed", "error");
      continue;
    }
    await uploadFile(file);
  }
});

async function uploadFile(file) {
  uploadProgress.style.display = "flex";
  const user = userSelect.value;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user", user);
  try {
    const res = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    uploadProgress.style.display = "none";
    if (res.ok) {
      addDoc(file.name, file.size);
      showToast(file.name + " uploaded", "success");
    } else {
      showToast("Upload failed: " + (data.error || "Error"), "error");
    }
  } catch {
    uploadProgress.style.display = "none";
    addDoc(file.name, file.size);
    showToast(file.name + " added (demo mode)", "success");
  }
}

async function uploadAnalyticsFile(file) {
  uploadProgress.style.display = "flex";

  const user = userSelect.value;

  const formData = new FormData();

  formData.append("file", file);

  formData.append("user", user);

  try {
    const res = await fetch(
      "http://localhost:5000/api/upload-analytics",

      {
        method: "POST",

        body: formData,
      },
    );

    const data = await res.json();

    uploadProgress.style.display = "none";

    if (res.ok) {
      showToast(file.name + " uploaded", "success");
    } else {
      showToast(data.error || "Upload failed", "error");
    }
  } catch (error) {
    uploadProgress.style.display = "none";

    showToast("Upload failed", "error");
  }
}

function addDoc(name, size) {
  emptyDocs.style.display = "none";
  const docId = Date.now();
  docs.push({ id: docId, name, size });

  const item = document.createElement("div");
  item.className = "doc-item";
  item.dataset.id = docId;
  const kb = size ? (size / 1024).toFixed(0) + " KB" : "";
  item.innerHTML = `
      <div class="doc-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent)">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <div class="doc-info">
        <div class="doc-name" title="${name}">${name}</div>
        ${kb ? `<div class="doc-size">${kb}</div>` : ""}
      </div>
      <button class="doc-remove" onclick="removeDoc(event, ${docId})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>`;

  item.addEventListener("click", (e) => {
    if (e.target.closest(".doc-remove")) return;
    document
      .querySelectorAll(".doc-item")
      .forEach((d) => d.classList.remove("active"));
    item.classList.add("active");
    activeDoc = name;
  });

  docList.appendChild(item);
  item.click();
}

function removeDoc(e, id) {
  e.stopPropagation();
  const item = docList.querySelector(`[data-id="${id}"]`);
  if (item) item.remove();
  docs = docs.filter((d) => d.id !== id);
  if (!docs.length) emptyDocs.style.display = "";
  if (activeDoc && docs.length) activeDoc = docs[docs.length - 1].name;
}

// ── SEND MESSAGE ──
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || isBusy) return;

  //show appointments by week day

  isBusy = true;
  stopRequested = false;
  sendBtn.disabled = true;
  welcomeScreen.style.display = "none";
  setStatus("generating");
  setStopVisible(true);

  appendMsg(text, "user");
  chatInput.value = "";
  chatInput.style.height = "auto";
  chatHistory.push({ role: "user", content: text });

  const typingId = showTyping();

  try {
    let endpoint = "http://localhost:5000/chat"; //Normal chat

    let bodyData = {
      user: userSelect.value,
      query: text,
    };

    // =========================
    // CSV MODE
    // =========================

    if (csvMode) {
      endpoint = "http://localhost:5000/api/sql-chat"; //csv chat

      bodyData = {
        user: userSelect.value, //user1 or user2
        query: text,
      };
    }

    // =========================
    // FETCH
    // =========================

    const res = await fetch(endpoint, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(bodyData),

      //   const bodyData = {
      //    query: "appointment status",    ==   '{"query":"appointment status","user":"user1"}'
      //     user: "user1"
      //                      };
    });
    const data = await res.json();
    removeTyping(typingId);

    if (!stopRequested) {
      // ================= ANALYTICS =================

      if (data.type === "analytics") {
        renderAnalytics(data);

        isBusy = false;

        sendBtn.disabled = false;

        setStopVisible(false);

        setStatus("ready");

        chatInput.focus();

        return;
      }
      // ================= ACTION HANDLE =================
      if (data.type === "action" && data.action === "new_bill") {
        const message = `Sure, generating the bill for ${data.patient}...\nOpening dashboard for further actions...`;

        //  chatbot typing effect
        typewriterMsg(message, { mode: "action" }, () => {
          //  delay before opening dashboard
          setTimeout(() => {
            localStorage.setItem("actionData", JSON.stringify(data));
            openDashboard();
            // reset UI
            isBusy = false;
            sendBtn.disabled = false;
            setStopVisible(false);
            setStatus("ready");
            chatInput.focus();
          }, 1000); // ⏱️ 1 second delay
        });

        return;
      }

      // ================= NORMAL CHAT =================
      // GRAPH RESPONSE
      if (data.type === "graph") {
        const graphMessage = `
    ${data.message}

    <br><br>

    <img
      src="http://localhost:5000${data.graphUrl}"
      style="
        width:100%;
        max-width:500px;
        border-radius:16px;
        margin-top:12px;
        border:1px solid rgba(255,255,255,0.1);
      "
    />
  `;

        typewriterMsg(
          graphMessage,
          {
            mode: "html",
          },
          () => {
            chatHistory.push({
              role: "assistant",
              content: graphMessage,
            });

            isBusy = false;
            sendBtn.disabled = false;
            setStopVisible(false);
            setStatus("ready");
            chatInput.focus();
          },
        );
      }

      // TEXT RESPONSE
      // VIDEO RESPONSE
      // VIDEO RESPONSE
      else if (data.type === "video") {
        const answer = data.answer || "Video found.";

        typewriterMsg(
          answer,
          {
            mode: "video",
            video: data.video,
          },
          () => {
            chatHistory.push({
              role: "assistant",
              content: answer,
            });

            isBusy = false;
            sendBtn.disabled = false;
            setStopVisible(false);
            setStatus("ready");
            chatInput.focus();
          },
        );
      }

      // TEXT RESPONSE
      else {
        const answer =
          data.answer || data.message || "No response from server.";

        typewriterMsg(
          answer,
          {
            mode: "text",
          },
          () => {
            chatHistory.push({
              role: "assistant",
              content: answer,
            });

            isBusy = false;
            sendBtn.disabled = false;
            setStopVisible(false);
            setStatus("ready");
            chatInput.focus();
          },
        );
      }
    }
  } catch {
    removeTyping(typingId);
    if (!stopRequested) {
      typewriterMsg(
        "Could not reach the server. Please ensure the backend is running on port 5000.",
        null,
        () => {
          isBusy = false;
          sendBtn.disabled = false;
          setStopVisible(false);
          setStatus("ready");
          chatInput.focus();
        },
      );
    }
  }
}

function appendMsg(text, role) {
  const msgGroup =
    document.querySelector(".msg-group") ||
    (() => {
      const g = document.createElement("div");
      g.className = "msg-group";
      messagesEl.appendChild(g);
      return g;
    })();

  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  const avatarSvg =
    role === "bot"
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

  const avatarClass = role === "bot" ? "bot-avatar" : "user-avatar-msg";

  row.innerHTML = `
      <div class="msg-avatar ${avatarClass}">${avatarSvg}</div>
      <div class="msg-bubble">${escHtml(text)}</div>`;

  msgGroup.appendChild(row);
  scrollBottom();

  saveChats();
  return row;
}

function typewriterMsg(text, options = {}, onComplete) {
  const video = options.video || null;
  const mode = options.mode || "text";
  const msgGroup = document.querySelector(".msg-group") || messagesEl;

  const row = document.createElement("div");

  row.className = "msg-row bot";

  row.innerHTML = `
    <div class="msg-avatar bot-avatar">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </div>

    <div class="msg-bubble"></div>
  `;

  msgGroup.appendChild(row);

  const target = row.querySelector(".msg-bubble");

  let i = 0;

  const speed = 12;

  const tick = () => {
    if (stopRequested) return;

    if (i < text.length) {
      if (mode === "html") {
        target.innerHTML = text;

        i = text.length;
      } else {
        target.innerHTML = formatResponse(escHtml(text.substring(0, i + 1)));
      }

      i++;

      scrollBottom();

      currentTypewriterTimeout = setTimeout(tick, speed);
    } else {
      currentTypewriterTimeout = null;

      // ================= VIDEO CARD =================

      if (mode === "video" && video) {
        const card = document.createElement("div");

        card.className = "video-card";

        const embedUrl = video.url;
        card.innerHTML = `



  <div
    class="fake-video"
    onclick="openVideoModal('${video.url}')"
  >

    <img
      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"
      class="preview-image"
    >

    <div class="play-btn">▶</div>

    <div class="video-overlay">
      <h4>${video.title}</h4>
    </div>

  </div>

  <div class="video-info">

    <button
      class="watch-btn"
      onclick="openVideoModal('${video.url}')"
    >
      Watch Demo
    </button>

  </div>

</div>

`;
        target.appendChild(card);

        scrollBottom();
      }
      saveChats();
      if (onComplete) onComplete();
    }
  };

  tick();
}

function showTyping() {
  const msgGroup = document.querySelector(".msg-group") || messagesEl;
  const id = "typing-" + Date.now();
  const row = document.createElement("div");
  row.className = "typing-row";
  row.id = id;
  row.innerHTML = `
      <div class="msg-avatar bot-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <div class="typing-bubble">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>`;
  msgGroup.appendChild(row);
  scrollBottom();
  return id;
}

function removeTyping(id) {
  document.getElementById(id)?.remove();
}

function scrollBottom() {
  messagesEl.scrollTo({
    top: messagesEl.scrollHeight,
    behavior: "smooth",
  });
}

function clearChat() {
  const msgGroup = document.querySelector(".msg-group");
  if (msgGroup) msgGroup.innerHTML = "";
  chatHistory = [];
  welcomeScreen.style.display = "";
  if (msgGroup) msgGroup.appendChild(welcomeScreen);
  saveChats();
}

function useSuggestion(el) {
  chatInput.value = el.textContent;
  chatInput.dispatchEvent(new Event("input"));
  sendMessage();
}

function formatResponse(text) {
  return (
    text

      // REMOVE MARKDOWN BOLD
      .replace(/\*\*(.*?)\*\*/g, "$1")

      // REMOVE SINGLE *
      .replace(/\*/g, "")

      // REMOVE EXTRA QUOTES
      .replace(/"/g, "")

      // CLEAN DOUBLE SPACES
      .replace(/\s+/g, " ")

      // BULLETS
      .replace(/^\- (.*)$/gm, "• $1")

      // LINE BREAKS
      .replace(/\n/g, "<br>")

      // CLEAN BR DUPLICATES
      .replace(/(<br>\s*){3,}/g, "<br><br>")

      .trim()
  );
}

function escHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

function saveChats() {
  const msgGroup = document.querySelector(".msg-group");

  if (!msgGroup) return;

  // =========================
  // REMOVE ECHARTS INTERNALS
  // =========================

  const cloned = msgGroup.cloneNode(true);

  cloned.querySelectorAll("canvas").forEach((canvas) => {
    canvas.remove();
  });

  // =========================
  // SAVE CLEAN HTML
  // =========================

  localStorage.setItem(
    `chat_${userSelect.value}`,

    cloned.innerHTML,
  );
}

function restoreCharts() {

  const analyticsCards =
    document.querySelectorAll(".analytics-ui");

  analyticsCards.forEach((card) => {

    try {

      // =========================
      // DATA
      // =========================

      const graphData =
        card.dataset.graph;

      const graphType =
        card.dataset.type;

      // =========================
      // VALIDATION
      // =========================

      if (
        !graphData ||
        !graphType
      ) {
        return;
      }

      const chartDiv =
        card.querySelector(
          ".analytics-chart"
        );

      if (!chartDiv) {
        return;
      }

      // =========================
      // PREVENT DOUBLE RENDER
      // =========================

      if (
        chartDiv.dataset.restored ===
        "true"
      ) {
        return;
      }

      chartDiv.dataset.restored =
        "true";

      // =========================
      // PARSE GRAPH
      // =========================

      const parsed =
        JSON.parse(graphData);

      // =========================
      // SAFETY
      // =========================

      if (
        !parsed ||
        !parsed.labels ||
        !parsed.values
      ) {
        return;
      }

      // =========================
      // GRAPH TYPES
      // =========================

      const isPieChart =

        graphType === "pie" ||

        graphType === "doughnut";

      const isHorizontalBar =

        graphType === "horizontalBar";

      const realChartType =

        isHorizontalBar
          ? "bar"
          : graphType;

      // =========================
      // DESTROY OLD CHART
      // =========================

      if (
        chartDiv.highchartsChart !==
        undefined
      ) {

        Highcharts
          .charts[
            chartDiv.highchartsChart
          ]
          ?.destroy();

      }

      // =========================
      // CREATE CHART
      // =========================

      Highcharts.chart(chartDiv, {

        chart: {

          type:
            isHorizontalBar
              ? "bar"
              : realChartType,

          backgroundColor:
            "transparent",

          animation: true,

          height:

            parsed.labels.length > 8

              ? parsed.labels.length * 65

              : 500,

          spacingLeft:
            isHorizontalBar
              ? 40
              : 10,

          spacingRight: 20,

          spacingTop: 20,

          spacingBottom: 20,

        },

        // =========================
        // TITLE
        // =========================

        title: {
          text: null,
        },

        // =========================
        // CREDITS
        // =========================

        credits: {
          enabled: false,
        },

        exporting: {
          enabled: false,
        },

        // =========================
        // X AXIS
        // =========================

        xAxis:

          isPieChart

            ? undefined

            : {

                categories:
                  parsed.labels,

                labels: {

                  rotation:

                    !isHorizontalBar &&

                    parsed.labels.length > 5

                      ? -30

                      : 0,

                  style: {

                    color:
                      "#cbd5e1",

                    fontSize:
                      isHorizontalBar
                        ? "12px"
                        : "11px",

                    textOverflow:
                      "ellipsis",

                  },

                },

              },

        // =========================
        // Y AXIS
        // =========================

        yAxis:

          isPieChart

            ? undefined

            : {

                title: {
                  text: null,
                },

                labels: {

                  style: {

                    color:
                      "#cbd5e1",

                    fontSize:
                      "11px",

                  },

                },

              },

        // =========================
        // TOOLTIP
        // =========================

        tooltip: {

          backgroundColor:
            "#111827",

          borderColor:
            "#2a3441",

          style: {
            color: "#ffffff",
          },

          shared:
            !isPieChart,

        },

        // =========================
        // LEGEND
        // =========================

        legend: {
          enabled: false,
        },

        // =========================
        // PLOT OPTIONS
        // =========================

        plotOptions: {

          series: {

            animation: {
              duration: 700,
            },

            borderRadius: 6,

            dataLabels: {
              enabled: false,
            },

          },

          pie: {

            innerSize:

              graphType === "doughnut"

                ? "55%"

                : "0%",

            allowPointSelect: true,

            cursor: "pointer",

            dataLabels: {

              enabled: true,

              style: {
                color: "#ffffff",
              },

            },

          },

        },

        // =========================
        // SERIES
        // =========================

        series: [

          {

            name: "Value",

            color:
              "#7c6af7",

            data:

              isPieChart

                ? parsed.labels.map(
                    (label, i) => ({
                      name: label,
                      y: parsed.values[i],
                    })
                  )

                : parsed.values,

          },

        ],

      });

    } catch (error) {

      console.error(
        "Chart restore failed:",
        error
      );

    }

  });

}

function loadChats() {
  const savedChat = localStorage.getItem(`chat_${userSelect.value}`);

  if (savedChat) {
    const msgGroup = document.querySelector(".msg-group");

    msgGroup.innerHTML = savedChat;

    restoreCharts();
  }
}

function showToast(msg, type = "success") {
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  const icon =
    type === "success"
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  t.innerHTML = icon + msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ── INIT ──
const savedUser = localStorage.getItem("user") || "user1";
userSelect.value = savedUser;
userAvatar.textContent = savedUser === "user1" ? "U1" : "U2";

async function loadDocuments() {
  const user = localStorage.getItem("user") || "user1";
  try {
    const res = await fetch(`http://localhost:5000/documents/${user}`);
    const data = await res.json();
    docs = [];
    docList.innerHTML = "";
    if (!data.length) {
      emptyDocs.style.display = "";
      return;
    }
    emptyDocs.style.display = "none";
    data.forEach((doc, index) => addDoc(`${index + 1}. ${doc.filename}`, null));
  } catch (err) {
    console.error("Error loading documents", err);
  }
}
loadDocuments();
loadChats();
chatInput.focus();

function openDashboard() {
  const panel = document.getElementById("billPanel");

  const frame = document.getElementById("billFrame");

  panel.classList.add("active");

  frame.src = "dashboard.html";
}

const csvBtn = document.getElementById("csvModeBtn");

csvBtn.onclick = () => {
  csvMode = !csvMode;

  if (csvMode) {
    csvBtn.style.background = "#7c6af7";

    csvBtn.style.color = "white";

    showToast("CSV Analytics Mode ON");
  } else {
    csvBtn.style.background = "";

    csvBtn.style.color = "";

    showToast("Normal Chat Mode ON");
  }
};

function renderAnalytics(data) {
  const chartId = "chart_" + Date.now();

  const msgGroup = document.querySelector(".msg-group") || messagesEl;

  const row = document.createElement("div");

  row.className = "msg-row bot";

  // =========================
  // TABLE HTML
  // =========================

  let tableHTML = "";

  if (data.tableData && data.tableData.length) {
    const headers = Object.keys(data.tableData[0]);

    tableHTML += `

      <table class="analytics-table">

        <thead>

          <tr>

            ${headers
              .map(
                (h) => `

              <th>${h}</th>

            `,
              )
              .join("")}

          </tr>

        </thead>

        <tbody>

          ${data.tableData
            .map(
              (row) => `

            <tr>

              ${headers
                .map(
                  (h) => `

                <td>${row[h]}</td>

              `,
                )
                .join("")}

            </tr>

          `,
            )
            .join("")}

        </tbody>

      </table>

    `;
  }

  // =========================
  // MAIN UI
  // =========================

  row.innerHTML = `

    <div class="msg-avatar bot-avatar">

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>

    </div>

    <div class="msg-bubble">

      <div
        class="analytics-ui"
        data-graph='${JSON.stringify(data.graphData || {})}'
        data-type='${data.graphConfig?.graphType || ""}'
      >

        <div class="analytics-header">

          <div class="analytics-title">
            Analytics Result
          </div>

          <div class="analytics-sub">

            AI Generated CSV Insights

          </div>

        </div>

        <div class="analytics-explanation">

          ${data.answer}

        </div>

        ${
          data.graphConfig?.graph &&
          data.graphData &&
          data.graphData.labels?.length > 1
            ? `

            <div class="chart-container">

<div
  id="${chartId}"
  class="analytics-chart"
  style="
    width: 100%;
    min-height: ${Math.max(data.graphData.labels.length * 55, 420)}px;
    height: auto;
  "
></div>

            </div>

          `
            : ""
        }

        ${tableHTML}

      </div>

    </div>
  `;

  msgGroup.appendChild(row);

  // =========================
  // GRAPH RENDER
  // =========================

  if (
    data.graphConfig?.graph &&
    data.graphData &&
    data.graphData.labels?.length > 1
  ) {
    setTimeout(() => {
      const chartDiv = document.getElementById(chartId);

      if (!chartDiv) {
        console.log("Chart div not found");

        return;
      }

      console.log("GRAPH TYPE:", data.graphConfig.graphType);

      console.log("GRAPH DATA:", data.graphData);



      const graphType = data.graphConfig.graphType;

      const parsed = data.graphData;

      // =========================
      // CHART TYPE
      // =========================

      const isPieChart = graphType === "pie" || graphType === "doughnut";

      const isHorizontalBar = graphType === "horizontalBar";

      const realChartType = isHorizontalBar ? "bar" : graphType;

      // =========================
      // OPTION
      // =========================

        Highcharts.chart(chartDiv, {

 chart: {

  type: isHorizontalBar
    ? "bar"
    : realChartType,

  backgroundColor: "transparent",

  spacingLeft:
    isHorizontalBar
      ? 120
      : 20,

  spacingRight: 40,

  height: isHorizontalBar
    ? Math.max(
        parsed.labels.length * 55,
        650
      )
    : 500

},

  title: {
    text: null
  },

  credits: {
    enabled: false
  },

  exporting: {
    enabled: false
  },

  xAxis: isHorizontalBar

    ? {

        categories: parsed.labels,

        labels: {
reserveSpace: true,
          style: {
            color: "#cbd5e1",
            
            fontSize: "12px"
          }

        }

      }

    : {

        categories: parsed.labels,

        labels: {

          rotation:
            parsed.labels.length > 5
              ? -35
              : 0,

          style: {
            color: "#cbd5e1",
            fontSize: "11px"
          }

        }

      },

  yAxis: {

    title: {
      text: null
    },

    labels: {

      style: {
        color: "#cbd5e1",
        fontSize: "11px"
      }

    }

  },

  legend: {
    enabled: false
  },

  tooltip: {

    backgroundColor: "#111827",

    style: {
      color: "#ffffff"
    }

  },

  plotOptions: {

    series: {

      borderRadius: 6,

      dataLabels: {
        enabled: false
      }

    }

  },

  series: [

    {

      data: parsed.values,

      color: "#7c6af7"

    }

  ]

});


    }, 0);
  }

  scrollBottom();

  setTimeout(() => {
    saveChats();
  }, 800);
}
