(() => {
  const mobileMenu = document.querySelector('.mobile-menu');
  if (mobileMenu) {
    const mobileMenuSummary = mobileMenu.querySelector('summary');
    const mobileMenuNav = mobileMenu.querySelector('nav');
    mobileMenuNav.id = 'mobile-navigation';
    mobileMenuSummary.setAttribute('role', 'button');
    mobileMenuSummary.setAttribute('aria-controls', mobileMenuNav.id);
    mobileMenuSummary.setAttribute('aria-expanded', 'false');

    const closeMobileMenu = (restoreFocus = false) => {
      if (!mobileMenu.open) return;
      mobileMenu.open = false;
      mobileMenuSummary.setAttribute('aria-expanded', 'false');
      if (restoreFocus) mobileMenuSummary.focus();
    };

    mobileMenu.addEventListener('toggle', () => {
      mobileMenuSummary.setAttribute('aria-expanded', String(mobileMenu.open));
    });

    mobileMenuNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeMobileMenu());
    });

    document.addEventListener('pointerdown', (event) => {
      if (mobileMenu.open && !mobileMenu.contains(event.target)) closeMobileMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileMenu.open) closeMobileMenu(true);
    });

    const desktopViewport = window.matchMedia('(min-width: 1051px)');
    const handleViewportChange = (event) => {
      if (event.matches) closeMobileMenu();
    };
    if (desktopViewport.addEventListener) {
      desktopViewport.addEventListener('change', handleViewportChange);
    } else {
      desktopViewport.addListener(handleViewportChange);
    }
  }

  const heroHeading = document.querySelector('.hero-copy h1');
  const heroSuffixes = ['持续互动的入口', '继续跟进的线索', '反复触达的客户'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (heroHeading) {
    heroHeading.setAttribute(
      'aria-label',
      '让一次触碰，变成持续互动的入口、继续跟进的线索和反复触达的客户'
    );
    if (!heroHeading.querySelector('.hero-type-text')) {
      heroHeading.innerHTML = `
        <span class="hero-type-prefix">让一次触碰，变成</span>
        <span class="hero-type-line" aria-hidden="true">
          <em class="hero-type-text">持续互动的入口</em><span class="hero-type-caret"></span>
        </span>
      `;
    }

    const typeTarget = heroHeading.querySelector('.hero-type-text');
    let suffixIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let typeTimer;
    let initialized = false;

    const renderStaticType = () => {
      window.clearTimeout(typeTimer);
      typeTarget.textContent = heroSuffixes[0];
    };

    const runTypewriter = () => {
      const currentCharacters = Array.from(heroSuffixes[suffixIndex]);

      if (!deleting) {
        characterIndex += 1;
        typeTarget.textContent = currentCharacters.slice(0, characterIndex).join('');

        if (characterIndex === currentCharacters.length) {
          deleting = true;
          typeTimer = window.setTimeout(runTypewriter, 1700);
          return;
        }

        typeTimer = window.setTimeout(runTypewriter, 105);
        return;
      }

      characterIndex -= 1;
      typeTarget.textContent = currentCharacters.slice(0, characterIndex).join('');

      if (characterIndex === 0) {
        deleting = false;
        suffixIndex = (suffixIndex + 1) % heroSuffixes.length;
        typeTimer = window.setTimeout(runTypewriter, 320);
        return;
      }

      typeTimer = window.setTimeout(runTypewriter, 55);
    };

    const syncTypewriterMotion = () => {
      window.clearTimeout(typeTimer);
      if (reducedMotion.matches) {
        renderStaticType();
        return;
      }
      if (!initialized && typeTarget.textContent.trim()) {
        initialized = true;
        suffixIndex = 0;
        characterIndex = Array.from(heroSuffixes[0]).length;
        deleting = true;
        typeTimer = window.setTimeout(runTypewriter, 1700);
        return;
      }
      initialized = true;
      suffixIndex = 0;
      characterIndex = 0;
      deleting = false;
      typeTarget.textContent = '';
      runTypewriter();
    };

    syncTypewriterMotion();
    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', syncTypewriterMotion);
    } else {
      reducedMotion.addListener(syncTypewriterMotion);
    }
  }

  const heroVisual = document.querySelector('.hero-brand-visual');

  if (heroVisual) {
    heroVisual.className = 'hero-brand-visual hero-device-scene';
    heroVisual.setAttribute('aria-hidden', 'true');
    heroVisual.innerHTML = `
      <div class="hero-scene-glow"></div>
      <div class="nfc-puck">
        <div class="nfc-puck-edge"></div>
        <div class="nfc-puck-face">
          <div class="nfc-mark" aria-hidden="true">
            <i></i><i></i><i></i>
          </div>
          <span class="nfc-label">AirTouch</span>
        </div>
        <div class="nfc-contact-rings"><i></i><i></i><i></i></div>
      </div>
      <div class="demo-phone">
        <div class="demo-phone-shell">
          <span class="demo-phone-button"></span>
          <div class="demo-phone-screen">
            <div class="demo-phone-island"></div>
            <div class="demo-screen-default demo-system-home">
              <div class="demo-system-status"><b>09:41</b><span><i></i><i></i><i></i></span></div>
              <div class="demo-home-widget">
                <small>7月26日 · 星期日</small>
                <strong>26°</strong>
                <span>杭州 · 晴</span>
              </div>
              <div class="demo-app-grid">
                <i></i><i></i><i></i><i></i>
                <i></i><i></i><i></i><i></i>
              </div>
              <div class="demo-home-dock"><i></i><i></i><i></i><i></i></div>
            </div>
            <div class="demo-screen-website">
              <div class="demo-browser-bar"><i></i><span>brand.cn</span><b></b></div>
              <div class="demo-web-header"><span><i></i>品牌官网</span><b></b></div>
              <div class="demo-web-hero">
                <small>欢迎访问</small>
                <strong>企业服务中心</strong>
                <span>产品介绍 · 专属权益 · 在线咨询</span>
                <button type="button">立即了解</button>
              </div>
              <div class="demo-web-cards"><i></i><i></i><i></i></div>
              <div class="demo-web-row"><i></i><span></span></div>
              <div class="demo-web-row"><i></i><span></span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-demo-status" aria-hidden="true">
        <span></span><b>触碰</b><i></i><b>识别</b><i></i><b>打开页面</b>
      </div>
    `;
  }

  const materials = [{"label": "手环", "title": "戴在手上，离开现场也能继续互动", "text": "适合企业活动、园区服务和会员运营，让一次到场转化为后续触达。", "image": "assets/images/product-wristband.webp", "alt": "蓝色 AirTouch 碰一碰手环", "position": "center 54%"}, {"label": "冰箱贴", "title": "文创被带回家，营销触点也被带走", "text": "承接导览、剧情任务和文创推荐，让游客离开景区后仍能继续触碰。", "image": "assets/images/product-tourism-fridge-magnet.webp", "alt": "带有 AirTouch 标识的江南园林冰箱贴", "position": "56% center"}, {"label": "挂件", "title": "随身携带，让品牌拥有高频触达机会", "text": "适合会员身份、活动凭证和售后服务，把品牌入口放进用户的随身物品。", "image": "assets/images/product-keychain.webp", "alt": "银色 AirTouch 碰一碰钥匙扣挂件", "position": "center 55%"}, {"label": "名片", "title": "一次交换，承接完整的商务信息", "text": "碰一下打开个人介绍、企业资料和业务助手，内容随时更新，不必反复印刷新名片。", "image": "assets/images/product-business-card.webp", "alt": "放置在木桌上的 AirTouch 智能名片", "position": "center 61%"}];
  const root = document.getElementById('materialTabs');
  const image = document.getElementById('materialImage');
  const counter = document.getElementById('materialCounter');
  const title = document.getElementById('materialTitle');
  const text = document.getElementById('materialText');
  const tablist = document.getElementById('materialTablist');
  let active = 0;
  let paused = false;
  let timer;

  materials.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', 'material-panel');
    button.innerHTML = '<span>' + String(index + 1).padStart(2, '0') + '</span>' + item.label;
    button.addEventListener('click', () => { active = index; render(); restart(); });
    tablist.appendChild(button);
  });

  function render() {
    const item = materials[active];
    image.src = item.image;
    image.alt = item.alt;
    image.style.objectPosition = item.position;
    counter.textContent = String(active + 1).padStart(2, '0') + ' / ' + String(materials.length).padStart(2, '0');
    title.textContent = item.title;
    text.textContent = item.text;
    [...tablist.children].forEach((button, index) => {
      const selected = index === active;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', String(selected));
    });
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(() => {
      if (!paused) { active = (active + 1) % materials.length; render(); }
    }, 4200);
  }

  root.addEventListener('mouseenter', () => paused = true);
  root.addEventListener('mouseleave', () => paused = false);
  root.addEventListener('focusin', () => paused = true);
  root.addEventListener('focusout', () => paused = false);
  render();
  restart();

  function initTabs(tablistSelector, panelSelector) {
    const tablist = document.querySelector(tablistSelector);
    if (!tablist) return;
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const panels = [...document.querySelectorAll(panelSelector)];
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        tabs.forEach((item, itemIndex) => {
          const selected = itemIndex === index;
          item.classList.toggle('is-active', selected);
          item.setAttribute('aria-selected', String(selected));
          panels[itemIndex].hidden = !selected;
        });
      });
    });
  }

  initTabs('.scenario-tablist', '.scenario-stage');
  initTabs('.case-tablist', '.case-stage');

  const leadForm = document.getElementById('leadForm');
  const leadFormStatus = document.getElementById('leadFormStatus');
  const leadSubmitButton = leadForm.querySelector('button[type="submit"]');
  const formFeedbackModal = document.getElementById('formFeedbackModal');
  const feedbackClose = document.getElementById('feedbackClose');
  let feedbackReturnFocus = null;

  const openFeedback = () => {
    feedbackReturnFocus = document.activeElement;
    formFeedbackModal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => feedbackClose.focus());
  };

  const closeFeedback = () => {
    formFeedbackModal.hidden = true;
    document.body.style.overflow = '';
    if (feedbackReturnFocus && typeof feedbackReturnFocus.focus === 'function') {
      feedbackReturnFocus.focus();
    }
  };

  feedbackClose.addEventListener('click', closeFeedback);
  formFeedbackModal.addEventListener('click', (event) => {
    if (event.target === formFeedbackModal) closeFeedback();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !formFeedbackModal.hidden) closeFeedback();
  });

  leadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!leadForm.reportValidity() || leadSubmitButton.disabled) return;
    const data = new FormData(leadForm);
    const payload = {
      company: String(data.get('company') || '').trim(),
      name: String(data.get('name') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      scenario: String(data.get('scenario') || '').trim(),
      message: String(data.get('message') || '').trim(),
      source: window.location.href.slice(0, 500),
      requestId: window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
    };

    leadSubmitButton.disabled = true;
    leadSubmitButton.textContent = '正在提交…';
    leadFormStatus.className = 'lead-form-status';
    leadFormStatus.textContent = '正在为你提交需求，请稍候。';

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || '提交失败');

      leadForm.reset();
      leadFormStatus.className = 'lead-form-status is-success';
      leadFormStatus.textContent = '提交成功。';
      openFeedback();
    } catch (error) {
      leadFormStatus.className = 'lead-form-status is-error';
      leadFormStatus.textContent = '暂时未能提交，请稍后重试，或直接拨打 152 9558 8650。';
    } finally {
      leadSubmitButton.disabled = false;
      leadSubmitButton.innerHTML = '提交需求 <span aria-hidden="true">↗</span>';
    }
  });
})();