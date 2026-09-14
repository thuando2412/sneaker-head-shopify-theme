if (!customElements.get('sneaker-home-hero')) {
  customElements.define('sneaker-home-hero', class extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('[data-hero-track]');
      this.slides = [...this.querySelectorAll('[data-hero-slide]')];
      this.dots = [...this.querySelectorAll('[data-hero-dot]')];
      this.index = 0;
      this.querySelector('[data-hero-prev]')?.addEventListener('click', () => this.go(this.index - 1, true));
      this.querySelector('[data-hero-next]')?.addEventListener('click', () => this.go(this.index + 1, true));
      this.dots.forEach((dot, index) => dot.addEventListener('click', () => this.go(index, true)));
      this.addEventListener('mouseenter', () => this.stopTimer());
      this.addEventListener('mouseleave', () => this.startTimer());
      this.addEventListener('focusin', () => this.stopTimer());
      this.addEventListener('focusout', event => { if (!this.contains(event.relatedTarget)) this.startTimer(); });
      this.track?.addEventListener('scroll', () => {
        if (matchMedia('(max-width: 767px)').matches) {
          const index = Math.round(this.track.scrollLeft / Math.max(1, this.track.clientWidth));
          if (index !== this.index) this.setState(index);
        }
      }, { passive:true });
      this.setState(0);
      this.startTimer();
    }
    disconnectedCallback() { this.stopTimer(); }
    startTimer() {
      if (this.timer || this.dataset.autoplay !== 'true' || matchMedia('(prefers-reduced-motion: reduce)').matches || this.slides.length < 2) return;
      this.timer = setInterval(() => this.go(this.index + 1), Number(this.dataset.interval || 6000));
    }
    stopTimer() { clearInterval(this.timer); this.timer = null; }
    setState(index) {
      this.index = (index + this.slides.length) % this.slides.length;
      this.dots.forEach((dot, i) => dot.setAttribute('aria-current', i === this.index ? 'true' : 'false'));
      this.slides.forEach((slide, i) => {
        const hidden = i !== this.index;
        slide.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        if (!matchMedia('(max-width:767px)').matches) slide.inert = hidden;
        else slide.inert = false;
      });
    }
    go(index, resetTimer = false) {
      if (!this.slides.length) return;
      const target = (index + this.slides.length) % this.slides.length;
      this.setState(target);
      if (matchMedia('(max-width:767px)').matches) this.track.scrollTo({ left:target * this.track.clientWidth, behavior:'smooth' });
      else this.track.style.transform = `translate3d(-${target * 100}%,0,0)`;
      if (resetTimer && this.timer) { this.stopTimer(); this.startTimer(); }
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
