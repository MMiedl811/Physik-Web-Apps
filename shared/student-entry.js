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
    const homeHref = body.dataset.studentHome || '../';

    if (!document.querySelector('a.student-home, a[aria-label="Zur Übersicht"], a[aria-label="Zurück zur Übersicht"]')) {
      const link = document.createElement('a');
      link.className = 'student-home';
      link.href = homeHref;
      link.setAttribute('aria-label', 'Zur Übersicht');
      link.textContent = '⌂ Übersicht';
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

    const close = () => {
      overlay.remove();
      body.classList.remove('student-intro-open');
    };
    button.addEventListener('click', close, { once: true });
    button.focus({ preventScroll: true });
  });
})();
