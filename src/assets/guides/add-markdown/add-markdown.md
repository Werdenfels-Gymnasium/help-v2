@title Guide Schreiben
@group write-guide

1. Sobald du die Hilfe geklont hast (Siehe [hier](/#!/guide/github-clone) wie klonen geht) 
wechsle in das Verzeichnis

2. Setzte deinen Proxy mit `setup_proxy` und gib dein Passwort ein

3. Installiere alle Abhängigkeiten mit folgendem Befehl: `npm install`

4. Nun kompiliere die Hilfe mit folgendem Befehl: `$(npm bin)/ng serve`

5. Starte den Live-Server um deine Änderungen im Browser anzusehen: `live-sever dist/`

6. Erstelle deine Markdown Datei und speichere sie in einen zu deinem Thema passenden Ordner 
in `src/assets/guides/`, siehe dazu [hier](/guides/write-markdown) wie man mit Markdown umgeht
