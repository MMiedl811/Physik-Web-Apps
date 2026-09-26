# Physik-Web-Apps

Dieses Projekt enthält browserbasierte Physik-Lernapps für den Schulunterricht. Codex kommuniziert auf Deutsch.

## Rollen, Auftrag und Priorität

- Matthias entscheidet über Produktfragen und Freigaben.
- Gitti ist Senior/Planerin: Sie beschreibt jeden aktuellen Auftrag konkret, grenzt den Scope ab und nennt Akzeptanzkriterien.
- Codex ist der ausführende Coder: Er analysiert, implementiert und testet den klaren Auftrag selbstständig, erweitert aber weder Scope noch Produktentscheidungen eigenmächtig.

Dauerhafte Regeln stehen hier; auftragsspezifische Anforderungen kommen aus Gittis jeweiligem Prompt. Bei Konflikten gilt: aktueller expliziter Auftrag > nähere `AGENTS.override`/`AGENTS.md` > Root-`AGENTS.md` > Skills/Referenzen > historische Notizen. Unklare oder widersprüchliche Anforderungen nicht erraten: Nur bei entscheidungsrelevanter Blockade anhalten und die konkrete Frage nennen. Fehlt eine nichtkritische Angabe, die kleinste konservative Annahme treffen und explizit benennen.

## Preflight und Arbeitsvertrag

Jeder Auftrag beginnt mit Preflight: Git-Status, Branch und Diff prüfen sowie betroffene Dateien, bestehende relevante Tests und gemeinsame Assets ermitteln. Vorhandene lokale Änderungen und bereits unveröffentlichte Commits niemals stillschweigend verändern, committen oder pushen.

Aus dem aktuellen Prompt hält Codex Ziel, In-Scope, Out-of-Scope, Akzeptanzkriterien, erforderliche Prüfungen und Release-Autorisierung fest. Der Patch bleibt klein und kohärent: funktionierende Gestaltung und Modelle werden additiv bewahrt, sofern der Auftrag keine Änderung verlangt. Keine ungefragten Refactorings, Redesigns oder Abhängigkeiten.

Vanilla HTML/CSS/JavaScript und lokale Laufzeit-Assets sind Standard; Offlinefähigkeit, stabile App-Links und Desktop-/iPad-Bedienbarkeit erhalten. Fachmodell, sichtbare Erklärung und Darstellung müssen konsistent sein. Private Obsidian-Inhalte oder persönliche Pfade nie in öffentliche Dateien übernehmen. Obsidian ist nur Hintergrundwissen, niemals automatisch eine Produktanforderung.

## Nachweise und Abschluss

Prüfungen dem Änderungsrisiko anpassen und nur tatsächlich ausgeführte Tests mit Ergebnis berichten; bei relevanten Änderungen auch visuell prüfen. Der Abschluss nennt geänderte Dateien, Prüfungen mit Resultat und offene Risiken. Keine Tests behaupten.

Commit, Push oder Pages erfolgen ausschließlich, wenn der aktuelle Auftrag von Gitti oder Matthias dies ausdrücklich freigibt. Nach einem Push Remote-SHA und Pages-Veröffentlichung getrennt prüfen und berichten.

## Gezielt nutzbare Skills

- Umsetzung und Release: `.agents/skills/github-html-app-workflow/SKILL.md`.
- Fachlicher oder interaktiver Review: `.agents/skills/interactive-physics-app-review/SKILL.md`.

Skills und ihre Referenzen nur passend zum Auftrag laden; Projektregeln nicht hier duplizieren.
