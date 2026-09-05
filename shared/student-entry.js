(() => {
  'use strict';

  const STUDENT_GUIDANCE = Object.freeze({
    'magnetfeld-labor': {
      goal: 'Wie lassen sich Richtung und Stärke eines Magnetfelds an jedem Ort sichtbar machen?',
      observe: 'Vergleiche Magnetnadel-Raster und Messkompass: Zeigen beide am selben Ort dieselbe Feldrichtung?'
    },
    diagramme: {
      goal: 'Wie hängen Orts-, Geschwindigkeits- und Beschleunigungsdiagramm derselben Bewegung zusammen?',
      observe: 'Achte auf Stellen, an denen Steigung, Geschwindigkeit oder Beschleunigung ihr Vorzeichen ändern.'
    },
    'fadenpendel-energie': {
      goal: 'Wie werden beim Fadenpendel Höhenenergie und kinetische Energie umgewandelt – und was geschieht bei Reibung?',
      observe: 'Vergleiche das ideale Pendel mit dem Reibungsfall: Wie verändern sich Auslenkung, mechanische Energie und innere Energie?'
    },
    'vektor-labor': {
      goal: 'Wie werden Betrag und Richtung physikalischer Größen als Pfeile dargestellt?',
      observe: 'Achte darauf, wie Anfangspunkt, Pfeillänge und Pfeilrichtung die Aussage eines Vektors bestimmen.'
    },
    schwingungen: {
      goal: 'Wie beeinflussen die Parameter eines Feder- oder Fadenpendels seine Schwingung?',
      observe: 'Vergleiche Auslenkung, Geschwindigkeit, Beschleunigung und Kräfte während einer vollständigen Schwingung.'
    },
    'energie-runner': {
      goal: 'Wie wird beim Laufen und Springen chemische Energie in andere Energieformen umgewandelt?',
      observe: 'Achte beim Beschleunigen, Springen und Landen auf Bewegungs-, Höhen- und innere Energie.'
    },
    impulsdiagramm: {
      goal: 'Wie unterscheiden sich Impuls und kinetische Energie bei verschiedenen Stoßarten?',
      observe: 'Vergleiche die Werte vor und nach dem Stoß und suche Größen, die erhalten bleiben.'
    },
    'energie-faesser': {
      goal: 'Wie beeinflussen Stoff, Masse und Temperatur die innere Energie eines Körpers?',
      observe: 'Vergleiche Breite und Höhe der Energiebalken und beobachte den Energieaustausch zwischen zwei Körpern.'
    },
    'v-aenderung': {
      goal: 'Wie entsteht aus Anfangsgeschwindigkeit und Geschwindigkeitsänderung die Endgeschwindigkeit?',
      observe: 'Achte darauf, wie Betrag und Richtung von Δv den resultierenden Geschwindigkeitspfeil verändern.'
    },
    impuls: {
      goal: 'Wie verändert ein elastischer Stoß die Impulse der beteiligten Körper?',
      observe: 'Vergleiche die Impulsvektoren vor und nach dem Stoß und prüfe den Gesamtimpuls.'
    },
    'freier-fall-energie': {
      goal: 'Wie wird beim freien Fall Höhenenergie in Bewegungsenergie und mit Luftwiderstand zusätzlich in Energie der Luft umgewandelt?',
      observe: 'Vergleiche Fall ohne und mit Luftwiderstand und achte auf Geschwindigkeit und Gesamtenergie.'
    },
    'mechanische-leistung': {
      goal: 'Wie hängen Energieänderung, benötigte Zeit und mechanische Leistung beim Treppensteigen und Gewichtheben zusammen?',
      observe: 'Wähle Treppe oder Gewichtheben und vergleiche: Was ändert sich, obwohl dieselbe Höhe beziehungsweise derselbe Energiezuwachs erreicht wird?'
    },
    'waagrechter-wurf': {
      goal: 'Wie überlagern sich waagrechte und senkrechte Bewegung beim Abwurf?',
      observe: 'Achte darauf, wie Anfangsgeschwindigkeit und Abwurfhöhe Flugbahn, Flugzeit und Reichweite verändern.'
    },
    'kondensator-pendel': {
      goal: 'Wie transportiert eine Pendelkugel Ladung und entlädt dadurch einen Kondensator?',
      observe: 'Verknüpfe die sichtbaren Ladungstransporte mit Spannung, Ladung und der Fläche im U-Q-Diagramm.'
    },
    energiestufenmodell: {
      goal: 'Welche Energiebeträge kann ein Elektron aufnehmen und welche Übergänge werden dadurch möglich?',
      observe: 'Vergleiche die zugeführte Energie mit den erlaubten Abständen zwischen den Energieniveaus.'
    },
    'schaltbild-werkstatt': {
      goal: 'Wie hängen Spannung, Stromstärke und Widerstand in Reihen-, Parallel- und gemischten Schaltungen zusammen?',
      observe: 'Vergleiche Teilspannungen und Teilströme und prüfe, ob die Kirchhoff-Regeln erfüllt sind.'
    }
  });

  function ready(callback) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback, { once: true });
    else callback();
  }

  function taskBlock(label, text) {
    const block = document.createElement('p');
    block.className = 'student-intro-task';
    const heading = document.createElement('strong');
    heading.textContent = label;
    const copy = document.createElement('span');
    copy.textContent = text;
    block.append(heading, copy);
    return block;
  }

  ready(() => {
    const body = document.body;
    const appId = body.dataset.physikApp;
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

    const guidance = STUDENT_GUIDANCE[appId] || {
      goal: summary,
      observe: 'Achte darauf, wie sich die dargestellten physikalischen Größen gegenseitig beeinflussen.'
    };

    const overlay = document.createElement('div');
    overlay.className = 'student-intro-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'student-intro-title');

    const card = document.createElement('section');
    card.className = 'student-intro-card';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'student-intro-eyebrow';
    eyebrow.textContent = 'Dein Lernauftrag';

    const heading = document.createElement('h2');
    heading.id = 'student-intro-title';
    heading.textContent = title;

    const goal = taskBlock('Heute untersuchst du:', guidance.goal);
    const observation = taskBlock('Achte besonders auf:', guidance.observe);
    const firstStep = taskBlock('So beginnst du:', controls);

    const button = document.createElement('button');
    button.className = 'student-intro-ok';
    button.type = 'button';
    button.textContent = 'Untersuchung starten';

    card.append(eyebrow, heading, goal, observation, firstStep, button);
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
