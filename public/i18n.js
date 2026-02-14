// Haltrovex i18n System - Auto language detection & switching
class I18n {
  constructor() {
    this.currentLang = 'en';
    this.translations = {};
    this.supportedLanguages = {
      'en': { name: 'English', flag: 'gb', flagEmoji: '🇬🇧' },
      'de': { name: 'Deutsch', flag: 'de', flagEmoji: '🇩🇪' },
      'sv': { name: 'Svenska', flag: 'se', flagEmoji: '🇸🇪' },
      'no': { name: 'Norsk', flag: 'no', flagEmoji: '🇳🇴' },
      'fi': { name: 'Suomi', flag: 'fi', flagEmoji: '🇫🇮' },
      'it': { name: 'Italiano', flag: 'it', flagEmoji: '🇮🇹' },
      'fr': { name: 'Français', flag: 'fr', flagEmoji: '🇫🇷' },
      'es': { name: 'Español', flag: 'es', flagEmoji: '🇪🇸' },
      'ko': { name: '한국어', flag: 'kr', flagEmoji: '🇰🇷' },
      'ja': { name: '日本語', flag: 'jp', flagEmoji: '🇯🇵' }
    };
    
    this.ipLanguageMap = {
      'DE': 'de', 'AT': 'de', 'CH': 'de',
      'SE': 'sv',
      'NO': 'no',
      'FI': 'fi',
      'IT': 'it',
      'FR': 'fr', 'BE': 'fr', 'CA': 'fr',
      'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'CL': 'es',
      'KR': 'ko',
      'JP': 'ja',
      'US': 'en', 'GB': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en'
    };
  }

  async init() {
    const savedLang = localStorage.getItem('Haltrovex_language');
    if (savedLang && this.supportedLanguages[savedLang]) {
      this.currentLang = savedLang;
    } else {
      await this.detectLanguageByIP();
    }
    await this.loadTranslations(this.currentLang);
    this.applyTranslations();
    this.setupLanguageSelector();
    document.documentElement.lang = this.currentLang;
  }

  async detectLanguageByIP() {
    try {
      const response = await fetch('https://cloudflare.com/cdn-cgi/trace');
      const text = await response.text();
      const lines = text.split('\n');
      const locLine = lines.find(line => line.startsWith('loc='));
      const countryCode = locLine ? locLine.split('=')[1] : null;
      
      if (countryCode && this.ipLanguageMap[countryCode]) {
        this.currentLang = this.ipLanguageMap[countryCode];
        console.log('Language detected by IP:', countryCode, '->', this.currentLang);
      } else {
        const browserLang = navigator.language.split('-')[0];
        if (this.supportedLanguages[browserLang]) {
          this.currentLang = browserLang;
          console.log('Language detected by browser:', browserLang);
        }
      }
    } catch (error) {
      console.error('IP detection failed:', error);
      const browserLang = navigator.language.split('-')[0];
      if (this.supportedLanguages[browserLang]) {
        this.currentLang = browserLang;
        console.log('Fallback to browser language:', browserLang);
      }
    }
  }

  async loadTranslations(lang) {
    try {
      console.log('Loading translations for:', lang);
      const response = await fetch(`/i18n/${lang}.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.translations = await response.json();
      console.log('Translations loaded successfully for:', lang);
    } catch (error) {
      console.error('Failed to load translations for', lang, error);
      if (lang !== 'en') {
        console.log('Falling back to English');
        const response = await fetch('/i18n/en.json');
        this.translations = await response.json();
      }
    }
  }

  applyTranslations() {
    const t = this.translations;
    console.log('Applying translations. Current lang:', this.currentLang, 'Translations loaded:', !!t);
    if (!t) {
      console.error('No translations loaded!');
      return;
    }
    
    // Meta tags
    if (t.meta) {
      document.title = t.meta.title;
      this.updateMetaTag('description', t.meta.description);
      this.updateMetaTag('keywords', t.meta.keywords);
    }

    // Data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const trans = this.getNestedTranslation(key);
      if (trans) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = trans;
        } else {
          el.textContent = trans;
        }
      }
    });
    
    // Hero section
    this.updateText('.hero-left h1', t.hero?.title);
    const heroP = document.querySelector('.hero-left p');
    if (heroP && !heroP.classList.contains('brand-info')) heroP.textContent = t.hero?.subtitle;
    
    const brandLink = document.querySelector('.brand-info a');
    const brandHref = brandLink ? brandLink.href : 'https://haltrovex-official.org';
    this.updateHTML('.brand-info', `${t.hero?.brandInfo} <a href="${brandHref}" style="color: #5B8FF9; text-decoration: none; font-weight: 600;">${brandHref}</a>`);
    
    const excellent = document.querySelector('.hero-left span[style*="font-weight: 700"]');
    if (excellent && excellent.textContent.includes('Excellent')) excellent.textContent = t.hero?.excellent;
    
    // Form
    this.updateText('.hero-form h3', t.form?.heading);
    this.updatePlaceholder('input[placeholder*="Name"]', 0, t.form?.firstName);
    this.updatePlaceholder('input[placeholder*="Name"]', 1, t.form?.lastName);
    this.updatePlaceholder('input[placeholder*="Email"]', 0, t.form?.email);
    this.updatePlaceholder('input[type="tel"]', 0, t.form?.phone);
    this.updateText('.btn-submit-hero', t.form?.submit);
    this.updateText('.form-security', `🔒 ${t.form?.security}`);
    this.updateText('.form-disclaimer', t.form?.disclaimer);
    
    // AI Tools
    const aiTitle = document.querySelector('.ai-tools-title');
    if (aiTitle) {
      const pinkSpan = aiTitle.querySelector('.text-gradient-pink');
      if (pinkSpan) {
        aiTitle.childNodes[0].textContent = t.aiTools?.title + ' ';
        pinkSpan.textContent = t.aiTools?.titleHighlight;
      }
    }
    this.updateText('.ai-tools-description', t.aiTools?.description);
    
    const aiCards = document.querySelectorAll('.ai-tool-card');
    if (aiCards[0]) {
      this.updateText(aiCards[0].querySelector('h3'), t.aiTools?.tool1Title);
      this.updateText(aiCards[0].querySelector('p'), t.aiTools?.tool1Desc);
    }
    if (aiCards[1]) {
      this.updateText(aiCards[1].querySelector('h3'), t.aiTools?.tool2Title);
      this.updateText(aiCards[1].querySelector('p'), t.aiTools?.tool2Desc);
    }
    if (aiCards[2]) {
      this.updateText(aiCards[2].querySelector('h3'), t.aiTools?.tool3Title);
      this.updateText(aiCards[2].querySelector('p'), t.aiTools?.tool3Desc);
    }
    
    // Dashboard
    const dashTitle = document.querySelector('.dashboard-title');
    if (dashTitle) {
      const blueSpan = dashTitle.querySelector('.text-blue');
      if (blueSpan) {
        dashTitle.childNodes[0].textContent = t.dashboard?.title + ' ';
        blueSpan.textContent = t.dashboard?.titleHighlight;
      }
    }
    const dashTexts = document.querySelectorAll('.dashboard-text');
    if (dashTexts[0]) dashTexts[0].textContent = t.dashboard?.text1;
    if (dashTexts[1]) dashTexts[1].textContent = t.dashboard?.text2;
    this.updateText('.btn-begin-journey', t.dashboard?.beginJourney);
    this.updateText('.live-text', t.dashboard?.liveTrading);
    this.updateText('.profit-badge', t.dashboard?.profit);
    this.updateText('.price-change', t.dashboard?.priceChange);
    this.updateText('.market-status', `• ${t.dashboard?.marketOpen}`);
    this.updateText('.btn-hold', t.dashboard?.holdRecommendation);
    
    // Mastery
    this.updateText('.mastery-subtitle', t.mastery?.subtitle);
    this.updateText('.mastery-title', t.mastery?.title);
    const steps = document.querySelectorAll('.step-circle');
    if (steps[0]) {
      this.updateText(steps[0].querySelector('.step-title'), t.mastery?.step1Title);
      this.updateText(steps[0].querySelector('.step-description'), t.mastery?.step1Desc);
    }
    if (steps[1]) {
      this.updateText(steps[1].querySelector('.step-title'), t.mastery?.step2Title);
      this.updateText(steps[1].querySelector('.step-description'), t.mastery?.step2Desc);
    }
    if (steps[2]) {
      this.updateText(steps[2].querySelector('.step-title'), t.mastery?.step3Title);
      this.updateText(steps[2].querySelector('.step-description'), t.mastery?.step3Desc);
    }
    const masteryP = document.querySelectorAll('.mastery-description p');
    if (masteryP[0]) masteryP[0].textContent = t.mastery?.description1;
    if (masteryP[1]) masteryP[1].textContent = t.mastery?.description2;
    
    // Reviews
    const reviewsTitle = document.querySelector('.traders-reviews-section .section-title');
    if (reviewsTitle) reviewsTitle.textContent = t.reviews?.title;
    this.updateText('.join-text', t.reviews?.joinText);
    this.updateText('.btn-join-now', t.reviews?.joinNow);
    
    // Countdown
    this.updateText('.countdown-badge', `⚡ ${t.countdown?.badge}`);
    this.updateText('.countdown-title', t.countdown?.title);
    this.updateText('.countdown-subtitle', t.countdown?.subtitle);
    const countdownLabels = document.querySelectorAll('.countdown-label');
    if (countdownLabels[0]) countdownLabels[0].textContent = t.countdown?.days?.toUpperCase();
    if (countdownLabels[1]) countdownLabels[1].textContent = t.countdown?.hours?.toUpperCase();
    if (countdownLabels[2]) countdownLabels[2].textContent = t.countdown?.minutes?.toUpperCase();
    if (countdownLabels[3]) countdownLabels[3].textContent = t.countdown?.seconds?.toUpperCase();
    const claimBtn = document.querySelector('.btn-claim-bonus');
    if (claimBtn) claimBtn.innerHTML = `${t.countdown?.claimBonus} 🚀`;
    this.updateText('.spots-remaining', `⚠️ ${t.countdown?.spotsRemaining}`);
    
    // Certification
    this.updateText('.certification-text h3', t.certification?.title);
    this.updateText('.certification-text p', t.certification?.description);
    const viewCertBtn = document.querySelector('.btn-view-cert');
    if (viewCertBtn) viewCertBtn.innerHTML = `${t.certification?.viewCertificate} <span class="cert-icon">📜</span>`;
    this.updateText('.btn-hide-cert', t.certification?.hideDetails);
    
    // Language selector
    const langButton = document.querySelector('.lang-selector');
    if (langButton) {
      const lang = this.supportedLanguages[this.currentLang];
      langButton.innerHTML = `
        <img src="https://flagcdn.com/w40/${lang.flag}.png" 
             alt="${lang.name}" 
             style="width: 20px; height: 15px; object-fit: cover; border-radius: 2px;">
        ${lang.name} ▼
      `;
    }
  }

  updateText(selector, text) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el && text) el.textContent = text;
  }
  
  updateHTML(selector, html) {
    const el = document.querySelector(selector);
    if (el && html) el.innerHTML = html;
  }
  
  updatePlaceholder(selector, index, text) {
    const els = document.querySelectorAll(selector);
    if (els[index] && text) els[index].placeholder = text;
  }

  getNestedTranslation(key) {
    const keys = key.split('.');
    let value = this.translations;
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return null;
      }
    }
    return value;
  }

  updateMetaTag(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (meta) meta.setAttribute('content', content);
  }

  setupLanguageSelector() {
    const langButton = document.querySelector('.lang-selector');
    if (!langButton) return;

    const dropdown = document.createElement('div');
    dropdown.style.cssText = `
      position: absolute; top: 100%; right: 0; margin-top: 0.5rem;
      background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      padding: 0.5rem; display: none; z-index: 1000; min-width: 200px;
    `;

    console.log('Setting up language selector with flags:', this.supportedLanguages);
    Object.entries(this.supportedLanguages).forEach(([code, lang]) => {
      const option = document.createElement('button');
      option.style.cssText = `
        display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem;
        width: 100%; border: none; background: ${code === this.currentLang ? '#E8EAF6' : 'transparent'};
        border-radius: 8px; cursor: pointer; font-size: 0.95rem; transition: background 0.2s;
        text-align: left;
      `;
      option.innerHTML = `
        <img src="https://flagcdn.com/w40/${lang.flag}.png" 
             alt="${lang.name}" 
             style="width: 24px; height: 18px; object-fit: cover; border-radius: 2px;">
        <span style="font-weight: 500;">${lang.name}</span>
      `;
      console.log(`Adding language option: ${code} - flag:${lang.flag} ${lang.name}`);
      
      option.addEventListener('mouseenter', () => {
        if (code !== this.currentLang) option.style.background = '#F5F7FA';
      });
      option.addEventListener('mouseleave', () => {
        if (code !== this.currentLang) option.style.background = 'transparent';
      });
      option.addEventListener('click', () => {
        this.switchLanguage(code);
        dropdown.style.display = 'none';
      });
      dropdown.appendChild(option);
    });

    langButton.parentElement.style.position = 'relative';
    langButton.parentElement.appendChild(dropdown);
    langButton.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', () => dropdown.style.display = 'none');
  }

  async switchLanguage(lang) {
    if (!this.supportedLanguages[lang]) return;
    this.currentLang = lang;
    localStorage.setItem('Haltrovex_language', lang);
    await this.loadTranslations(lang);
    this.applyTranslations();
    document.documentElement.lang = lang;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18n();
    window.i18n.init();
  });
} else {
  window.i18n = new I18n();
  window.i18n.init();
}