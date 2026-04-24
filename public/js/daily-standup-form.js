/* eslint-env browser */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('standup-form');
  const dateInput = document.getElementById('standup-date');
  const submitButton = document.getElementById('standup-submit');
  const feedback = document.getElementById('duplicate-date-feedback');

  if (!form || !dateInput || !submitButton || !feedback) {
    return;
  }

  const validateUrl =
    form.getAttribute('data-validate-url') || '/daily_standup/validate-date';

  let debounceTimer = null;
  let latestRequestId = 0;

  const clearFeedback = () => {
    feedback.textContent = '';
    feedback.className = 'help';
    submitButton.disabled = false;
  };

  const showChecking = () => {
    feedback.textContent = 'Checking selected date...';
    feedback.className = 'help has-text-grey';
    submitButton.disabled = true;
  };

  const showDuplicate = () => {
    feedback.textContent =
      'A standup report already exists for the selected date.';
    feedback.className = 'help has-text-danger';
    submitButton.disabled = true;
  };

  const validateDate = async () => {
    const selectedDate = dateInput.value;

    if (!selectedDate) {
      clearFeedback();
      return;
    }

    const requestId = ++latestRequestId;
    showChecking();

    try {
      const url =
        validateUrl + '?date=' + encodeURIComponent(selectedDate);
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (requestId !== latestRequestId) {
        return;
      }

      if (!response.ok) {
        clearFeedback();
        return;
      }

      const payload = await response.json();
      if (payload.duplicate) {
        showDuplicate();
        return;
      }

      clearFeedback();
    } catch (error) {
      if (requestId !== latestRequestId) {
        return;
      }

      clearFeedback();
    }
  };

  dateInput.addEventListener('input', () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(validateDate, 250);
  });

  validateDate();
});
