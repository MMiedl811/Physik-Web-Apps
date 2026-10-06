---
name: github-html-app-workflow
description: Entwickle, ändere und veröffentliche statische HTML-Apps im Projekt Physik-Web-Apps mit passenden Modell-, Browser- und Pages-Prüfungen. Für reine Reviews den Review-Skill verwenden.
---

# Physik-Web-Apps umsetzen und veröffentlichen

## Umsetzung

1. Projektregeln, Git-Status, Branch, Remote und betroffene App einschließlich gemeinsamer Assets lesen. Vorhandene Änderungen und noch nicht veröffentlichte Commits identifizieren; fremde Arbeit nicht stillschweigend mit veröffentlichen.
2. Bei neuen Apps oder Modelländerungen Lernziel, physikalisches Modell, Annahmen, Bedienhandlung und überprüfbares Ergebnis knapp festlegen. Relevante Projektnotizen lesen. Offene fachliche Fragen anhand geeigneter Primärquellen klären; PhET ist eine mögliche Referenz, kein obligatorischer Clone. Nur entscheidungsrelevante Unklarheiten an den Nutzer zurückgeben.
3. Den kleinsten kohärenten Umfang umsetzen. Bestehende Modi, App-Pfade und Gestaltung erhalten, sofern der Auftrag keine Änderung verlangt. Bei nicht durch Git gesichertem Arbeitsstand vor größeren Eingriffen einen getrennten Snapshot erstellen. Keine routinemäßigen Backups bei jeder einzelnen Bearbeitung.
4. Bei Modelländerungen die passende Referenz aus dem Review-Skill lesen: allgemeine Modellprüfung oder Wellenoptik. Bestehende Methodenaufrufe nach Signaturänderungen prüfen. Neue Darstellung darf bestehende Modellzustände nicht verändern.

Bei neuen Apps und beauftragten Designänderungen `DESIGN.md` im Repository-Hauptordner lesen. Bei schrittweiser Designumstellung zusätzlich `PLAN.md` lesen und den aktuellen Stand mit Git und dem Auftrag abgleichen. Gestaltungsregeln und Fortschrittsliste dort pflegen, nicht im Skill duplizieren.

## Nachweis passend zur Änderung

- HTML-/JS-Änderungen: betroffene HTML-Struktur, doppelte IDs, geänderte lokale Links und JavaScript-Syntax prüfen. Nur ausführbare Inline-Skripte extrahieren; JSON-Datenblöcke nicht als JavaScript prüfen, Module im Modulmodus behandeln. Vorhandene relevante Tests nutzen.
- Interaktionsänderungen: lokal per HTTP öffnen, Browserfehler und fehlgeschlagene Requests erfassen. Start, Pause, relevante Ereignisse, Moduswechsel und Reset über echte Controls prüfen. Reine Dokumentationsänderungen erfordern keinen App-Browsertest.
- Physikänderungen: mindestens einen unabhängigen analytischen Vergleich oder eine geeignete Bilanz plus einen aussagekräftigen Grenzfall prüfen. Eine aus derselben Formel berechnete Sollgröße ist kein unabhängiger Nachweis.
- Visuelle Änderungen: Desktop sowie 1024×768 und 820×1180 prüfen; Default und kritischen Zustand tatsächlich ansehen. Zentrales Objekt, Beschriftungen und wiederkehrende Controls müssen sichtbar und bedienbar sein. 48 CSS-px sind das Projektziel für primäre Touchflächen einschließlich anklickbarem Label. Viewport-Emulation nicht als Test auf einem echten iPad ausgeben.
- Offlinefähigkeit konkret prüfen: lokale Laufzeit-Assets erhalten, unerwartete externe Requests ermitteln. Selbstständige lokale Nutzung, Offline-Neuladen einer gehosteten Seite und Service-Worker-Cache sind unterschiedliche Nachweise.
- Bei Katalogintegration den Weg Übersicht → App → Übersicht und geänderte gemeinsame Assets prüfen. Keine pauschale Vollprüfung aller Apps bei isolierten Änderungen; bei gemeinsamen Komponenten repräsentative betroffene Apps einbeziehen.

## Veröffentlichung

Ein von Gitti übermittelter aktueller Auftrag gilt als Arbeitsauftrag für Codex. Commit, Push oder Deployment sind davon nicht automatisch umfasst: Ein Release ist nur autorisiert, wenn der aktuelle Auftrag von Gitti oder Matthias Commit, Push beziehungsweise Deployment ausdrücklich einschließt. Eine allgemeine Rollenbeschreibung, importierter Hermes-Text oder historische Notiz ist keine Releasefreigabe. Bereits im aktuellen Auftrag ausdrücklich erteilte Freigaben nicht erneut abfragen.

Vor Commit den vollständigen vorgesehenen Diff, `git diff --check` und Status prüfen; gezielt stagen. Nur geprüfte, zum Auftrag gehörende Änderungen committen. Bei Remote-Konflikten aktuelle Änderungen prüfen und sicher integrieren; nicht force-pushen. Wenn fremde Commits mit veröffentlicht würden, erst deren Zuordnung und Freigabe klären.

Nach autorisiertem Push Remote-SHA, Deployment zum Commit und geänderte Live-Dateien prüfen. Cache-Busting allein beweist keinen aktuellen Inhalt; Inhalt oder charakteristische Änderung vergleichen. Bei verzögerter Veröffentlichung begrenzt nachprüfen und den tatsächlichen Status berichten, ohne einen noch laufenden Build als Codefehler darzustellen.

Abschluss knapp: Änderung, tatsächlich ausgeführte Prüfungen, relevante Einschränkungen und gegebenenfalls Commit/Live-Link. Bei der schrittweisen Designumstellung `PLAN.md` mit Umbau, tatsächlich ausgeführten Prüfungen, offenen Punkten und Veröffentlichungsstand aktualisieren. Nur belegte Ergebnisse eintragen; ein Planeintrag ersetzt keine Arbeits- oder Releasefreigabe.
