if (!customElements.get('sneaker-home-hero')) {
  customElements.define('sneaker-home-hero', class extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('[data-hero-track]');
      this.slides = [...this.querySelectorAll('[data-hero-slide]')];
      this.dots = [...this.querySelectorAll('[data-hero-dot]')];
      this.previous = this.querySelector('[data-hero-prev]');
      this.next = this.querySelector('[data-hero-next]');
      this.autoplay = this.querySelector('[data-hero-autoplay]');
      this.progress = this.querySelector('[data-hero-progress]');
      this.interval = Number(this.dataset.interval || 10000);
      this.remaining = this.interval;
      this.index = 0;
      this.userPaused = false;
      this.environmentPaused = false;
      this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
      this.previous?.addEventListener('click', () => this.go(this.index - 1, { manual:true }));
      this.next?.addEventListener('click', () => this.go(this.index + 1, { manual:true }));
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.go(index, { manual:true }));
        dot.addEventListener('keydown', event => this.onDotKeydown(event, index));
      });
      this.autoplay?.addEventListener('click', () => this.toggleAutoplay());
      this.track?.addEventListener('pointerdown', event => {
        if (event.pointerType === 'touch') this.pauseFromInteraction();
      }, { passive:true });
      this.track?.addEventListener('scroll', () => {
        if (matchMedia('(max-width: 767px)').matches) {
          const index = Math.round(this.track.scrollLeft / Math.max(1, this.track.clientWidth));
          if (index !== this.index) this.setState(index);
        }
      }, { passive:true });
      this.onVisibilityChange = () => {
        this.environmentPaused = document.hidden || !this.isIntersecting;
        this.syncClock();
      };
      this.onReducedMotionChange = () => {
        if (this.reducedMotion.matches) this.remaining = this.interval;
        this.syncClock();
      };
      document.addEventListener('visibilitychange', this.onVisibilityChange);
      this.reducedMotion.addEventListener?.('change', this.onReducedMotionChange);
      this.intersectionObserver = new IntersectionObserver(entries => {
        this.isIntersecting = entries[0]?.isIntersecting ?? true;
        this.onVisibilityChange();
      }, { threshold:.15 });
      this.isIntersecting = true;
      this.intersectionObserver.observe(this);
      this.setState(0);
      this.syncClock();
    }
    disconnectedCallback() {
      this.stopClock();
      this.intersectionObserver?.disconnect();
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
      this.reducedMotion?.removeEventListener?.('change', this.onReducedMotionChange);
    }
    canRun() {
      return this.dataset.autoplay === 'true' && this.slides.length > 1 && !this.userPaused && !this.environmentPaused && !this.reducedMotion.matches;
    }
    syncClock() {
      if (this.canRun()) this.startClock();
      else this.stopClock();
      this.updateAutoplayControl();
    }
    startClock() {
      if (this.frame) return;
      this.lastTimestamp = performance.now();
      const tick = timestamp => {
        const elapsed = Math.max(0, timestamp - this.lastTimestamp);
        this.lastTimestamp = timestamp;
        this.remaining -= elapsed;
        if (this.remaining <= 0) {
          this.remaining = this.interval;
          this.go(this.index + 1, { autoplay:true });
        }
        this.updateProgress();
        this.frame = requestAnimationFrame(tick);
      };
      this.frame = requestAnimationFrame(tick);
    }
    stopClock() {
      cancelAnimationFrame(this.frame);
      this.frame = null;
      this.lastTimestamp = null;
      this.updateProgress();
    }
    pauseFromInteraction() {
      this.userPaused = true;
      this.syncClock();
    }
    toggleAutoplay() {
      if (this.reducedMotion.matches || this.dataset.autoplay !== 'true') return;
      this.userPaused = !this.userPaused;
      this.syncClock();
    }
    updateProgress() {
      if (!this.progress) return;
      const elapsedRatio = Math.min(1, Math.max(0, 1 - (this.remaining / this.interval)));
      this.progress.style.strokeDashoffset = String(100 - (elapsedRatio * 100));
    }
    updateAutoplayControl() {
      if (!this.autoplay) return;
      const unavailable = this.dataset.autoplay !== 'true' || this.reducedMotion.matches || this.slides.length < 2;
      const paused = unavailable || this.userPaused;
      this.autoplay.disabled = unavailable;
      this.autoplay.dataset.paused = paused ? 'true' : 'false';
      this.autoplay.setAttribute('aria-pressed', paused ? 'true' : 'false');
      this.autoplay.setAttribute('aria-label', unavailable ? 'Autoplay unavailable' : (paused ? 'Play autoplay' : 'Pause autoplay'));
    }
    setState(index) {
      this.index = (index + this.slides.length) % this.slides.length;
      this.dots.forEach((dot, i) => {
        const selected = i === this.index;
        dot.setAttribute('aria-selected', selected ? 'true' : 'false');
        dot.tabIndex = selected ? 0 : -1;
      });
      this.slides.forEach((slide, i) => {
        const hidden = i !== this.index;
        slide.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        if (!matchMedia('(max-width:767px)').matches) slide.inert = hidden;
        else slide.inert = false;
      });
      if (this.previous) this.previous.disabled = this.index === 0;
      if (this.next) this.next.disabled = this.index === this.slides.length - 1;
    }
    go(index, { manual = false, autoplay = false } = {}) {
      if (!this.slides.length) return;
      if (manual) this.pauseFromInteraction();
      const target = autoplay
        ? (index + this.slides.length) % this.slides.length
        : Math.max(0, Math.min(this.slides.length - 1, index));
      this.setState(target);
      if (matchMedia('(max-width:767px)').matches) this.track.scrollTo({ left:target * this.track.clientWidth, behavior:'smooth' });
      else this.track.style.transform = `translate3d(-${target * 100}%,0,0)`;
      if (autoplay) this.remaining = this.interval;
      this.updateProgress();
    }
    onDotKeydown(event, index) {
      let target = null;
      if (event.key === 'ArrowRight') target = Math.min(this.dots.length - 1, index + 1);
      if (event.key === 'ArrowLeft') target = Math.max(0, index - 1);
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = this.dots.length - 1;
      if (target === null) return;
      event.preventDefault();
      this.go(target, { manual:true });
      this.dots[target]?.focus();
    }
  });
}

if (!customElements.get('sneaker-home-activity')) {
  customElements.define('sneaker-home-activity', class extends HTMLElement {
    connectedCallback() {
      this.tablist = this.querySelector('[data-activity-tabs]');
      this.tabs = [...this.querySelectorAll('[data-activity-tab]')];
      this.cards = [...this.querySelectorAll('[data-activity-card]')];
      this.track = this.querySelector('[data-rail-list]');
      this.rail = this.querySelector('sneaker-home-rail');
      this.tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => this.select(tab.dataset.activityTab));
        tab.addEventListener('keydown', event => this.onKeydown(event, index));
      });
      this.select(this.tabs.find(tab => tab.getAttribute('aria-selected') === 'true')?.dataset.activityTab || 'men', false);
    }
    select(audience, focus = false) {
      const selectedIndex = Math.max(0, this.tabs.findIndex(tab => tab.dataset.activityTab === audience));
      this.tabs.forEach((tab, index) => {
        const selected = index === selectedIndex;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.tabIndex = selected ? 0 : -1;
      });
      this.tablist?.style.setProperty('--sh-tab-index', String(selectedIndex));
      this.cards.forEach(card => {
        const cardAudience = card.dataset.activityAudience || 'men';
        card.hidden = cardAudience !== 'all' && cardAudience !== audience;
      });
      if (this.track) this.track.scrollLeft = 0;
      requestAnimationFrame(() => this.rail?.update?.());
      if (focus) this.tabs[selectedIndex]?.focus();
    }
    onKeydown(event, index) {
      let target = null;
      if (event.key === 'ArrowRight') target = (index + 1) % this.tabs.length;
      if (event.key === 'ArrowLeft') target = (index + this.tabs.length - 1) % this.tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = this.tabs.length - 1;
      if (target === null) return;
      event.preventDefault();
      this.select(this.tabs[target].dataset.activityTab, true);
    }
  });
}

if (!customElements.get('sneaker-home-new-arrivals')) {
  customElements.define('sneaker-home-new-arrivals', class extends HTMLElement {
    connectedCallback() {
      this.tablist = this.querySelector('[data-new-arrivals-tabs]');
      this.tabs = [...this.querySelectorAll('[data-new-arrivals-tab]')];
      this.panels = [...this.querySelectorAll('[data-new-arrivals-panel]')];
      this.tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => this.select(tab.dataset.newArrivalsTab));
        tab.addEventListener('keydown', event => this.onKeydown(event, index));
      });
      this.select(this.tabs.find(tab => tab.getAttribute('aria-selected') === 'true')?.dataset.newArrivalsTab || 'men');
    }
    select(audience, focus = false) {
      const selectedIndex = Math.max(0, this.tabs.findIndex(tab => tab.dataset.newArrivalsTab === audience));
      this.tabs.forEach((tab, index) => {
        const selected = index === selectedIndex;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.tabIndex = selected ? 0 : -1;
      });
      this.tablist?.style.setProperty('--sh-tab-index', String(selectedIndex));
      this.panels.forEach(panel => { panel.hidden = panel.dataset.newArrivalsPanel !== audience; });
      if (focus) this.tabs[selectedIndex]?.focus();
    }
    onKeydown(event, index) {
      let target = null;
      if (event.key === 'ArrowRight') target = (index + 1) % this.tabs.length;
      if (event.key === 'ArrowLeft') target = (index + this.tabs.length - 1) % this.tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = this.tabs.length - 1;
      if (target === null) return;
      event.preventDefault();
      this.select(this.tabs[target].dataset.newArrivalsTab, true);
    }
  });
}

if (!customElements.get('sneaker-home-trending')) {
  customElements.define('sneaker-home-trending', class extends HTMLElement {
    connectedCallback() {
      this.tablist = this.querySelector('[data-trending-tabs]');
      this.tabs = [...this.querySelectorAll('[data-trending-tab]')];
      this.panels = [...this.querySelectorAll('[data-trending-panel]')];
      this.headLinks = [...this.querySelectorAll('[data-trending-head-link]')];
      this.tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => this.select(tab.dataset.trendingTab));
        tab.addEventListener('keydown', event => this.onKeydown(event, index));
      });
      this.select(this.tabs.find(tab => tab.getAttribute('aria-selected') === 'true')?.dataset.trendingTab || 'sneakers');
    }
    select(category, focus = false) {
      const selectedIndex = Math.max(0, this.tabs.findIndex(tab => tab.dataset.trendingTab === category));
      this.tabs.forEach((tab, index) => {
        const selected = index === selectedIndex;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.tabIndex = selected ? 0 : -1;
      });
      this.tablist?.style.setProperty('--sh-tab-index', String(selectedIndex));
      this.panels.forEach(panel => { panel.hidden = panel.dataset.trendingPanel !== category; });
      this.headLinks.forEach(link => { link.hidden = link.dataset.trendingHeadLink !== category; });
      const activePanel = this.panels.find(panel => panel.dataset.trendingPanel === category);
      requestAnimationFrame(() => {
        activePanel?.querySelector('sneaker-home-banner-carousel')?.go?.(0);
        activePanel?.querySelector('sneaker-home-rail')?.update?.();
      });
      if (focus) this.tabs[selectedIndex]?.focus();
    }
    onKeydown(event, index) {
      let target = null;
      if (event.key === 'ArrowRight') target = (index + 1) % this.tabs.length;
      if (event.key === 'ArrowLeft') target = (index + this.tabs.length - 1) % this.tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = this.tabs.length - 1;
      if (target === null) return;
      event.preventDefault();
      this.select(this.tabs[target].dataset.trendingTab, true);
    }
  });
}

if (!customElements.get('sneaker-home-banner-carousel')) {
  customElements.define('sneaker-home-banner-carousel', class extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('[data-banner-track]');
      this.slides = [...this.querySelectorAll('[data-banner-slide]')];
      this.dots = this.querySelector('[data-banner-dots]');
      this.previous = this.querySelector('[data-banner-prev]');
      this.next = this.querySelector('[data-banner-next]');
      this.index = 0;
      this.previous?.addEventListener('click', () => this.go(this.index - 1));
      this.next?.addEventListener('click', () => this.go(this.index + 1));
      this.track?.addEventListener('scroll', () => {
        if (!matchMedia('(max-width:1279px)').matches) return;
        const index = Math.round(this.track.scrollLeft / Math.max(1, this.track.clientWidth));
        if (index !== this.index) this.setState(index);
      }, { passive:true });
      this.buildDots();
      this.setState(0);
    }
    buildDots() {
      if (!this.dots) return;
      this.dots.replaceChildren();
      this.slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to campaign ${index + 1}`);
        dot.addEventListener('click', () => this.go(index));
        this.dots.append(dot);
      });
    }
    setState(index) {
      this.index = Math.max(0, Math.min(this.slides.length - 1, index));
      this.slides.forEach((slide, slideIndex) => {
        const hidden = slideIndex !== this.index;
        slide.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        slide.inert = hidden;
      });
      [...(this.dots?.children || [])].forEach((dot, dotIndex) => dot.setAttribute('aria-current', dotIndex === this.index ? 'true' : 'false'));
      if (this.previous) this.previous.disabled = this.index === 0;
      if (this.next) this.next.disabled = this.index >= this.slides.length - 1;
    }
    go(index) {
      if (!this.slides.length) return;
      this.setState(index);
      if (matchMedia('(max-width:1279px)').matches) this.track?.scrollTo({ left:this.index * this.track.clientWidth, behavior:'smooth' });
      else if (this.track) this.track.style.transform = `translate3d(-${this.index * 100}%,0,0)`;
    }
  });
}

if (!customElements.get('sneaker-complete-look')) {
  customElements.define('sneaker-complete-look', class extends HTMLElement {
    connectedCallback() {
      this.tablist = this.querySelector('[data-look-tabs]');
      this.tabs = [...this.querySelectorAll('[data-look-tab]')];
      this.panels = [...this.querySelectorAll('[data-look-panel]')];
      this.drawer = this.querySelector('[data-bundle-drawer]');
      this.sheet = this.drawer?.querySelector('.sh-bundle-builder__sheet');
      this.body = this.drawer?.querySelector('[data-bundle-body]');
      this.submitButton = this.drawer?.querySelector('[data-bundle-submit]');
      this.error = this.drawer?.querySelector('[data-bundle-error]');
      this.sectionId = this.dataset.sectionId;
      this.activeLook = this.tabs[0]?.dataset.lookTab;
      this.tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => this.select(tab.dataset.lookTab, true));
        tab.addEventListener('keydown', event => this.onTabKeydown(event, index));
      });
      this.querySelectorAll('[data-bundle-open]').forEach(button => button.addEventListener('click', () => this.openBundle(button)));
      this.drawer?.querySelectorAll('[data-bundle-close]').forEach(button => button.addEventListener('click', () => this.closeBundle()));
      this.drawer?.addEventListener('keydown', event => {
        if (event.key === 'Escape') this.closeBundle();
      });
      this.submitButton?.addEventListener('click', () => this.addBundle());
      this.select(this.activeLook);
    }
    select(lookId, focus = false) {
      const selectedIndex = Math.max(0, this.tabs.findIndex(tab => tab.dataset.lookTab === lookId));
      this.activeLook = this.tabs[selectedIndex]?.dataset.lookTab;
      this.tabs.forEach((tab, index) => {
        const selected = index === selectedIndex;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.tabIndex = selected ? 0 : -1;
      });
      this.tablist?.style.setProperty('--sh-tab-index', String(selectedIndex));
      this.panels.forEach(panel => { panel.hidden = panel.dataset.lookPanel !== this.activeLook; });
      if (focus && matchMedia('(max-width:1279px)').matches) this.tabs[selectedIndex]?.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
      if (focus) this.tabs[selectedIndex]?.focus();
    }
    onTabKeydown(event, index) {
      let target = null;
      if (event.key === 'ArrowRight') target = (index + 1) % this.tabs.length;
      if (event.key === 'ArrowLeft') target = (index + this.tabs.length - 1) % this.tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = this.tabs.length - 1;
      if (target === null) return;
      event.preventDefault();
      this.select(this.tabs[target].dataset.lookTab, true);
    }
    openBundle(trigger) {
      const lookId = trigger.dataset.bundleOpen;
      const template = this.querySelector(`template[data-bundle-template="${lookId}"]`);
      if (!template || !this.drawer || !this.body) return;
      this.trigger = trigger;
      this.bundleLookId = lookId;
      this.body.replaceChildren(template.content.cloneNode(true));
      const eyebrow = this.body.querySelector('.sh-bundle-builder__eyebrow');
      if (eyebrow && trigger.dataset.lookGenderLabel) eyebrow.textContent += ` · ${trigger.dataset.lookGenderLabel}`;
      this.body.querySelectorAll('[data-bundle-variant]').forEach(select => {
        const available = [...select.options].filter(option => option.value && !option.disabled);
        if (select.hasAttribute('data-single-variant') || available.length === 1) select.value = available[0]?.value || '';
        select.addEventListener('change', () => this.validateBundle());
      });
      this.showError();
      this.validateBundle();
      this.drawer.hidden = false;
      document.body.classList.add('overflow-hidden');
      this.sheet?.focus();
      if (typeof trapFocus === 'function' && this.sheet) trapFocus(this.sheet, this.sheet.querySelector('[data-bundle-close]') || this.sheet);
    }
    closeBundle() {
      if (!this.drawer || this.drawer.hidden) return;
      this.drawer.hidden = true;
      document.body.classList.remove('overflow-hidden');
      if (typeof removeTrapFocus === 'function') removeTrapFocus(this.trigger);
      else this.trigger?.focus();
    }
    validateBundle() {
      const selects = [...(this.body?.querySelectorAll('[data-bundle-variant]') || [])];
      const valid = selects.length > 0 && selects.every(select => select.value && !select.selectedOptions[0]?.disabled);
      if (this.submitButton) this.submitButton.disabled = !valid;
      return valid;
    }
    showError(message = '') {
      if (!this.error) return;
      this.error.textContent = message;
      this.error.hidden = !message;
    }
    async addBundle() {
      if (!this.validateBundle() || !this.submitButton) return;
      const selects = [...this.body.querySelectorAll('[data-bundle-variant]')];
      const lookLabel = this.body.querySelector('.sh-bundle-builder__eyebrow')?.textContent?.trim() || 'Complete the Look';
      const bundleGroup = `${this.sectionId}-${this.bundleLookId}-${Date.now()}`;
      const items = selects.map(select => ({
        id: Number(select.value),
        quantity: 1,
        properties: {
          '_Complete the Look': lookLabel,
          '_Bundle group': bundleGroup,
        },
      }));
      const cart = document.querySelector('cart-drawer') || document.querySelector('cart-notification');
      const originalLabel = this.submitButton.textContent;
      this.submitButton.disabled = true;
      this.submitButton.setAttribute('aria-busy', 'true');
      this.submitButton.textContent = 'Adding bundle…';
      this.showError();
      try {
        const payload = { items };
        if (cart?.getSectionsToRender) {
          payload.sections = cart.getSectionsToRender().map(section => section.id);
          payload.sections_url = window.location.pathname;
          cart.setActiveElement?.(this.trigger);
        }
        const response = await fetch(window.routes?.cart_add_url || '/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'Accept':'application/json', 'X-Requested-With':'XMLHttpRequest' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok || result.status) throw new Error(result.description || result.message || 'The bundle could not be added.');
        this.closeBundle();
        if (cart?.classList.contains('is-empty')) cart.classList.remove('is-empty');
        if (cart?.renderContents && result.sections) cart.renderContents(result);
        else window.location.assign(window.routes?.cart_url || '/cart');
      } catch (error) {
        this.showError(error.message || 'The bundle could not be added. Please try again.');
      } finally {
        this.submitButton.removeAttribute('aria-busy');
        this.submitButton.textContent = originalLabel;
        this.validateBundle();
      }
    }
  });
}

if (!customElements.get('sneaker-home-rail')) {
  customElements.define('sneaker-home-rail', class extends HTMLElement {
    connectedCallback() {
      this.list = this.querySelector('[data-rail-list]');
      this.progress = this.querySelector('[data-rail-progress]');
      this.count = this.querySelector('[data-rail-count]');
      this.previous = this.querySelector('[data-rail-prev]');
      this.next = this.querySelector('[data-rail-next]');
      this.previous?.addEventListener('click', () => this.scroll(-1));
      this.next?.addEventListener('click', () => this.scroll(1));
      this.list?.addEventListener('scroll', () => this.queueUpdate(), { passive:true });
      this.addEventListener('mouseenter', () => this.stopTimer());
      this.addEventListener('mouseleave', () => this.startTimer());
      this.addEventListener('focusin', () => this.stopTimer());
      this.addEventListener('focusout', event => { if (!this.contains(event.relatedTarget)) this.startTimer(); });
      this.enableDrag();
      this.normalizeInitialOffset();
      this.resizeObserver = new ResizeObserver(() => this.update());
      if (this.list) this.resizeObserver.observe(this.list);
      this.update();
      this.startTimer();
    }
    normalizeInitialOffset() {
      if (!this.list) return;
      requestAnimationFrame(() => {
        if (this.list.scrollLeft > 1) this.list.scrollLeft = 0;
      });
    }
    disconnectedCallback() { this.resizeObserver?.disconnect(); this.stopTimer(); }
    startTimer() {
      if (this.timer || this.dataset.autoplay !== 'true' || this.offsetParent === null || matchMedia('(max-width:767px)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
      const { pages } = this.pageMetrics();
      if (pages < 2) return;
      this.timer = setInterval(() => this.advance(), Number(this.dataset.interval || 5000));
    }
    stopTimer() { clearInterval(this.timer); this.timer = null; }
    advance() {
      if (!this.list) return;
      const { stops } = this.pageMetrics();
      const page = this.pageIndex(stops);
      this.list.scrollTo({ left:page >= stops.length - 1 ? stops[0] : stops[page + 1], behavior:'smooth' });
    }
    pageMetrics() {
      if (!this.list) return { pages:1, stops:[0] };
      const mobile = matchMedia('(max-width:767px)').matches;
      const tablet = !mobile && matchMedia('(max-width:1279px)').matches;
      const pageSize = Number(mobile ? this.dataset.mobilePageSize : (tablet ? (this.dataset.tabletPageSize || this.dataset.desktopPageSize) : this.dataset.desktopPageSize)) || 1;
      const items = [...this.list.children];
      const max = Math.max(0, this.list.scrollWidth - this.list.clientWidth);
      const origin = items[0]?.offsetLeft || 0;
      const stops = [];

      for (let index = 0; index < items.length; index += pageSize) {
        const stop = Math.min(max, Math.max(0, items[index].offsetLeft - origin));
        if (!stops.length || Math.abs(stop - stops[stops.length - 1]) > 1) stops.push(stop);
      }

      if (!stops.length) stops.push(0);
      return { pages:stops.length, stops };
    }
    pageIndex(stops) {
      if (!this.list || stops.length < 2) return 0;
      const left = this.list.scrollLeft;
      let nearest = 0;
      let distance = Math.abs(left - stops[0]);
      for (let index = 1; index < stops.length; index += 1) {
        const nextDistance = Math.abs(left - stops[index]);
        if (nextDistance < distance) {
          nearest = index;
          distance = nextDistance;
        }
      }
      return nearest;
    }
    scroll(direction) {
      if (!this.list) return;
      const { stops } = this.pageMetrics();
      const page = this.pageIndex(stops);
      const target = Math.max(0, Math.min(stops.length - 1, page + direction));
      this.list.scrollTo({ left:stops[target], behavior:'smooth' });
      if (this.dataset.autoplay === 'true') { this.stopTimer(); this.startTimer(); }
    }
    queueUpdate() {
      cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(() => this.update());
    }
    update() {
      if (!this.list) return;
      const { pages, stops } = this.pageMetrics();
      const pageIndex = this.pageIndex(stops);
      const page = pageIndex + 1;
      this.updateProgress(pages, page);
      if (this.count) this.count.textContent = `${page} / ${pages}`;
      if (this.previous) this.previous.disabled = pages <= 1 || pageIndex === 0;
      if (this.next) this.next.disabled = pages <= 1 || pageIndex === pages - 1;
    }
    updateProgress(pages, page) {
      if (!this.progress) return;
      this.progress.style.setProperty('--sh-progress-size', `${100 / pages}%`);
      this.progress.style.setProperty('--sh-progress-x', `${(page - 1) * 100}%`);
      if (this.progress.children.length !== pages || this.progress.dataset.pages !== String(pages)) {
        this.progress.replaceChildren();
        this.progress.dataset.pages = String(pages);
        for (let index = 0; index < pages; index += 1) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'sh-home-rail__dot';
          dot.setAttribute('aria-label', `Go to page ${index + 1}`);
          dot.addEventListener('click', () => {
            const { stops } = this.pageMetrics();
            this.list.scrollTo({ left:stops[Math.min(index, stops.length - 1)], behavior:'smooth' });
            if (this.dataset.autoplay === 'true') { this.stopTimer(); this.startTimer(); }
          });
          this.progress.append(dot);
        }
      }
      [...this.progress.children].forEach((dot, index) => dot.setAttribute('aria-current', index === page - 1 ? 'true' : 'false'));
    }
    enableDrag() {
      if (!this.list) return;
      let pointerId = null, startX = 0, startLeft = 0, moved = false;
      this.list.addEventListener('pointerdown', event => {
        if (event.pointerType === 'touch' || event.button !== 0) return;
        pointerId = event.pointerId;
        startX = event.clientX;
        startLeft = this.list.scrollLeft;
        moved = false;
      });
      this.list.addEventListener('pointermove', event => {
        if (pointerId !== event.pointerId) return;
        const delta = event.clientX - startX;
        if (!moved && Math.abs(delta) > 6) {
          moved = true;
          this.list.setPointerCapture?.(event.pointerId);
        }
        if (!moved) return;
        event.preventDefault();
        this.list.scrollLeft = startLeft - delta;
      });
      this.list.addEventListener('pointerup', event => {
        if (pointerId !== event.pointerId) return;
        if (this.list.hasPointerCapture?.(event.pointerId)) this.list.releasePointerCapture?.(event.pointerId);
        if (moved) {
          const block = click => { click.preventDefault(); click.stopPropagation(); };
          this.list.addEventListener('click', block, { capture:true, once:true });
        }
        pointerId = null;
        moved = false;
      });
      this.list.addEventListener('pointercancel', event => {
        if (pointerId !== event.pointerId) return;
        if (this.list.hasPointerCapture?.(event.pointerId)) this.list.releasePointerCapture?.(event.pointerId);
        pointerId = null;
        moved = false;
      });
    }
  });
}

document.querySelectorAll('[data-countdown-end]').forEach(node => {
  const end = new Date(node.dataset.countdownEnd).getTime();
  if (!Number.isFinite(end)) return;
  const update = () => {
    const left = end - Date.now();
    if (left <= 0) { node.textContent = node.dataset.endedLabel || 'Deal ended'; return; }
    const days = Math.floor(left / 86400000);
    const hours = Math.floor((left % 86400000) / 3600000);
    const mins = Math.floor((left % 3600000) / 60000);
    const secs = Math.floor((left % 60000) / 1000);
    node.textContent = `${days}:${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  };
  update();
  setInterval(update, 1000);
});

const prepareHomepageSecondaryImage = card => {
  const image = card.querySelector('[data-card-secondary-image]');
  if (!image || card.dataset.secondaryPreparing === 'true' || card.dataset.secondaryReady === 'true') return;

  card.dataset.secondaryPreparing = 'true';
  image.loading = 'eager';

  const markReady = () => {
    card.dataset.secondaryPreparing = 'false';
    card.dataset.secondaryReady = 'true';
    if (card.dataset.mediaPointerInside === 'true') card.classList.add('is-media-hovered');
  };

  const decode = () => {
    if (typeof image.decode === 'function') image.decode().then(markReady).catch(markReady);
    else markReady();
  };

  if (image.complete && image.naturalWidth > 0) decode();
  else image.addEventListener('load', decode, { once:true });
};

const homepageSecondaryObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        prepareHomepageSecondaryImage(entry.target);
        homepageSecondaryObserver.unobserve(entry.target);
      });
    }, { rootMargin:'320px 0px' })
  : null;

const initHomepageProductMedia = (root = document) => {
  if (!document.body.classList.contains('template-index')) return;

  root.querySelectorAll('.product-card-wrapper.sh-card--has-secondary').forEach(card => {
    if (card.dataset.mediaHoverReady === 'true') return;
    const media = card.querySelector('.card__inner');
    if (!media) return;

    card.dataset.mediaHoverReady = 'true';
    media.addEventListener('pointerenter', event => {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      card.dataset.mediaPointerInside = 'true';
      if (card.dataset.secondaryReady === 'true') card.classList.add('is-media-hovered');
      else prepareHomepageSecondaryImage(card);
    });
    media.addEventListener('pointerleave', () => {
      card.dataset.mediaPointerInside = 'false';
      card.classList.remove('is-media-hovered');
    });

    if (homepageSecondaryObserver) homepageSecondaryObserver.observe(card);
    else prepareHomepageSecondaryImage(card);
  });
};

initHomepageProductMedia();
document.addEventListener('shopify:section:load', event => initHomepageProductMedia(event.target));
