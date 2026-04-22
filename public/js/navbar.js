document.addEventListener('DOMContentLoaded', () => {
  const permissionModal = document.getElementById('permissionModal');

  const showPermissionModal = () => {
    if (permissionModal) {
      permissionModal.classList.add('is-active');
    }
  };

  const closePermissionModal = () => {
    if (permissionModal) {
      permissionModal.classList.remove('is-active');
    }
  };

  const burger = document.querySelector('.navbar-burger');
  if (burger) {
    const menuId = burger.getAttribute('data-target');
    const menu = menuId ? document.getElementById(menuId) : null;

    burger.addEventListener('click', () => {
      burger.classList.toggle('is-active');
      if (menu) {
        menu.classList.toggle('is-active');
      }
    });
  }

  document.querySelectorAll('.js-navbar-dropdown-toggle').forEach((link) => {
    link.addEventListener('click', (event) => {
      const dropdownItem = link.closest('.navbar-item.has-dropdown');
      if (!dropdownItem) {
        return;
      }

      // On desktop, allow navigation to the list page from the main dropdown link.
      const isMobile = window.matchMedia('(max-width: 1023px)').matches;
      if (!isMobile) {
        return;
      }

      // On mobile, first tap opens the dropdown and second tap follows the link.
      if (dropdownItem.classList.contains('is-active')) {
        return;
      }

      event.preventDefault();
      const shouldOpen = !dropdownItem.classList.contains('is-active');

      document.querySelectorAll('.navbar-item.has-dropdown.is-active').forEach((item) => {
        item.classList.remove('is-active');
        const trigger = item.querySelector('.js-navbar-dropdown-toggle');
        if (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
        }
      });

      if (shouldOpen) {
        dropdownItem.classList.add('is-active');
        link.setAttribute('aria-expanded', 'true');
      } else {
        link.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', (event) => {
    const clickedInsideDropdown =
      event.target instanceof Element && event.target.closest('.navbar-item.has-dropdown');
    if (clickedInsideDropdown) {
      return;
    }

    document.querySelectorAll('.navbar-item.has-dropdown.is-active').forEach((item) => {
      item.classList.remove('is-active');
      const trigger = item.querySelector('.js-navbar-dropdown-toggle');
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.querySelectorAll('.js-permission-denied').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      showPermissionModal();
    });
  });

  document.querySelectorAll('.js-close-permission-modal').forEach((element) => {
    element.addEventListener('click', closePermissionModal);
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get('permissionDenied') === '1') {
    showPermissionModal();
    const url = new URL(window.location.href);
    url.searchParams.delete('permissionDenied');
    window.history.replaceState({}, '', url);
  }
});
