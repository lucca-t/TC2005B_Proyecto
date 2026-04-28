(function() {
  function htmlToMarkdown(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    function serializeInline(node) {
      if (!node) return '';

      if (node.nodeType === Node.TEXT_NODE) {
        return node.nodeValue || '';
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }

      const tag = node.tagName.toLowerCase();

      if (tag === 'strong' || tag === 'b') {
        return '**' + Array.from(node.childNodes).map(serializeInline).join('') + '**';
      }

      if (tag === 'em' || tag === 'i') {
        return '*' + Array.from(node.childNodes).map(serializeInline).join('') + '*';
      }

      return Array.from(node.childNodes).map(serializeInline).join('');
    }

    function serializeBlock(node) {
      if (!node || node.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }

      const tag = node.tagName.toLowerCase();

      if (tag === 'div' || tag === 'section' || tag === 'article') {
        return Array.from(node.childNodes).map(serializeBlock).join('');
      }

      if (tag === 'h1') {
        return '# ' + Array.from(node.childNodes).map(serializeInline).join('').trim() + '\n\n';
      }

      if (tag === 'h2') {
        return '## ' + Array.from(node.childNodes).map(serializeInline).join('').trim() + '\n\n';
      }

      if (tag === 'h3') {
        return '### ' + Array.from(node.childNodes).map(serializeInline).join('').trim() + '\n\n';
      }

      if (tag === 'p') {
        const paragraph = Array.from(node.childNodes).map(serializeInline).join('').trim();
        return paragraph ? paragraph + '\n\n' : '';
      }

      if (tag === 'ul') {
        const items = Array.from(node.children).map(function(child) {
          return serializeBlock(child);
        }).join('');
        return items + '\n';
      }

      if (tag === 'li') {
        const marginLeft = parseFloat(node.style.marginLeft || '0');
        const indent = isNaN(marginLeft) ? 0 : Math.max(0, Math.round(marginLeft / 20));
        const content = Array.from(node.childNodes).map(serializeInline).join('').trim();
        return new Array(indent + 1).join('  ') + '* ' + content + '\n';
      }

      if (tag === 'br') {
        return '\n';
      }

      return Array.from(node.childNodes).map(serializeBlock).join('');
    }

    return serializeBlock(doc.body)
        .replace(/\n{3,}/g, '\n\n')
        .trim();
  }

  function renderMarkdown(markdown, output) {
    if (typeof marked !== 'undefined' && marked.parse) {
      output.innerHTML = marked.parse(markdown);
    } else {
      output.textContent = markdown;
    }
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;

    try {
      copied = document.execCommand('copy');
    } finally {
      document.body.removeChild(textarea);
    }

    if (!copied) {
      return Promise.reject(new Error('Copy command failed'));
    }

    return Promise.resolve();
  }

  function showManualCopy(text) {
    const manual = document.createElement('textarea');
    manual.value = text;
    manual.style.position = 'fixed';
    manual.style.left = '50%';
    manual.style.top = '50%';
    manual.style.transform = 'translate(-50%, -50%)';
    manual.style.zIndex = 99999;
    manual.style.width = '80%';
    manual.style.height = '240px';
    manual.style.padding = '8px';
    document.body.appendChild(manual);
    manual.focus();
    manual.select();

    setTimeout(function() {
      try {
        alert('Copy failed. The report content has been selected - press Ctrl+C (Cmd+C) to copy. Press Escape to close.');
      } catch (e) {}
    }, 50);

    function escHandler(e) {
      if (e.key === 'Escape') {
        if (manual && manual.parentNode) manual.parentNode.removeChild(manual);
        window.removeEventListener('keydown', escHandler);
      }
    }
    window.addEventListener('keydown', escHandler);
  }

  function init() {
    const output = document.getElementById('reportMarkdown');
    const rawData = document.getElementById('reportMarkdownData');
    const copyButton = document.getElementById('copyReportButton');

    if (!output || !rawData) return;

    let markdown = '';

    try {
      markdown = JSON.parse(rawData.textContent || '""');
    } catch (error) {
      markdown = rawData.textContent || '';
    }

    renderMarkdown(markdown, output);

    if (!copyButton) return;

    let copySource = markdown;
    if (typeof markdown === 'string' && markdown.indexOf('<') !== -1 && markdown.indexOf('>') !== -1) {
      copySource = htmlToMarkdown(markdown);
    }

    copyButton.addEventListener('click', function() {
      copyTextToClipboard(copySource)
          .then(function() {
            copyButton.textContent = 'Copied';
            setTimeout(function() {
              copyButton.textContent = 'Copy Markdown';
            }, 1500);
          })
          .catch(function(error) {
            console.error('Copy failed:', error && error.message);
            copyButton.textContent = 'Copy failed';

            try {
              showManualCopy(copySource);
            } catch (e2) {
              console.error('Manual-select fallback failed:', e2 && e2.message);
            }

            setTimeout(function() {
              copyButton.textContent = 'Copy Markdown';
            }, 1500);
          });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
