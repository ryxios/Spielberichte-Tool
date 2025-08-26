const fs = require('fs');
const path = require('path');

function render(template, data) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => data[key] || '');
}

const templatePath = path.join(__dirname, 'templates', 'base.html');
const baseTemplate = fs.readFileSync(templatePath, 'utf8');

const pages = [
  {
    output: 'vorschau.html',
    data: {
      title: 'Spiel Daten Visualisierung',
      header: 'Spieldaten Auswahl',
      subtitle: 'Wählen Sie ein Datum aus und laden Sie die verfügbaren Spiele',
      content: `
    <div class="centered spaced">
        <label for="datumAuswahl">Datum auswählen:</label>
        <input type="date" id="datumAuswahl">
        <button id="spieleLaden">Spiele laden</button>
    </div>
    <div class="centered spaced">
        <label for="titelEingabe">Titel des generierten Bildes:</label>
        <input type="text" id="titelEingabe" placeholder="Heimspiele">
    </div>
    <div class="centered spaced">
        <label for="hintergrundHochladen">Hintergrundbild hochladen:</label>
        <input type="file" id="hintergrundHochladen" accept="image/*">
    </div>
    <div class="centered spaced">
        <label for="modusAuswahl">Modus auswählen:</label>
        <select id="modusAuswahl">
            <option value="normal">Normalmodus</option>
            <option value="turnier">Turniermodus</option>
        </select>
    </div>`,
      tableId: 'spieleTabelle',
      selectionHeader: 'Auswahl',
      footer: `
    <div class="centered spaced">
        <button id="bildGenerieren">Bild generieren</button>
    </div>
    <img id="spielBild" alt="Spiel Bild" class="hidden center-block"/>`,
      scriptPath: 'js/main.js'
    }
  },
  {
    output: 'bericht.html',
    data: {
      title: 'Spiel Daten Visualisierung',
      header: 'Spielbericht Auswahl',
      subtitle: 'Wählen Sie ein Datum aus und laden Sie die verfügbaren Spiele',
      content: `
    <div class="centered spaced">
        <label for="datumAuswahl">Datum auswählen:</label>
        <input type="date" id="datumAuswahl">
    </div>`,
      tableId: 'spieleTabelle',
      selectionHeader: 'Auswahl',
      footer: '',
      scriptPath: 'js/main.js'
    }
  }
];

pages.forEach(page => {
  const output = render(baseTemplate, page.data);
  fs.writeFileSync(path.join(__dirname, page.output), output);
});
