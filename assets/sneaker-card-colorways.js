(() => {
  const namespace = (window.SneakerHeadCardColorways = window.SneakerHeadCardColorways || {});

  const initCardColorways =
    namespace.init ||
    ((root = document) => {
      root.querySelectorAll('[data-card-colorway]').forEach((button) => {
        if (button.dataset.colorwayBound === 'true') return;
        button.dataset.colorwayBound = 'true';

        button.addEventListener('pointerdown', (event) => {
          event.stopPropagation();
        });

        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          const card = button.closest('.product-card-wrapper');
          if (!card || button.classList.contains('sh-card-colorways__button--single')) return;

          card.querySelectorAll('[data-card-colorway]').forEach((item) => {
            const isActive = item === button;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-pressed', String(isActive));
          });

          const image = card.querySelector('[data-card-primary-image], .sh-home-deal-card__media img');
          if (image && button.dataset.imageSrc) {
            image.src = button.dataset.imageSrc;
            image.srcset = button.dataset.imageSrcset || '';
            image.alt = button.dataset.productTitle || '';
          }

          const hasSecondaryImage = Boolean(button.dataset.secondaryImageSrc);
          let secondaryImage = card.querySelector('[data-card-secondary-image]');
          if (hasSecondaryImage && !secondaryImage) {
            const media = card.querySelector('.media--hover-effect');
            if (media) {
              secondaryImage = document.createElement('img');
              secondaryImage.className = 'motion-reduce';
              secondaryImage.dataset.cardSecondaryImage = '';
              secondaryImage.loading = 'lazy';
              media.append(secondaryImage);
            }
          }

          if (hasSecondaryImage && secondaryImage) {
            secondaryImage.src = button.dataset.secondaryImageSrc;
            secondaryImage.srcset = button.dataset.secondaryImageSrcset || '';
            secondaryImage.alt = button.dataset.productTitle || '';
          } else if (secondaryImage) {
            secondaryImage.remove();
          }
          card.classList.toggle('sh-card--has-secondary', hasSecondaryImage);
          card.querySelectorAll('.sh-home-deal-card__media').forEach((media) => {
            media.classList.toggle('sh-card--has-secondary', hasSecondaryImage);
          });

          card.querySelectorAll('[data-card-product-link]').forEach((link) => {
            link.href = button.dataset.productUrl;
          });

          card.querySelectorAll('[data-card-product-title]').forEach((node) => {
            node.textContent = button.dataset.productTitle || '';
          });

          card.querySelectorAll('[data-product-url]:not([data-card-colorway])').forEach((control) => {
            control.dataset.productUrl = button.dataset.productUrl;
          });

          card.querySelectorAll('.product-variant-id').forEach((input) => {
            if (button.dataset.productVariantId) input.value = button.dataset.productVariantId;
            input.disabled = button.dataset.productAvailable === 'false';
          });

          card.querySelectorAll('modal-opener[data-modal]').forEach((opener) => {
            const modal = document.querySelector(opener.dataset.modal);
            const modalInfo = modal?.querySelector('.quick-add-modal__content-info');
            if (modalInfo) modalInfo.replaceChildren();
            const dialog = modal?.querySelector('[role="dialog"]');
            if (dialog && button.dataset.productTitle) {
              dialog.setAttribute('aria-label', button.dataset.productTitle);
            }
          });

          const price = card.querySelector('.price');
          if (price && button.dataset.productPrice) {
            const isOnSale = button.dataset.productOnSale === 'true';
            price.classList.toggle('price--on-sale', isOnSale);
            price.querySelectorAll('.price__regular .price-item--regular').forEach((node) => {
              node.textContent = button.dataset.productPrice;
            });
            price.querySelectorAll('.price__sale .price-item--sale').forEach((node) => {
              node.textContent = button.dataset.productPrice;
            });
            price.querySelectorAll('.price__sale .price-item--regular').forEach((node) => {
              node.textContent = button.dataset.productComparePrice || button.dataset.productPrice;
            });
          }

          const availabilityBadge = card.querySelector('[data-card-status-badge]');
          const isAvailable = button.dataset.productAvailable !== 'false';
          const isOnSale = button.dataset.productOnSale === 'true';
          const discount = Number.parseInt(button.dataset.productDiscount || '0', 10);
          if (availabilityBadge) {
            availabilityBadge.hidden = isAvailable && (!isOnSale || discount <= 0);
            availabilityBadge.textContent = !isAvailable ? 'Sold out' : isOnSale && discount > 0 ? `-${discount}%` : '';
            availabilityBadge.classList.toggle('is-sold-out', !isAvailable);
          }

          const savings = card.querySelector('[data-card-savings]');
          if (savings) {
            savings.hidden = !isOnSale || discount <= 0;
            const savingsAmount = savings.querySelector('[data-card-savings-amount]');
            const savingsPercent = savings.querySelector('[data-card-savings-percent]');
            if (savingsAmount) savingsAmount.textContent = button.dataset.productSavings || '';
            if (savingsPercent) savingsPercent.textContent = `${discount}% off`;
          }
          card.querySelectorAll('.sh-home-card-cta').forEach((control) => {
            control.disabled = !isAvailable;
            control.setAttribute('aria-disabled', String(!isAvailable));
            if (control.matches('[type="submit"]')) {
              const label = control.querySelector('span:not(.sold-out-message)');
              if (label) label.textContent = isAvailable ? control.dataset.addToCartText || 'Add to cart' : control.dataset.soldOutText || 'Sold out';
            } else {
              const spinner = control.querySelector('.loading__spinner');
              const labelText = isAvailable ? control.dataset.chooseOptionsText || 'Choose options' : control.dataset.soldOutText || 'Sold out';
              control.childNodes.forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) node.textContent = labelText;
              });
              if (!Array.from(control.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim())) {
                control.insertBefore(document.createTextNode(labelText), spinner || null);
              }
            }
          });

          const dealPrice = card.querySelector('[data-card-deal-price]');
          if (dealPrice && button.dataset.productPrice) {
            const isOnSale = button.dataset.productOnSale === 'true';
            dealPrice.classList.toggle('sh-home-deal-card__price--sale', isOnSale);
            const saleNode = dealPrice.querySelector('[data-card-deal-sale-price]');
            const compareNode = dealPrice.querySelector('[data-card-deal-compare-price]');
            if (saleNode) saleNode.textContent = button.dataset.productPrice;
            if (compareNode) {
              compareNode.textContent = button.dataset.productComparePrice || button.dataset.productPrice;
              compareNode.hidden = !isOnSale;
            }
          }

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
