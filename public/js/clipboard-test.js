(function() {
  const status = document.getElementById('status');
  const button = document.getElementById('copyBtn');

  function setStatus(message) {
    if (!status) return;
    status.textContent = message;
  }

  function envInfo() {
    return [
      'origin: ' + location.origin,
      'secureContext: ' + window.isSecureContext,
      'hasClipboardApi: ' + Boolean(navigator.clipboard),
      'hasWriteText: ' + Boolean(navigator.clipboard && navigator.clipboard.writeText),
    ].join('\n');
  }

  async function copyText() {
    const input = document.getElementById('myInput');
    if (!input) {
      setStatus('Missing input element.\n' + envInfo());
      return;
    }

    const text = input.value;
    setStatus('Attempting copy...\n' + envInfo());

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        setStatus('Copied via Clipboard API.\n' + envInfo());
        return;
      } catch (e) {
        console.warn('clipboard API failed', e);
      }
    }

    try {
      input.focus();
      input.select();
      if (input.setSelectionRange) input.setSelectionRange(0, 99999);
      const ok = document.execCommand('copy');
      if (ok) {
        setStatus('Copied via execCommand.\n' + envInfo());
        return;
      }
    } catch (e) {
      console.warn('execCommand on input failed', e);
    }

    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setStatus('Copied via textarea fallback.\n' + envInfo());
      return;
    } catch (e) {
      console.error('final copy fallback failed', e);
    }

    setStatus('Copy failed.\n' + envInfo());
  }

  if (button) {
    button.addEventListener('click', copyText);
  } else {
    console.warn('copyBtn not found');
  }

  setStatus('Ready.\n' + envInfo());
})();
