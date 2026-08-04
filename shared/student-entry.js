(() => {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback, { once: true });
    else callback();
  }

  ready(() => {
    const body = document.body;
    const title = body.dataset.studentTitle;
    const summary = body.dataset.studentSummary;
    const controls = body.dataset.studentControls;
    const configuredHomeHref = body.dataset.studentHome || '../';
    const homeHref = configuredHomeHref === '../' ? '../index.html' : configuredHomeHref;
    const existingHome = document.querySelector('a.student-home, a[aria-label="Zur Übersicht"], a[aria-label="Zurück zur Übersicht"]');

    if (existingHome) {
      if (existingHome.getAttribute('href') === '../') existingHome.setAttribute('href', homeHref);
    } else {
      const link = document.createElement('a');
      link.className = 'student-home';
      link.href = homeHref;
      link.setAttribute('aria-label', 'Zur Übersicht');
      link.textContent = 'Übersicht';
      body.append(link);
    }

    if (!title || !summary || !controls) return;

    const overlay = document.createElement('div');
    overlay.className = 'student-intro-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'student-intro-title');

    const card = document.createElement('section');
    card.className = 'student-intro-card';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'student-intro-eyebrow';
    eyebrow.textContent = 'Kurz erklärt';

    const heading = document.createElement('h2');
    heading.id = 'student-intro-title';
    heading.textContent = title;

    const summaryText = document.createElement('p');
    summaryText.textContent = summary;

    const controlsText = document.createElement('p');
    controlsText.className = 'student-intro-controls';
    const controlsLabel = document.createElement('strong');
    controlsLabel.textContent = 'So steuerst du: ';
    controlsText.append(controlsLabel, document.createTextNode(controls));

    const button = document.createElement('button');
    button.className = 'student-intro-ok';
    button.type = 'button';
    button.textContent = 'OK, starten';

    card.append(eyebrow, heading, summaryText, controlsText, button);
    overlay.append(card);
    body.append(overlay);
    body.classList.add('student-intro-open');
    body.dispatchEvent(new CustomEvent('student-intro:open'));

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', keepFocusInDialog);
      overlay.remove();
      body.classList.remove('student-intro-open');
      body.dispatchEvent(new CustomEvent('student-intro:close'));
    };
    const keepFocusInDialog = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        button.focus({ preventScroll: true });
      }
    };
    document.addEventListener('keydown', keepFocusInDialog);
    button.addEventListener('click', close, { once: true });
    button.focus({ preventScroll: true });
  });
})();
