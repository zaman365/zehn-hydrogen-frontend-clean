# ZEHN Fotografie-Richtlinien
## Professionelle Bildspezifikationen für Responsive Webdesign

**Version:** 1.0
**Letzte Aktualisierung:** 13. März 2026
**Projekt:** ZEHN E-Commerce-Plattform

---

## Inhaltsverzeichnis
1. [Übersicht](#übersicht)
2. [Technische Anforderungen](#technische-anforderungen)
3. [Bildspezifikationen nach Komponente](#bildspezifikationen-nach-komponente)
4. [Kompositionsrichtlinien](#kompositionsrichtlinien)
5. [Responsive Überlegungen](#responsive-überlegungen)
6. [Lieferformat](#lieferformat)
7. [Qualitätscheckliste](#qualitätscheckliste)

---

## Übersicht

Dieses Dokument bietet umfassende Fotografie-Richtlinien für die ZEHN E-Commerce-Plattform. Alle Bilder müssen für responsives Design optimiert sein und eine perfekte Darstellung auf Mobilgeräten, Tablets und Desktop-Geräten gewährleisten.

### Design-System-Farben
- **Primär (Anodized Indigo):** #0F1426
- **Akzent (Safety Signal):** #FF5F1F
- **Hintergrund (Platinum):** #F4F4F5
- **Sekundär (Industrial Slate):** #8E97A4

---

## Technische Anforderungen

### Dateiformate
- **Primärformat:** JPG/JPEG (für Fotografien)
- **Sekundärformat:** PNG (für Bilder mit Transparenz)
- **Web-Optimierung:** WebP (optional, für bessere Kompression)

### Farbraum
- **sRGB** (obligatorisch für Web-Anzeige)
- **Farbprofil:** Eingebettetes sRGB IEC61966-2.1

### Kompression
- **Qualität:** 85-90% (Balance zwischen Qualität und Dateigröße)
- **Maximale Dateigröße:**
  - Hero-Bilder: max. 500KB
  - Produktbilder: max. 200KB
  - Thumbnails: max. 100KB

### Auflösung
- **Minimum DPI:** 72 DPI (Web-Standard)
- **Pixeldichte:** @2x-Versionen für Retina-Displays bereitstellen

---

## Bildspezifikationen nach Komponente

### 1. Hero-Banner (Startseite)

**Desktop:**
- **Abmessungen:** Minimum 2400 × 1600px
- **Seitenverhältnis:** 3:2 (Querformat)
- **Anzeigehöhe:** Flexibel (skaliert mit Viewport, max. ~900px)
- **Dateiname:** `hero-main.jpg`

**Mobil:**
- **Abmessungen:** Minimum 1200 × 1600px
- **Seitenverhältnis:** 3:4 (Hochformat)
- **Anzeigehöhe:** 200px (Mobil), 280px (Tablet), 450px (Desktop)
- **Dateiname:** `hero-main-mobile.jpg`

**Kompositionshinweise:**
- Hauptmotiv zentriert halten
- Sichere Zone: Zentrale 60% des Bildes (Textüberlagerungsbereich)
- Vermeiden Sie geschäftige Hintergründe auf der linken Seite (Textplatzierungsbereich)
- Hohen Kontrast für Textlesbarkeit sicherstellen

**Aktuelle Beispiele:**
- `/Untitled design.png` - Hero-Bild
- `/newarrivalbanner.jpg` - Neuheiten-Banner

---

### 2. Produktraster-Bilder

**Spezifikationen:**
- **Abmessungen:** 1200 × 1200px (Minimum)
- **Seitenverhältnis:** 1:1 (Quadratisch)
- **Anzeigegröße:** 380px Höhe (fester Container)
- **Object Fit:** Contain (Produkt zentriert mit weißem Hintergrund)
- **Hintergrund:** Reinweiß (#FFFFFF) oder transparentes PNG

**Anforderungen:**
- Produkt muss zentriert sein
- 10-15% Abstand um Produktkanten
- Keine Schatten (werden per CSS hinzugefügt)
- Konsistente Beleuchtung über alle Produkte
- Mehrere Winkel empfohlen (vorne, Seite, Detail)

**Farbvarianten:**
- Jede Farbvariante benötigt separates Bild
- Gleiche Komposition und Beleuchtung
- Dateinamen: `produkt-name-farbe.jpg`

**Dateinamen-Konvention:**
```
poloshirt-navy-vorne.jpg
poloshirt-navy-hinten.jpg
poloshirt-weiss-vorne.jpg
cargohose-khaki-vorne.jpg
```

---

### 3. Kategorie-Kacheln

**Desktop:**
- **Abmessungen:** Minimum 1600 × 1200px
- **Seitenverhältnis:** 4:3 oder 1:1
- **Anzeigehöhe:** 450px (Desktop)
- **Dateiname:** `kategorie-[name].jpg`

**Mobil/Tablet:**
- **Abmessungen:** Minimum 1600 × 1600px
- **Seitenverhältnis:** 1:1 (Quadratisch)
- **Anzeigegröße:** 280px Breite (Mobil), 40% Viewport (Tablet)

**Kompositionshinweise:**
- Dunkler Verlaufsüberlagerung angewendet (von schwarz/70% zu transparent)
- Motiv in unteren 2/3 des Rahmens halten
- Oberes 1/3 relativ frei für Text lassen
- Kontrastreiche Motive funktionieren am besten

**Aktuelle Beispiele:**
```
Best Seller: 800×800px
Neuheiten: 800×800px
Sale: 800×800px
```

---

### 4. Bento-Raster (Featured-Bereich)

Das Bento-Raster verwendet mehrere Seitenverhältnisse in einem Mosaik-Layout:

#### Hohe Hochformat-Elemente
- **Abmessungen:** 1200 × 1800px
- **Seitenverhältnis:** 2:3 (Hochformat)
- **Dateinamen:** `bento-neuheiten.jpg`, `bento-sale.jpg`, `bento-bestseller.jpg`, `bento-kollektionen.jpg`

#### Breites Querformat-Element
- **Abmessungen:** 1600 × 900px
- **Seitenverhältnis:** 16:9 (Querformat)
- **Dateiname:** `bento-style-guide.jpg`

#### Quadratisches Element
- **Abmessungen:** 1200 × 1200px
- **Seitenverhältnis:** 1:1 (Quadratisch)
- **Dateiname:** `bento-premium.jpg`

**Raster-Layout:**
```
Desktop (4×8 Raster):
┌─────┬─────┬─────────┐
│     │ Qu  │  Breit  │
│ Hoch│─────┼────┬────┤
│     │Hoch │Hoch│Hoch│
│     │     │    │    │
└─────┴─────┴────┴────┘

Mobil (2×2 Raster):
Zeigt nur erste 4 Elemente
```

---

### 5. Kollektions-Banner

**Spezifikationen:**
- **Abmessungen:** Minimum 1600 × 1200px
- **Seitenverhältnis:** 4:3 (Mobil), 1:1 (Desktop)
- **Anzeigehöhe:** Responsiv (behält Seitenverhältnis bei)

**Layout:**
- Split-Layout: 50% Text, 50% Bild
- Bild kann links oder rechts sein
- Abgerundete Ecken (2xl = 24px Radius)

**Kompositionshinweise:**
- Produkt sollte zur Textseite zeigen
- Sauberer Hintergrund oder subtiler Verlauf
- Hochwertige Produktfotografie
- Produkt vollständig sichtbar (kein Beschnitt)

---

### 6. Neuheiten-Banner (Volle Breite)

**Spezifikationen:**
- **Abmessungen:** Minimum 2400 × 800px
- **Seitenverhältnis:** 3:1 (Ultra-breit)
- **Anzeigehöhen:**
  - Mobil: 200px
  - Tablet: 280px
  - Desktop: 450px

**Kompositionshinweise:**
- Textüberlagerung auf LINKER Seite
- Linke 30% des Bildes relativ frei halten
- Motiv/Produkt auf rechten 70%
- Horizontale Komposition funktioniert am besten

**Aktuelles Beispiel:**
- `/newarrivalbanner.jpg`

---

### 7. Produktdetailseiten-Bilder

**Hauptproduktbild:**
- **Abmessungen:** Minimum 2000 × 2000px
- **Seitenverhältnis:** 1:1 (Quadratisch)
- **Anzeige:** Responsiv, max. Höhe calc(100vh-10rem)
- **Hintergrund:** Weiß oder transparent

**Thumbnail-Galerie:**
- **Abmessungen:** 400 × 400px
- **Seitenverhältnis:** 1:1 (Quadratisch)
- **Anzeigegröße:** ~80px × 80px
- **Rahmen:** Abgerundet (xl = 12px Radius)

**Anforderungen:**
- Minimum 4 Bilder pro Produkt
- Enthalten: vorne, hinten, Detail, Lifestyle
- Konsistente Beleuchtung und Hintergrund
- Hohe Auflösung für Zoom-Funktionalität

---

### 8. Testimonial-Bilder

**Spezifikationen:**
- **Abmessungen:** Minimum 200 × 200px
- **Seitenverhältnis:** 1:1 (Quadratisch)
- **Anzeigegröße:** 48px × 48px (kreisförmiger Zuschnitt)
- **Format:** JPG oder PNG

**Anforderungen:**
- Porträtstil (Gesicht zentriert)
- Neutraler Hintergrund
- Gute Beleuchtung
- Professionelles Erscheinungsbild

---

## Kompositionsrichtlinien

### Best Practices für Produktfotografie

#### Beleuchtung
- **Setup:** 3-Punkt-Beleuchtung (Haupt-, Füll-, Hintergrundlicht)
- **Farbtemperatur:** 5500K (Tageslicht-ausgeglichen)
- **Schatten:** Weich, minimale Schatten
- **Highlights:** Überbelichtete Highlights vermeiden

#### Hintergrund
- **Farbe:** Reinweiß (#FFFFFF) für Produktraster
- **Textur:** Glatt, keine Ablenkungen
- **Konsistenz:** Gleicher Hintergrund über alle Produkte

#### Rahmung
- **Produktgröße:** 70-80% des Rahmens
- **Abstand:** 10-15% Rand auf allen Seiten
- **Zentrierung:** Perfekte Mittelausrichtung
- **Ausrichtung:** Gerade, nicht geneigt

#### Fokus
- **Schärfentiefe:** f/8 bis f/11 (durchgehend scharf)
- **Fokuspunkt:** Mitte des Produkts
- **Schärfe:** Gestochen scharf, keine Bewegungsunschärfe

---

## Responsive Überlegungen

### Sichere Zonen

Alle Bilder sollten sichere Zonen für Textüberlagerungen und responsives Zuschneiden berücksichtigen:

**Hero-Bilder:**
- **Desktop:** Zentrale 60% ist sichere Zone
- **Mobil:** Zentrale 80% ist sichere Zone
- **Textbereich:** Linke 30% (frei halten)

**Kategorie-Kacheln:**
- **Textbereich:** Untere 40% (Verlaufsüberlagerung)
- **Motivbereich:** Obere 60%

**Banner:**
- **Textbereich:** Linke oder rechte 40%
- **Bildbereich:** Gegenüberliegende 60%

---

## Lieferformat

### Dateinamen-Konvention

```
[kategorie]-[produktname]-[variante]-[ansicht].[ext]

Beispiele:
polo-premium-baumwolle-navy-vorne.jpg
polo-premium-baumwolle-navy-hinten.jpg
polo-premium-baumwolle-weiss-vorne.jpg
cargo-taktisch-khaki-vorne.jpg
hero-fruehling-kollektion-desktop.jpg
hero-fruehling-kollektion-mobil.jpg
bento-neuheiten.jpg
kategorie-bestseller.jpg
```

### Ordnerstruktur

```
/images
  /hero
    - hero-main.jpg
    - hero-main-mobile.jpg
    - newarrivalbanner.jpg
  /products
    /polo
      - polo-[name]-[farbe]-vorne.jpg
      - polo-[name]-[farbe]-hinten.jpg
      - polo-[name]-[farbe]-detail.jpg
    /cargo
      - cargo-[name]-[farbe]-vorne.jpg
    /chino
      - chino-[name]-[farbe]-vorne.jpg
    /jacket
      - jacket-[name]-[farbe]-vorne.jpg
  /categories
    - kategorie-bestseller.jpg
    - kategorie-neuheiten.jpg
    - kategorie-sale.jpg
  /bento
    - bento-neuheiten.jpg
    - bento-premium.jpg
    - bento-style-guide.jpg
    - bento-sale.jpg
    - bento-bestseller.jpg
    - bento-kollektionen.jpg
  /banners
    - banner-[name].jpg
  /testimonials
    - testimonial-[name].jpg
  /blog
    - blog-[artikel-slug].jpg
```

---

## Qualitätscheckliste

### Checkliste vor Lieferung

- [ ] **Auflösung:** Erfüllt minimale Pixelabmessungen
- [ ] **Seitenverhältnis:** Korrekt für beabsichtigte Verwendung
- [ ] **Farbraum:** sRGB eingebettet
- [ ] **Dateigröße:** Innerhalb angegebener Grenzen
- [ ] **Kompression:** 85-90% Qualität
- [ ] **Benennung:** Folgt Konvention
- [ ] **Hintergrund:** Sauber (weiß für Produkte)
- [ ] **Beleuchtung:** Konsistent über Set
- [ ] **Fokus:** Durchgehend scharf
- [ ] **Komposition:** Motiv richtig gerahmt
- [ ] **Sichere Zonen:** Kritische Elemente geschützt
- [ ] **Farbgenauigkeit:** Entspricht physischem Produkt
- [ ] **Keine Artefakte:** Keine Kompressionsartefakte oder Rauschen
- [ ] **Ausrichtung:** Korrekt (nicht gedreht)

---

## Schnellreferenz-Tabelle

| Komponente | Seitenverhältnis | Min. Abmessungen | Anzeigegröße | Hintergrund |
|-----------|------------------|------------------|--------------|-------------|
| Hero (Desktop) | 3:2 | 2400×1600px | Flexibel | Beliebig |
| Hero (Mobil) | 3:4 | 1200×1600px | 200-450px | Beliebig |
| Produktraster | 1:1 | 1200×1200px | 380px | Weiß |
| Kategorie-Kacheln | 1:1 oder 4:3 | 1600×1600px | 450px | Beliebig |
| Bento Hoch | 2:3 | 1200×1800px | Variabel | Beliebig |
| Bento Breit | 16:9 | 1600×900px | Variabel | Beliebig |
| Bento Quadrat | 1:1 | 1200×1200px | Variabel | Beliebig |
| Kollektions-Banner | 4:3 oder 1:1 | 1600×1200px | Responsiv | Beliebig |
| Neuheiten-Banner | 3:1 | 2400×800px | 200-450px | Beliebig |
| Produktdetail | 1:1 | 2000×2000px | Responsiv | Weiß |
| Thumbnails | 1:1 | 400×400px | 80px | Weiß |
| Testimonials | 1:1 | 200×200px | 48px | Neutral |
| Blog Featured | 3:2 | 1600×1067px | Responsiv | Beliebig |

---

## Kontakt & Support

Für Fragen oder Klarstellungen zu diesen Richtlinien:

**Projekt:** ZEHN E-Commerce-Plattform
**Dokumentversion:** 1.0
**Letzte Aktualisierung:** 13. März 2026

---

**Hinweis:** Diese Richtlinien basieren auf der aktuellen ZEHN-Website-Implementierung. Alle Spezifikationen wurden gegen die tatsächliche Codebasis überprüft, um Genauigkeit zu gewährleisten. Bilder müssen für die Web-Bereitstellung optimiert werden, während professionelle Qualitätsstandards beibehalten werden.
