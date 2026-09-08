(() => {
  const namespace = (window.SneakerHeadCardColorways = window.SneakerHeadCardColorways || {});

  const initCardColorways =
    namespace.init ||
    ((root = document) => {
      root.querySelectorAll('[data-card-colorway]').forEach((button) => {
        if (button.dataset.colorwayReady === 'true') return;
        button.dataset.colorwayReady = 'true';

        button.addEventListener('click', () => {
          const card = button.closest('.product-card-wrapper');
          if (!card || button.classList.contains('sh-card-colorways__button--single')) return;

          card.querySelectorAll('[data-card-colorway]').forEach((item) => {
            const isActive = item === button;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-pressed', String(isActive));
          });

          const image = card.querySelector('[data-card-primary-image]');
          if (image && button.dataset.imageSrc) {
            image.src = button.dataset.imageSrc;
            image.srcset = button.dataset.imageSrcset || '';
            image.alt = button.dataset.productTitle || '';
          }

          const secondaryImage = card.querySelector('[data-card-secondary-image]');
          if (secondaryImage && button.dataset.secondaryImageSrc) {
            secondaryImage.src = button.dataset.secondaryImageSrc;
            secondaryImage.srcset = button.dataset.secondaryImageSrcset || '';
            secondaryImage.alt = button.dataset.productTitle || '';
          }

          card.querySelectorAll('[data-card-product-link]').forEach((link) => {
            link.href = button.dataset.productUrl;
          });

          card.querySelectorAll('[data-product-url]:not([data-card-colorway])').forEach((control) => {
            control.dataset.productUrl = button.dataset.productUrl;
          });

          const title = card.querySelector('[data-card-product-title]');
          if (title && button.dataset.productTitle) title.textContent = button.dataset.productTitle;

          const choiceSummary = card.querySelector('[data-card-choice-summary]');
          if (choiceSummary && button.dataset.choiceSummary) {
            const fullSummary = choiceSummary.querySelector('[data-card-choice-summary-full]');
            const shortSummary = choiceSummary.querySelector('[data-card-choice-summary-short]');
            if (fullSummary) fullSummary.textContent = button.dataset.choiceSummary;
            if (shortSummary) shortSummary.textContent = button.dataset.choiceSummaryShort || button.dataset.choiceSummary;
          }
        });
      });
    });

  namespace.init = initCardColorways;
  initCardColorways();

  if (namespace.listenersReady) return;
  namespace.listenersReady = true;

  document.addEventListener('shopify:section:load', (event) => initCardColorways(event.target));
  document.addEventListener('DOMContentLoaded', () => initCardColorways());

  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) initCardColorways(node);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
