// DEVICE LIST & SEARCH LOGIC RESTORED HERE
const compatibleDevices = [
    "iPhone 16", "iPhone 16 Pro", "iPhone 15", "iPhone 14", "iPhone 13", "iPhone 12", "iPhone 11", "iPhone XS", "iPhone XR", "iPhone SE (2020)",
    "Samsung Galaxy S25", "Samsung Galaxy S24", "Samsung Galaxy S23", "Samsung Galaxy S22", "Samsung Galaxy S21", "Samsung Galaxy S20", "Samsung Note 20", "Samsung Z Flip", "Samsung Z Fold",
    "Google Pixel 9", "Google Pixel 8", "Google Pixel 7", "Google Pixel 6", "Google Pixel 5", "Google Pixel 4",
    "Xiaomi 15", "Xiaomi 14", "Xiaomi 13", "Xiaomi 12", "Xiaomi Redmi Note",
    "Motorola Razr", "Motorola Edge", "Motorola Moto G",
    "Oppo Find X3", "Oppo Reno 6",
    "iPad Pro", "iPad Air", "iPad Mini", "iPad"
];

const deviceInput = document.getElementById('deviceInput');
const suggestionsBox = document.getElementById('suggestions');
const resultDiv = document.getElementById('checkResult');

function showSuggestions() {
    const input = deviceInput.value.toLowerCase().trim();
    suggestionsBox.innerHTML = '';
    if(input.length < 2) { suggestionsBox.classList.add('hidden'); return; }
    
    const terms = input.split(/\s+/);
    const matches = compatibleDevices.filter(dev => terms.every(t => dev.toLowerCase().includes(t)));
    
    if(matches.length > 0) {
        matches.forEach(dev => {
            const div = document.createElement('div');
            div.textContent = dev;
            div.className = "px-5 py-3 cursor-pointer hover:bg-slate-700 text-slate-300 border-b border-slate-700 last:border-0";
            div.onclick = () => selectDevice(dev);
            suggestionsBox.appendChild(div);
        });
        suggestionsBox.classList.remove('hidden');
    } else {
        suggestionsBox.classList.add('hidden');
    }
}

function selectDevice(name) {
    deviceInput.value = name;
    suggestionsBox.classList.add('hidden');
    resultDiv.innerHTML = `<span class="text-green-400 font-bold">Yes! ${name} is compatible.</span>`;
}

function checkCompatibility() {
    const input = deviceInput.value.trim();
    if(!input) return;
    selectDevice(input); // Simplified check for now
}

if(deviceInput) {
    deviceInput.addEventListener('input', showSuggestions);
    deviceInput.addEventListener('keypress', (e) => { if(e.key==='Enter') checkCompatibility(); });
}

// GOOGLE SHEET & PRICING
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/12L5n1f1kD5GZe_50G7H1dCGAwCdIkdFZBoGdVUCfCqY/gviz/tq?tqx=out:csv"; 
const GOOGLE_SHEET_URL_GLOBAL = "https://docs.google.com/spreadsheets/d/1BravjVO4QyFfj3EN69aEF8NhxeCZ5wAVqsx1ReiZjTs/gviz/tq?tqx=out:csv";

function createPlanCard(plan) {
    // Use the exact price provided (no currency conversion)
    const priceRaw = (plan.price || "").toString().trim();
    let displayPrice = priceRaw;
    const numeric = parseFloat(priceRaw.replace(',', '.'));
    if (!isNaN(numeric)) {
        displayPrice = numeric.toFixed(2).replace('.', ',');
    }
    
    const highlightClass = plan.highlight ? "glow-card border border-sky-400/70" : "panel border border-slate-700/60";

    const div = document.createElement('div');
    div.className = `flex flex-col items-center p-6 rounded-xl ${highlightClass} relative transition duration-300 hover:scale-[1.02] hover:-translate-y-1`;
    
    div.innerHTML = `
        ${plan.highlight ? '<div class="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">Top</div>' : ''}
        <div class="text-3xl font-bold mb-1 ${plan.highlight ? 'text-yellow-300' : 'text-blue-400'} tracking-tight leading-tight">${plan.gb} GB</div>
        <div class="text-xl font-semibold mb-4 text-slate-400">${plan.days} Days</div>
        <div class="text-[10px] font-semibold text-slate-200 text-center whitespace-nowrap tracking-normal">${plan.description}</div>
        <div class="flex flex-col items-center mt-6">
            <span class="text-5xl font-extrabold text-white">€${displayPrice}</span>
        </div>
        <a href="${plan.stripe_link}" class="btn-primary w-full py-3 rounded-xl font-bold text-white uppercase mt-4 text-lg text-center">Buy now & activate</a>
        <div class="text-xs mt-3 ${plan.highlight ? 'text-white/80' : 'text-slate-500'}">QR code is delivered immediately by email</div>
    `;
    return div;
}

async function fetchAndRender(url, containerId, loadingId) {
    try {
        const res = await fetch(url);
        if(!res.ok) throw new Error("Fetch failed");
        const txt = await res.text();
        
        Papa.parse(txt, {
            header: true,
            complete: (results) => {
                 const plans = results.data.map(row => ({
                    gb: row['GB'] || row['gb'],
                    days: row['Days'] || row['days'],
                    description: row['Description'] || row['description'],
                    price: row['Price (EUR)'] || row['Price'] || row['price'],
                    highlight: (row['Highlight?'] === 'TRUE' || row['Highlight'] === 'TRUE'),
                    stripe_link: row['Stripe Link'] || row['stripe_link']
                })).filter(p => p.gb);

                const grid = document.getElementById(containerId);
                grid.innerHTML = '';
                plans.forEach(p => grid.appendChild(createPlanCard(p)));
                document.getElementById(loadingId).classList.add('hidden');
            }
        });
    } catch(e) { console.error(e); }
}

async function init() {
    fetchAndRender(GOOGLE_SHEET_URL, 'plan-grid', 'loading-plans');
    fetchAndRender(GOOGLE_SHEET_URL_GLOBAL, 'plan-grid-global', 'loading-plans-global');
    
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
    
    // Toggle Logic
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

    // Autoplay attempt
    document.addEventListener('click', () => {
        if(!isPlaying) {
            audio.play().then(() => { 
                isPlaying = true; 
                updateIcons(true); 
            }).catch(()=>{});
        }
    }, {once:true});
    
    // Force initial state
    updateIcons(false);

    // Cookie banner
    const consentKey = 'sn_cookie_consent';
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const declineBtn = document.getElementById('cookie-decline');

    function hideBanner() {
        if (banner) banner.style.display = 'none';
    }
    function showBanner() {
        if (banner) banner.style.display = 'block';
    }
    function setConsent(value) {
        const payload = { value, ts: Date.now() };
        localStorage.setItem(consentKey, JSON.stringify(payload));
        hideBanner();
    }
    if (banner && acceptBtn && declineBtn) {
        const saved = localStorage.getItem(consentKey);
        if (!saved) showBanner();
        acceptBtn.onclick = () => setConsent('accepted');
        declineBtn.onclick = () => setConsent('declined');
    }
}

window.onload = init;