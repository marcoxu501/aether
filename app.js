let isListening = false;
let recognition = null;
let currentTranscript = "";

// 初始化語音辨識
function initSpeech() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById('voiceStatus').textContent = "此瀏覽器不支援語音辨識";
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = 'zh-TW';
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isListening = true;
    document.getElementById('micBtn').classList.add('listening');
    document.getElementById('voiceStatus').textContent = "正在聆聽...";
  };

  recognition.onresult = (event) => {
    let interim = "";
    let final = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += transcript;
      } else {
        interim += transcript;
      }
    }
    currentTranscript = final || interim;
    document.getElementById('transcript').textContent = currentTranscript;
  };

  recognition.onend = () => {
    isListening = false;
    document.getElementById('micBtn').classList.remove('listening');
    document.getElementById('voiceStatus').textContent = "點擊開始說話";
    if (currentTranscript) {
      processVoiceCommand(currentTranscript);
    }
  };

  recognition.onerror = (event) => {
    console.error(event.error);
    isListening = false;
    document.getElementById('micBtn').classList.remove('listening');
    document.getElementById('voiceStatus').textContent = "辨識錯誤，請再試一次";
  };
}

function toggleListening() {
  if (!recognition) {
    alert("請使用支援語音辨識的瀏覽器（Chrome / Edge / Safari）");
    return;
  }
  if (isListening) {
    recognition.stop();
  } else {
    currentTranscript = "";
    document.getElementById('transcript').textContent = "";
    recognition.start();
  }
}

function processVoiceCommand(text) {
  const lower = text.toLowerCase();
  document.getElementById('transcript').textContent = `已識別：${text}`;

  if (lower.includes('郵件') || lower.includes('email') || lower.includes('信')) {
    showNotification("正在準備撰寫郵件...");
  } else if (lower.includes('報告') || lower.includes('report')) {
    showNotification("AI 代理正在生成報告...");
  } else if (lower.includes('摘要') || lower.includes('summary')) {
    showNotification("正在整理每日郵件摘要...");
  } else {
    showNotification(`已收到指令：「${text}」`);
  }
}

function executeQuickAction(type) {
  if (type === 'email') {
    showNotification("開啟語音郵件模式");
    toggleListening();
  } else if (type === 'typing') {
    showNotification("語音打字已啟動");
    toggleListening();
  }
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  event?.target?.closest('.nav-btn')?.classList.add('active');
}

function pairDevice() {
  if (navigator.bluetooth) {
    navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['battery_service']
    })
    .then(device => {
      showNotification(`已配對：${device.name || '未知裝置'}`);
    })
    .catch(err => {
      showNotification("配對取消或失敗");
    });
  } else {
    showNotification("此瀏覽器不支援 Web Bluetooth，已模擬配對成功");
  }
}

function toggleAgent(name, enabled) {
  showNotification(`${name} 代理已${enabled ? '啟用' : '關閉'}`);
}

function createAgent() {
  const name = prompt("請輸入新代理名稱：");
  if (name) {
    showNotification(`已建立代理：「${name}」`);
  }
}

function saveSettings() {
  const settings = {
    typing: document.getElementById('feat-typing').checked,
    control: document.getElementById('feat-control').checked,
    email: document.getElementById('feat-email').checked,
    agents: document.getElementById('feat-agents').checked
  };
  localStorage.setItem('aether-settings', JSON.stringify(settings));
  showNotification("設定已儲存");
}

function loadSettings() {
  const saved = localStorage.getItem('aether-settings');
  if (saved) {
    const s = JSON.parse(saved);
    document.getElementById('feat-typing').checked = s.typing;
    document.getElementById('feat-control').checked = s.control;
    document.getElementById('feat-email').checked = s.email;
    document.getElementById('feat-agents').checked = s.agents;
  }
}

function showNotification(msg) {
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    background: #7c5cff; color: white; padding: 12px 20px;
    border-radius: 12px; z-index: 9999; font-size: 14px;
    box-shadow: 0 4px 20px rgba(124,92,255,0.4);
  `;
  notif.textContent = msg;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2500);
}

// PWA 安裝提示
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

// 初始化
window.onload = () => {
  initSpeech();
  loadSettings();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
};