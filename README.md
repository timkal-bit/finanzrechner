# 💰 Vermögensrechner - Advanced Wealth Calculator

Ein moderner, React-basierter Finanzrechner mit Apple-inspiriertem Design zur Prognose Ihrer finanziellen Zukunft.

![App Screenshot](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Vermögensrechner+Preview)

## 🚀 Features

### 📊 Dual-Mode Calculator
- **Ansparphase**: Berechnung vom aktuellen Alter bis zur Rente
- **Ruhestand**: Bereits im Ruhestand befindliche Personen

### 🎯 Flexible Zielplanung
- Individuelles Renteneintrittsalter (mit roter Linie im Chart)
- Gewünschtes monatliches Einkommen im Ruhestand
- Erwartete staatliche Rente
- 4%-Regel für nachhaltige Entnahmeraten

### 🏠 Optionale Erbschaft
- Toggle-basierte Aktivierung
- Nur bei Aktivierung in Berechnungen einbezogen
- Visuelle Markierung im Chart (blaue gestrichelte Linie)

### 📈 Erweiterte Visualisierung
- Interaktive Charts mit Chart.js
- Vermögensentwicklung (nominal + kaufkraftbereinigt)
- Annotationen für Renteneintritt und Erbschaft
- Responsive Design für alle Bildschirmgrößen

### 🧮 Deutsche Steuerberechnung
- Einkommensteuer nach aktuellen Tarifen
- Solidaritätszuschlag
- Sozialversicherungsbeiträge
- Kapitalertragsteuer mit €1.000 Freibetrag

## 🎨 Apple-Inspired Design

- **Dark Theme** mit Glassmorphismus-Effekten
- **Apple-Style Sliders** für alle Prozent-Eingaben
- **Elegante Toggle-Switches** mit smooth Animations
- **SF Pro Display** Schriftart (falls verfügbar)
- **Apple Farbpalette** (SF Blue, Orange, Purple, etc.)

## 🛠️ Tech Stack

- **React** - Frontend Framework
- **Tailwind CSS** - Utility-first CSS Framework
- **Chart.js** - Charting Library mit Annotations
- **React Hot Reload** - Live Development Updates

## 🚀 Quick Start

```bash
# Dependencies installieren
npm install

# Development Server starten
npm start

# Production Build erstellen
npm run build
```

Die App läuft dann auf `http://localhost:3000`

## 📱 Usage

1. **Modus wählen**: Ansparphase oder Ruhestand
2. **Grunddaten eingeben**: Alter, Einkommen, Ausgaben
3. **Ziele definieren**: Renteneintrittsalter, gewünschtes Einkommen
4. **Optionen aktivieren**: Erbschaft, Rente
5. **Ergebnisse analysieren**: Chart, Tabellen, Zielerreichung

## 📊 Chart Features

- **Blaue Linie**: Vermögen nominal
- **Orange gestrichelt**: Vermögen kaufkraftbereinigt  
- **🔴 Rote Linie**: Renteneintritt
- **🔵 Blaue gestrichelt**: Erbschaft (wenn aktiviert)
- **Interaktive Tooltips** mit deutschen Währungsformatierung

## 🎯 Status Indicators

Die App zeigt aktive Parameter als farbkodierte Badges:
- 🔴 **Renteneintritt** - Jahr und Alter
- 🔵 **Erbschaft** - Jahr und Betrag (wenn aktiviert)
- 🟢 **Rentenziel** - Gewünschtes Einkommen
- 🟠 **Staatliche Rente** - Erwartete Bezüge

## ⚠️ Disclaimer

Dies ist eine vereinfachte Modellrechnung für Planungszwecke. Für detaillierte Finanzplanung konsultieren Sie einen Finanzberater.

---

## Available Scripts (Create React App)

### `npm start`
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
