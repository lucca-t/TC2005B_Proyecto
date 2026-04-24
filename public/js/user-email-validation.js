/* global document */

document.addEventListener('DOMContentLoaded', () => {
  const emailInputs = document.querySelectorAll(
      'input[type="email"][data-live-email-validate="true"]',
  );

  if (!emailInputs || emailInputs.length === 0) {
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const ensureHelpElement = (input) => {
    const control = input.closest('.control');
    const field = input.closest('.field');
    if (!control || !field) {
      return null;
    }

    let help = field.querySelector('.js-email-validation-help');
    if (!help) {
      help = document.createElement('p');
      help.className = 'help is-danger is-hidden js-email-validation-help';
      help.textContent =
        'Please enter a valid email address (example: name@example.com).';
      control.insertAdjacentElement('afterend', help);
    }

    return help;
  };

  const updateValidationState = (input, help) => {
    const value = (input.value || '').trim();

    if (!value || emailRegex.test(value)) {
      input.classList.remove('is-danger');
      help.classList.add('is-hidden');
      return;
    }

    input.classList.add('is-danger');
    help.classList.remove('is-hidden');
  };

  emailInputs.forEach((input) => {
    const help = ensureHelpElement(input);
    if (!help) {
      return;
    }

    input.addEventListener('input', () => updateValidationState(input, help));
    input.addEventListener('blur', () => updateValidationState(input, help));

    updateValidationState(input, help);
  });
});
