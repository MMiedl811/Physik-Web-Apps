---
name: interactive-physics-app-review
description: Prüfe Physik-Lernapps auf Modellfehler, irreführende Darstellungen, Zustandsfehler und iPad-Bedienbarkeit. Für beauftragte Reviews oder die fachliche Prüfung wesentlicher Simulationsänderungen.
---

# Physik-App-Review

Bei einem reinen Prüfauftrag lesend arbeiten. Ein Review erweitert einen Umsetzungsauftrag nicht auf andere Apps oder Veröffentlichungen.

## Vorgehen

1. Angefragte Apps und Zustände abgrenzen; Backups aus dem Inventar ausschließen. Relevante vorhandene Änderungen erfassen. Bei paralleler Bearbeitung vor dem Bericht prüfen, ob Befunde noch zum aktuellen Stand gehören.
2. Lernbehauptung durch sichtbaren Text → Controls → Modell → Berechnung → Darstellung → Rückmeldung verfolgen. Formeln im UI sind kein Beweis für die Berechnung.
3. Für neue oder geänderte Modellgleichungen [Modellprüfung](references/model-checks.md) lesen. Bei Beugung, Interferenz oder Huygens zusätzlich [Wellenoptik](references/wave-optics.md) lesen. Andere Spezialfälle anhand des tatsächlichen Modells prüfen; keine fachfremde Checkliste aufzwingen.
4. Verdachtsfälle deterministisch reproduzieren. Test-Hooks erst nach Prüfung ihrer Signaturen verwenden; fehlerhafte Testaufrufe nicht als App-Fehler melden. Sollwerte möglichst unabhängig berechnen. Debug-Werte mit sichtbarer Ausgabe vergleichen.
5. Browserzustände über reale Controls durchlaufen: Einstieg, Start/Pause, entscheidendes Ereignis, Moduswechsel und Reset. Beim Reset Modell, DOM-Control und Label vergleichen und nach mindestens einem weiteren Frame kontrollieren. Was zurückgesetzt werden soll, folgt der Beschriftung und dem App-Konzept; ein Parameterreset und ein kompletter Neustart können verschieden sein.
6. Bei visuellen/Interaktionsfragen 1024×768 und 820×1180 sowie Desktop untersuchen. Nach CSS-Übergängen messen. Extremparameter, Beschriftungsabstände, Touchflächen und Lesbarkeit der Bewegung prüfen; bloße geometrische Einpassung reicht nicht. Tastaturbedienung und Fokus bei betroffenen Controls berücksichtigen.

## Befunde

Priorität haben falsche Lernbehauptungen, unzutreffende Bilanzen, widersprüchliche Zustände, Abstürze und unbedienbare Kernfunktionen. Ästhetische Vorlieben sind keine fachlichen Fehler.

Jeder Befund nennt Ort, reproduzierenden Zustand, erwartetes und tatsächliches Verhalten, Lern-/Funktionsfolge sowie eine gezielte Korrektur oder Prüfung. Zwischen belegtem Fehler, begründetem Verdacht und optionaler Verbesserung unterscheiden. Keine Fehler erfinden, um Änderungen zu rechtfertigen; ein korrekter Bestand darf unverändert bleiben.

Geprüften Umfang und fehlende Nachweise nennen. Historische Logbucheinträge sind Hinweise, kein Nachweis für den aktuellen Quellstand. Bei einem reinen Review keine Reparaturen, Commits oder Pushes ausführen.
