(() => {
  const container = document.getElementById('ProductGridContainer');
  if (!container || !('IntersectionObserver' in window) || !window.fetch) return;

  const instances = new WeakMap();

  const getNextUrl = (scope) => scope.querySelector('.pagination__item--prev')?.href || '';

  const setup = () => {
    const scope = container.querySelector('[data-infinite-scroll]');
    if (!scope || instances.has(scope)) return;

    const grid = scope.querySelector('#product-grid');
    const sentinel = scope.querySelector('[data-infinite-scroll-sentinel]');
    if (!grid || !sentinel) return;

    let nextUrl = getNextUrl(scope);
    if (!nextUrl) {
      sentinel.remove();
      return;
    }

    let loading = false;
    let observer;
    const status = sentinel.querySelector('[data-infinite-scroll-status]');

    const fail = () => {
      loading = false;
      observer?.disconnect();
      scope.classList.remove('is-enhanced');
      sentinel.classList.remove('is-loading');
      if (status) status.textContent = 'Unable to load more products.';
    };

    const loadNextPage = async () => {
      if (loading || !nextUrl) return;
      loading = true;
      sentinel.classList.add('is-loading');
      if (status) status.textContent = 'Loading more products';

      try {
        const requestUrl = new URL(nextUrl, window.location.origin);
        requestUrl.searchParams.set('section_id', grid.dataset.id);

        const response = await fetch(requestUrl.toString());
        if (!response.ok) throw new Error(`Collection request failed: ${response.status}`);

        const html = await response.text();
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const incomingGrid = parsed.querySelector('#product-grid');
        if (!incomingGrid) throw new Error('Product grid missing from collection response');

        const fragment = document.createDocumentFragment();
        incomingGrid.querySelectorAll(':scope > .grid__item').forEach((item) => fragment.appendChild(item));
        grid.appendChild(fragment);

        const incomingPagination = parsed.querySelector('.pagination-wrapper');
        const currentPagination = scope.querySelector('.pagination-wrapper');
        if (incomingPagination && currentPagination) currentPagination.replaceWith(incomingPagination);
        else currentPagination?.remove();

        nextUrl = getNextUrl(scope);
        loading = false;
        sentinel.classList.remove('is-loading');

        if (!nextUrl) {
          observer.disconnect();
          sentinel.remove();
          return;
        }

        if (status) status.textContent = '';
      } catch (error) {
        console.error('[Infinite scroll]', error);
        fail();
      }
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadNextPage();
      },
      { rootMargin: '600px 0px' },
    );

    scope.classList.add('is-enhanced');
    observer.observe(sentinel);
    instances.set(scope, observer);
  };

  const gridObserver = new MutationObserver(setup);
  gridObserver.observe(container, { childList: true, subtree: true });

  setup();
  document.addEventListener('shopify:section:load', setup);
})();
