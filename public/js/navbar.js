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
