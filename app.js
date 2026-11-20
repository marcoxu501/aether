let isListening = false;
let recognition = null;
let currentTranscript = "";
let currentLang = localStorage.getItem('aether-lang') || 'zh-TW';

const translations = {
  'zh-TW': {
    connected: '藍牙已連接',
    tapToSpeak: '點擊開始說話',
    email: 'Email',
    emailDesc: '語音撰寫郵件',
    typing: '打字',
    typingDesc: '語音轉文字',
    aiAgent: 'AI 代理',
    aiAgentDesc: '自動完成任務',
    agentsSubtitle: '說出指令即可自動執行',
    dailyEmail: '每日郵件摘要',
    dailyEmailDesc: '整理收件匣重點',
    autoReport: '自動報告',
    autoReportDesc: '生成報告',
    settings: '功能設定',
    speechLang: '語音辨識語言',
    langHint: '選擇正確語言可大幅提升辨識準確度',
    voiceTyping: '語音打字',
    systemControl: '系統控制',
    home: '🏠 首頁',
    agents: '✨ 代理'
  },
  'zh-CN': {
    connected: '蓝牙已连接',
    tapToSpeak: '点击开始说话',
    email: 'Email',
    emailDesc: '语音撰写邮件',
    typing: '打字',
    typingDesc: '语音转文字',
    aiAgent: 'AI 代理',
    aiAgentDesc: '自动完成任务',
    agentsSubtitle: '说出指令即可自动执行',
    dailyEmail: '每日邮件摘要',
    dailyEmailDesc: '整理收件箱重点',
    autoReport: '自动报告',
    autoReportDesc: '生成报告',
    settings: '功能设置',
    speechLang: '语音识别语言',
    langHint: '选择正确语言可大幅提升识别准确度',
    voiceTyping: '语音打字',
    systemControl: '系统控制',
    home: '🏠 首页',
    agents: '✨ 代理'
  },
  'en-US': {
    connected: 'Bluetooth Connected',
    tapToSpeak: 'Tap to speak',
    email: 'Email',
    emailDesc: 'Voice compose email',
    typing: 'Typing',
    typingDesc: 'Voice to text',
    aiAgent: 'AI Agent',
    aiAgentDesc: 'Auto complete tasks',
    agentsSubtitle: 'Speak a command to run automatically',
    dailyEmail: 'Daily Email Summary',
    dailyEmailDesc: 'Summarize inbox highlights',
    autoReport: 'Auto Report',
    autoReportDesc: 'Generate reports',
    settings: 'Settings',
    speechLang: 'Speech Recognition Language',
    langHint: 'Choosing the correct language greatly improves accuracy',
    voiceTyping: 'Voice Typing',
    systemControl: 'System Control',
    home: '🏠 Home',
    agents: '✨ Agents'
  },
  'en-GB': {
    connected: 'Bluetooth Connected',
    tapToSpeak: 'Tap to speak',
    email: 'Email',
    emailDesc: 'Voice compose email',
    typing: 'Typing',
    typingDesc: 'Voice to text',
    aiAgent: 'AI Agent',
    aiAgentDesc: 'Auto complete tasks',
    agentsSubtitle: 'Speak a command to run automatically',
    dailyEmail: 'Daily Email Summary',
    dailyEmailDesc: 'Summarise inbox highlights',
    autoReport: 'Auto Report',
    autoReportDesc: 'Generate reports',
    settings: 'Settings',
    speechLang: 'Speech Recognition Language',
    langHint: 'Choosing the correct language greatly improves accuracy',
    voiceTyping: 'Voice Typing',
    systemControl: 'System Control',
    home: '🏠 Home',
    agents: '✨ Agents'
  },
  'ja-JP': {
    connected: 'ブルートゥース接続済み',
    tapToSpeak: 'タップして話す',
    email: 'Email',
    emailDesc: '音声でメール作成',
    typing: '入力',
    typingDesc: '音声から文字へ',
    aiAgent: 'AIエージェント',
    aiAgentDesc: '自動でタスク完了',
    agentsSubtitle: '指令を言うだけで自動実行',
    dailyEmail: '毎日メール要約',
    dailyEmailDesc: '受信箱の重要点を整理',
    autoReport: '自動レポート',
    autoReportDesc: 'レポート生成',
    settings: '設定',
    speechLang: '音声認識言語',
    langHint: '正しい言語を選ぶと認識精度が大幅に向上',
    voiceTyping: '音声入力',
    systemControl: 'システム制御',
    home: '🏠 ホーム',
    agents: '✨ エージェント'
  },
  'ko-KR': {
    connected: '블루투스 연결됨',
    tapToSpeak: '탭하여 말하기',
    email: 'Email',
    emailDesc: '음성으로 이메일 작성',
    typing: '타이핑',
    typingDesc: '음성을 텍스트로',
    aiAgent: 'AI 에이전트',
    aiAgentDesc: '자동으로 작업 완료',
    agentsSubtitle: '명령을 말하면 자동 실행',
    dailyEmail: '일일 이메일 요약',
    dailyEmailDesc: '수신함 주요 내용 정리',
    autoReport: '자동 보고서',
    autoReportDesc: '보고서 생성',
    settings: '설정',
    speechLang: '음성 인식 언어',
    langHint: '올바른 언어를 선택하면 인식 정확도가 크게 향상됩니다',
    voiceTyping: '음성 타이핑',
    systemControl: '시스템 제어',
    home: '🏠 홈',
    agents: '✨ 에이전트'
  }
};

function getText(key) {
  const t = translations[currentLang] || translations['en-US'] || translations['zh-TW'];
  return t[key] || key;
}

function updateUI() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = getText(key);
  });
  const voiceStatus = document.getElementById('voiceStatus');
  if (voiceStatus && !isListening) {
    voiceStatus.textContent = getText('tapToSpeak');
  }
}

function initSpeech() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById('voiceStatus').textContent = "此瀏覽器不支援語音辨識";
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = currentLang;
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
    document.getElementById('voiceStatus').textContent = getText('tapToSpeak');
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

function changeLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('aether-lang', lang);
  if (recognition) {
    recognition.lang = lang;
  }
  updateUI();
  showNotification(`Language switched to: ${lang}`);
}

function toggleListening() {
  if (!recognition) {
    alert("Please use a browser that supports speech recognition (Chrome / Edge / Safari)");
    return;
  }
  if (isListening) {
    recognition.stop();
  } else {
    currentTranscript = "";
    document.getElementById('transcript').textContent = "";
    recognition.lang = currentLang;
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
    typing: document.getElementById('feat-typing')?.checked,
    control: document.getElementById('feat-control')?.checked,
    email: document.getElementById('feat-email')?.checked,
    agents: document.getElementById('feat-agents')?.checked
  };
  localStorage.setItem('aether-settings', JSON.stringify(settings));
  showNotification("設定已儲存");
}

function loadSettings() {
  const saved = localStorage.getItem('aether-settings');
  if (saved) {
    const s = JSON.parse(saved);
    if (document.getElementById('feat-typing')) document.getElementById('feat-typing').checked = s.typing;
    if (document.getElementById('feat-control')) document.getElementById('feat-control').checked = s.control;
    if (document.getElementById('feat-email')) document.getElementById('feat-email').checked = s.email;
    if (document.getElementById('feat-agents')) document.getElementById('feat-agents').checked = s.agents;
  }
  const langSelect = document.getElementById('langSelect');
  if (langSelect) langSelect.value = currentLang;
  updateUI();
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

window.onload = () => {
  initSpeech();
  loadSettings();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
};