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
    // Cookie banner simple logic
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