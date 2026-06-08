async function init() {
    // Audio init
    const audio = document.getElementById('bg-audio');
    const btn = document.getElementById('music-toggle');
    const btnMobile = document.getElementById('music-toggle-mobile');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    const iconPlayMobile = document.getElementById('icon-play-mobile');
    const iconPauseMobile = document.getElementById('icon-pause-mobile');
    let isPlaying = false;

    function updateIcons(playing) {
        if (iconPlay && iconPause) {
            iconPlay.classList.toggle('hidden', playing);
            iconPause.classList.toggle('hidden', !playing);
        }
        if (iconPlayMobile && iconPauseMobile) {
            iconPlayMobile.classList.toggle('hidden', playing);
            iconPauseMobile.classList.toggle('hidden', !playing);
        }
        if (btn) btn.classList.toggle('music-playing', playing);
        if (btnMobile) btnMobile.classList.toggle('music-playing', playing);
    }

    if (btn && audio) {
        btn.onclick = () => {
            if (isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
            isPlaying = !isPlaying;
            btn.classList.toggle('bg-blue-600', !isPlaying);
            btn.classList.toggle('bg-red-600', isPlaying);
        };
    }

    function handleToggle(e) {
        if (e) e.stopPropagation();
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
        } else {
            audio.play();
            isPlaying = true;
        }
        updateIcons(isPlaying);
    }
    if (btn) btn.onclick = handleToggle;
    if (btnMobile) btnMobile.onclick = handleToggle;

    document.addEventListener('click', () => {
        if(!isPlaying && audio) {
            audio.play().then(() => {
                isPlaying = true;
                updateIcons(true);
            }).catch(()=>{});
        }
    }, {once:true});

    updateIcons(false);

    // Cookie banner
    const consentKey = 'sn_cookie_consent';
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const declineBtn = document.getElementById('cookie-decline');
    const accept = document.getElementById('cookie-accept');
    const decline = document.getElementById('cookie-decline');

    function hideBanner() { if (banner) banner.style.display = 'none'; }
    function showBanner() { if (banner) banner.style.display = 'block'; }
    function setConsent(value) {
        localStorage.setItem(consentKey, JSON.stringify({ value, ts: Date.now() }));
        hideBanner();
    }
    if (banner && accept) {
        if (!localStorage.getItem('cookie_consent')) {
            banner.style.display = 'block';
        }
        accept.onclick = () => {
            localStorage.setItem('cookie_consent', 'true');
            banner.style.display = 'none';
        };
    }
    if (banner && acceptBtn && declineBtn) {
        if (!localStorage.getItem(consentKey)) showBanner();
        acceptBtn.onclick = () => setConsent('accepted');
        declineBtn.onclick = () => setConsent('declined');
    }
}

window.onload = init;

(function () {
  const OLLAMA_BASE = 'http://192.168.43.11:11434/api';
  const MODEL = 'qwen2.5:7b';

  const openBtn = document.createElement('button');
  openBtn.className = 'fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-xl text-2xl z-40';
  openBtn.textContent = '💬';
  openBtn.type = 'button';
  openBtn.setAttribute('aria-label', 'Otvori chat');

  const panel = document.createElement('div');
  panel.className = 'fixed bottom-24 right-6 w-[360px] max-w-[calc(100vw-48px)] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-40 hidden flex-col overflow-hidden';

  const header = document.createElement('div');
  header.className = 'px-4 py-3 border-b border-slate-700 flex items-center justify-between';
  header.innerHTML = '<div class="text-slate-100 font-semibold">SofortNetz asist.</div><button id="chat-close" class="text-slate-400 hover:text-white" type="button">✕</button>';

  const body = document.createElement('div');
  body.className = 'p-3 h-80 overflow-y-auto space-y-2 bg-slate-950';

  const form = document.createElement('form');
  form.className = 'p-3 border-t border-slate-700 bg-slate-900 flex gap-2';
  form.innerHTML = '<input id="chat-input" type="text" placeholder="Type..." autocomplete="off" class="flex-1 bg-slate-800 text-slate-100 placeholder-slate-500 border border-slate-600 rounded-full px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /><button id="chat-send" type="submit" class="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 text-sm">Send</button>';

  const status = document.createElement('div');
  status.className = 'px-3 pb-2 text-[11px] text-slate-500 bg-slate-900 hidden';

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(status);
  panel.appendChild(form);
  document.body.appendChild(panel);
  document.body.appendChild(openBtn);

  function addMessage(role, text) {
    const wrap = document.createElement('div');
    wrap.className = 'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ' + (role === 'user' ? 'bg-blue-600 text-white self-end ml-auto' : 'bg-slate-800 text-slate-100 mr-auto');
    wrap.textContent = text;
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function setStatus(msg) {
    status.textContent = msg;
    status.classList.toggle('hidden', !msg);
  }

  async function sendChat() {
    const input = document.getElementById('chat-input');
    const text = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    addMessage('user', text);
    setStatus('Sending…');
    try {
      const res = await fetch(OLLAMA_BASE + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, stream: false, messages: [{ role: 'user', content: text }], options: { num_ctx: 65536 } })
      });
      const data = await res.json().catch(async () => {
        const txt = await res.text();
        throw new Error('Invalid JSON: ' + txt.slice(0, 200));
      });
      const reply = (data && (data.message && data.message.content)) ? data.message.content : 'Nema odgovora.';
      addMessage('assistant', reply);
      setStatus('');
    } catch (err) {
      addMessage('assistant', 'Greška: ' + err.message);
      setStatus('');
    }
  }

  document.getElementById('chat-close').addEventListener('click', () => panel.classList.add('hidden'));
  openBtn.addEventListener('click', () => panel.classList.toggle('hidden'));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') panel.classList.add('hidden');
  });
  form.addEventListener('submit', (e) => { e.preventDefault(); sendChat(); });
  document.getElementById('chat-send').addEventListener('click', sendChat);

  addMessage('assistant', 'Zdravo! Imam korisnička pitanja o tarifama ili eSIM aktivaciji?');
})();
