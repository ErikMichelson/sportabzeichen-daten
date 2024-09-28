# Deutsches Sportabzeichen Leistungs-Daten

Dieses Repository beinhaltet den Datensatz an erforderlichen Leistungen für das deutsche Sportabzeichen in maschinenlesbarem Format.

Die CSV-Dateien sind aus den [offiziellen Tabellen](https://deutsches-sportabzeichen.de/service/materialien#akkordeon-17883) entnommen.
Zur Extraktion sowie der Definition des Ausgabeformats wurden [tabula](https://github.com/tabulapdf/tabula), [OpenRefine](https://github.com/OpenRefine/) und [OpenAI GPT-4o mini](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/) genutzt.

## Verwendung in Anwendungen

Es empfiehlt sich die Daten aus den CSV-Tabellen in ein relationales Datenbanksystem zu übernehmen um von Filter-, Transformations- und Indexierungsfunktionen Gebrauch machen zu können.

Im Web-Kontext können die Daten auch über ein CDN aus GitHub geladen werden, zum Beispiel durch jsdelivr:

[`https://cdn.jsdelivr.net/gh/ErikMichelson/sportabzeichen-daten/2024/Sportabzeichen_2024.json`](https://cdn.jsdelivr.net/gh/ErikMichelson/sportabzeichen-daten/2024/Sportabzeichen_2024.json)

## Korrekturen

Fehlerkorrekturen bitte per Pull request einreichen oder darauf per Issue aufmerksam machen.
Es gibt keine Haftung für die Korrektheit der Daten.

## Lizenz

Während die Originaldaten unter dem Urheberrecht des DOSB stehen und daher nicht in diesem Repository enthalten sind, sind die hier verfügbaren Datenformate gemäß CC0 frei verwendbar.
