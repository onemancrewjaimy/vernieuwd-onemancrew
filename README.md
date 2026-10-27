# ONEMANCREW website

Deze website is gebouwd met platte HTML, CSS en JavaScript. Geen build-stap, geen frameworks. Je kunt de bestanden direct op elke standaardhosting zetten (bijvoorbeeld via FTP, Netlify, Vercel of GitHub Pages) en de site werkt meteen.

Dit document legt uit hoe je de site beheert: afbeeldingen en video's toevoegen, portfolioprojecten aanpassen, de overgebleven `[TEMPLATE]`-teksten invullen en het contactformulier koppelen.

## Inhoud

1. [Mappenstructuur](#mappenstructuur)
2. [Afbeeldingen en video's toevoegen](#afbeeldingen-en-videos-toevoegen)
3. [Projecten toevoegen aan het portfolio](#projecten-toevoegen-aan-het-portfolio)
4. [Template-teksten invullen](#template-teksten-invullen)
5. [Het contactformulier koppelen](#het-contactformulier-koppelen)
6. [Kleuren en stijl aanpassen](#kleuren-en-stijl-aanpassen)
7. [Iconen](#iconen)
8. [De site lokaal bekijken](#de-site-lokaal-bekijken)
9. [Checklist voor livegang](#checklist-voor-livegang)
10. [Klantportaal (/portaal)](#klantportaal-portaal)

## Mappenstructuur

```
/index.html              Homepage
/over-ons.html            Over ons
/portfolio.html           Portfolio met filter en modal
/contact.html              Contactpagina met formulier en FAQ
/assets/css/style.css     Alle stijl, een bestand voor de hele site
/assets/js/main.js        Alle interactie, een bestand voor de hele site
/assets/js/portfolio-data.js   Projectdata voor portfolio en de "Laatste werk" slideshow
/assets/img/bts/           Behind-the-scenes foto's
/assets/img/portfolio/     Ruimte voor eigen portfoliobeelden, momenteel niet verplicht (zie hieronder)
/assets/video/             Ruimte voor eigen videobestanden
/assets/icons/             Favicon
```

Header en footer staan letterlijk op elke pagina herhaald in de HTML. Pas je bijvoorbeeld het telefoonnummer aan, doe dat dan op alle vier de pagina's (zoek en vervang werkt hier prima, het nummer staat er steeds exact hetzelfde: `+31 6 28637074` in leestekst en `+31628637074` in de `tel:`-links).

## Afbeeldingen en video's toevoegen

### Behind-the-scenes foto's

De galerij op de pagina "Over ons" en de achtergrond van een aantal secties verwachten bestanden met deze naam:

```
assets/img/bts/bts-01.jpg
assets/img/bts/bts-02.jpg
...
assets/img/bts/bts-12.jpg
```

Zet je eigen foto's onder precies deze naam in die map en ze verschijnen automatisch. Ontbreekt een bestand nog, dan toont de site netjes een donker vlak met "Foto volgt binnenkort" in plaats van een kapotte afbeelding. Zo kun je de site online zetten voordat alle foto's binnen zijn.

Let op: zolang er nog `bts-XX.jpg`-bestanden ontbreken, meldt de browserconsole (devtools) daarvoor een netwerkfout per ontbrekende foto. Dat is normaal browsergedrag bij een niet-bestaand bestand en is niet vanuit de code te onderdrukken. Zodra alle twaalf foto's op hun plek staan, is de console weer volledig foutloos.

Aanbevolen formaat: liggend voor achtergronden (rond 1920 bij 1080 pixels), staand of liggend voor de galerij zelf (rond 1200 pixels breed is ruim voldoende). JPG of WebP, comprimeer je foto's voor je ze uploadt, dat scheelt laadtijd.

### Hero-video op de homepage

Op dit moment toont de hero van de homepage een foto (`bts-01.jpg`) als achtergrond. Wil je hier een video van maken? Open `index.html`, zoek naar `hero__media` en volg de instructie in de HTML-commentaar direct daarboven. In het kort voeg je een `<video>`-element toe met `autoplay muted loop playsinline` en een `poster`-afbeelding, of een YouTube of Vimeo embed.

### Videoplaceholders in het portfolio

Overal waar een video hoort te staan (portfoliokaarten, de projectmodal, de slideshow) zie je nu een donker vlak met een afspeelknop en de tekst "Video volgt binnenkort". Zoek in `index.html` en `portfolio.html` naar `video-placeholder` en vervang dat blokje door een `<video>`-element of een YouTube of Vimeo `<iframe>`-embed zodra je de echte video hebt.

### Portfoliobeelden

De portfoliokaarten gebruiken op dit moment bewust geen losse afbeeldingsbestanden. Zodra je een echte thumbnail voor een project hebt, zet die dan in `assets/img/portfolio/` en voeg een `<img>` toe binnen `.portfolio-card__media` in de code die de kaart opbouwt (zie hieronder bij "Projecten toevoegen").

## Projecten toevoegen aan het portfolio

Alle portfolioprojecten staan in één bestand: `assets/js/portfolio-data.js`. Zowel de portfoliopagina als de "Laatste werk" slideshow op de homepage lezen uit deze ene lijst, je hoeft dus maar op één plek iets aan te passen.

Een project ziet er zo uit:

```js
{
  id: 'project-07',
  client: 'Naam van de klant',
  category: 'werving',              // 'werving', 'info' of 'advertenties'
  categoryLabel: 'Wervingsvideo',
  title: 'Titel van het project',
  summary: 'Een korte zin over het resultaat, voor op de kaart.',
  challenge: 'De vraag of het probleem van de klant.',
  approach: 'Hoe ONEMANCREW dit heeft aangepakt.',
  result: 'Wat de video heeft opgeleverd.',
  date: '2026-09',                  // JJJJ-MM, bepaalt de volgorde in de slideshow
  featured: true,
}
```

Om een nieuw project toe te voegen, kopieer je een bestaand blok tussen de `{ }` in de lijst, plak je het erbij en pas je de waarden aan. Let op de komma's tussen de projecten. Een unieke `id` is verplicht (gebruik geen spaties, bijvoorbeeld `project-07`), de rest van de site werkt de kaart, de filters en de modal automatisch bij.

De categorie moet exact `werving`, `info` of `advertenties` zijn, dat zijn dezelfde waarden als de filterknoppen op de portfoliopagina. Een andere waarde betekent dat het project bij geen enkel filter verschijnt.

Een project verwijderen kan door het hele blok tussen `{ }` (inclusief de komma erna) weg te halen.

## Template-teksten invullen

Zoek in de code op de tekst `[TEMPLATE` om alles te vinden wat nog is ingevuld met voorbeeldtekst:

- De drie aanbodkaarten op de homepage (Wervingsvideo's, Info- en instructievideo's, Recruitment advertenties): omschrijving en bullets.
- De uitrustingslijst op "Over ons": vul je eigen cameramodel, microfoons, montagesoftware en dergelijke in.
- De FAQ op de contactpagina: prijsindicatie, doorlooptijd, wat een klant moet aanleveren en je werkgebied.
- Het KvK-nummer in de footer van elke pagina.

Zoek daarnaast naar tekst tussen vierkante haken zoals `[XX]%`, `[Naam]` en `[Testimonial volgt...]`. Dat zijn:

- De resultaatcijfers op de homepage (bijvoorbeeld "35%" bij "Snellere invulling van vacatures"). Dit zijn nu voorbeeldcijfers met een tellende animatie. Vervang het getal in de HTML (`data-counter-to="35"`) zodra je eigen cijfers hebt.
- De testimonialkaarten en klantlogo's op de homepage, dit zijn placeholders totdat je echte reacties en logo's hebt.
- De LinkedIn- en Instagram-links in de footer, deze verwijzen nu naar `onemancrew` als voorbeeld, pas ze aan naar je eigen profielen.

## Het contactformulier koppelen

Het formulier op `contact.html` werkt nu alleen lokaal: bij versturen simuleert de site een geslaagde verzending zodat je de werking kunt testen, maar er wordt nog niets echt verstuurd. Er zijn twee eenvoudige manieren om dit live te koppelen.

### Optie 1: Formspree

1. Maak een account en een formulier aan op [formspree.io](https://formspree.io) en kopieer het endpoint (iets als `https://formspree.io/f/abcdwxyz`).
2. Open `contact.html`, zoek het `<form>`-element (met `data-contact-form`) en zet het `action`-attribuut op dat endpoint. Laat `method="POST"` staan.
3. Open `assets/js/main.js`, zoek de functie `initContactForm` en de regel `event.preventDefault();` binnen de `submit`-handler. Verwijder die regel (of vervang `simulateSubmit()` door een `fetch()`-aanroep naar het Formspree-endpoint) zodat het formulier daadwerkelijk verstuurt.

### Optie 2: Netlify Forms

1. Voeg in `contact.html` aan het `<form>`-element `data-netlify="true"` toe.
2. Zet een verborgen veld terug in het formulier: `<input type="hidden" name="form-name" value="contact">`.
3. Verwijder in `assets/js/main.js` de regel `event.preventDefault();` in `initContactForm`, zodat Netlify de normale verzending van het formulier kan afvangen.
4. Zodra je de site opnieuw bouwt op Netlify, herkent Netlify het formulier automatisch.

In beide gevallen blijft de client-side validatie (verplichte velden, geldig e-mailadres) gewoon werken: die controleert de invoer voordat het formulier wordt verstuurd.

## Kleuren en stijl aanpassen

Alle kleuren, lettergroottes en tussenruimtes staan bovenaan in `assets/css/style.css`, onder het kopje "DESIGN TOKENS". Bijvoorbeeld:

```css
--color-accent: #d07335;   /* de hoofdaccentkleur */
--color-teal: #148a8a;     /* tweede kleur, gebruikt in de gradient */
```

Pas je hier een kleur aan, dan verandert die overal op de site in één keer mee. Let op: `--color-accent-dark` is een bewust wat donkerder getinte versie van de accentkleur, deze wordt gebruikt voor tekst op lichte achtergronden zodat het contrast voldoende hoog blijft (WCAG AA). Maak je de hoofdaccentkleur lichter of donkerder, controleer dan ook of `--color-accent-dark` en `--gradient-spice-dark` nog voldoende contrast geven met een contrastchecker (bijvoorbeeld [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/)).

## Iconen

De site gebruikt uitsluitend [Lucide Icons](https://lucide.dev) via een CDN-script (`assets/js/main.js` roept `lucide.createIcons()` aan zodra de pagina laadt). Lucide bevat geen herkenbare merklogo's meer (LinkedIn en Instagram zijn er bijvoorbeeld uitgehaald), daarom gebruikt de footer voor die twee social links bewust neutrale Lucide-iconen (`briefcase` en `aperture`) in plaats van de echte logo's. Wil je toch de herkenbare LinkedIn- en Instagram-vormen, dan moet je daarvoor een los logo-bestand toevoegen, dat is dan geen Lucide-icoon meer.

Een nieuw icoon toevoegen doe je met `<i data-lucide="naam-van-icoon"></i>`, de volledige lijst met beschikbare namen staat op [lucide.dev/icons](https://lucide.dev/icons).

## De site lokaal bekijken

Omdat de site geen build-stap nodig heeft, kun je `index.html` in theorie direct openen in je browser. Voor een paar functies (zoals het laden van `assets/js/portfolio-data.js`) werkt dat prettiger via een kleine lokale server. Heb je Node.js geïnstalleerd, run dan vanuit de projectmap:

```
npx serve .
```

en open de URL die in de terminal verschijnt. Heb je Python geïnstalleerd, dan kan ook:

```
python -m http.server 8000
```

## Checklist voor livegang

- [ ] Alle `bts-01.jpg` tot en met `bts-12.jpg` toegevoegd in `assets/img/bts/`
- [ ] Echte video's of embeds toegevoegd waar nu "Video volgt binnenkort" staat
- [ ] Alle `[TEMPLATE]`-teksten ingevuld (zoek op `[TEMPLATE` in de hele projectmap)
- [ ] Resultaatcijfers op de homepage vervangen door echte cijfers
- [ ] Testimonials en klantlogo's vervangen door echte reacties en logo's
- [ ] Eigen projecten toegevoegd in `assets/js/portfolio-data.js`
- [ ] KvK-nummer ingevuld in de footer van alle vier de pagina's
- [ ] LinkedIn- en Instagram-links in de footer aangepast
- [ ] Contactformulier gekoppeld aan Formspree of Netlify Forms
- [ ] `og-image.jpg` (1200 bij 630 pixels) toegevoegd in `assets/img/` voor een nette voorvertoning bij het delen op social media
- [ ] Site getest op telefoon, tablet en desktop

## Klantportaal (/portaal)

Het klantportaal is een los deel van dezelfde site, onder `/portaal`. Het is
ook platte HTML/CSS/JS, geen build-stap: de Firebase JS SDK wordt als
ES-module rechtstreeks vanaf Google's CDN geladen, net zoals de hoofdsite
fonts en iconen via een CDN laadt. Alleen de losse scripts (Cloud
Functions, het admin-claim-scriptje, de rules-tests) zijn eigen kleine
Node-projectjes met hun eigen `package.json`, die nooit meegaan naar de
live site.

```
/portaal/login.html                     Inlogscherm
/portaal/index.html                     "Jouw projecten." (klant, projectenraster)
/portaal/project.html                   Projectdetail: fase, versies, feedback, zijbalk
/portaal/admin/index.html               Beheerdersoverzicht: klanten en projecten (admin-only)
/portaal/admin/project.html             Eén project beheren: fase, versies, deadlines, bestanden, feedback
/portaal/assets/css/portal.css          Eigen stijlblad voor het portaal
/portaal/assets/js/firebase-init.js     Initialiseert de Firebase-app
/portaal/assets/js/firebase-config.js   Jouw echte projectwaarden (niet in git)
/portaal/assets/js/auth.js              Inloggen, uitloggen, rollen, route-guard
/portaal/assets/js/data.js              Alle Firestore-toegang (projecten/versies/feedback/...)
/portaal/assets/js/format.js            Datum- en tijdcode-notatie
/portaal/assets/js/login.js             Pagina-script voor login.html
/portaal/assets/js/projecten.js         Pagina-script voor index.html
/portaal/assets/js/project.js           Pagina-script voor project.html
/portaal/assets/js/admin-overzicht.js   Pagina-script voor admin/index.html
/portaal/assets/js/admin-project.js     Pagina-script voor admin/project.html
/functions/index.js                     Cloud Functions: afspeellinks, klantaccounts aanmaken
/firestore.rules                        Beveiligingsregels Firestore
/firebase.json                          Firebase-projectconfig (rules, emulators)
/.firebaserc                            Welk Firebase-project (niet in git)
/scripts/set-admin.js                   Eenmalig: zet jouw admin-rol
/scripts/seed-demo.js                   Demo-klant en -project inschieten om mee te testen
/tests/firestore.rules.test.js          Rules-tests tegen de emulator
```

**Geen Firebase Storage.** Firebase Storage vraagt sinds kort altijd het
betaalde Blaze-plan, ook voor het gratis quotum. Daarom gebruikt dit
project het niet: PDF's (offerte/voorwaarden, moodboard, script) koppel je
als gewone link (bijvoorbeeld een Drive- of WeTransfer-link) in een los
tekstveld bij het project, en eindbestanden (video) lever je op via Bunny,
niet via Firebase. Zie je later alsnog een reden om Storage te gebruiken,
dan vraagt dat opnieuw om Blaze, net als Cloud Functions in stap 3.

**Firestore-datamodel (stap 2):**

```
clients/{clientId}                                bedrijfsnaam, contactpersoon, email, uids[]
projects/{projectId}                              titel, type, clientIds[], fase, status,
                                                   startdatum, opleverdatum, afspraken{...},
                                                   retentionDays
projects/{id}/versions/{versionId}                label, bunnyVideoId, duur, aangemaaktOp,
                                                   approvedAt, approvedBy
projects/{id}/feedback/{feedbackId}               versionId, tijdcode, tekst, auteur{uid,naam,rol},
                                                   status, aangemaaktOp
projects/{id}/feedback/{id}/replies/{replyId}     tekst, auteur{uid,naam,rol}, aangemaaktOp
projects/{id}/deadlines/{deadlineId}              titel, datum, verantwoordelijke, afgerond
projects/{id}/files/{fileId}                      naam, url, type (document|eindbestand),
                                                   zichtbaarNaGoedkeuring
```

`projects/*/files` gebruikt een gewone `url`, geen Storage-pad (zie
hierboven): een klant mag een `document`-bestand altijd lezen, en een
`eindbestand` pas zodra `zichtbaarNaGoedkeuring` op `true` staat. Een
klant mag alleen feedback/replies plaatsen op zijn eigen naam (uid en rol
moeten kloppen) en een versie alleen "goedkeuren" (enkel de velden
`approvedAt`/`approvedBy`, verder niets). Zie `firestore.rules` voor de
precieze regels en `tests/firestore.rules.test.js` voor de 28 tests die
dat afdekken.

**Status:** alle 5 stappen uit het stappenplan staan: auth en rollen,
projectpagina's, Bunny-video, de beheerderszijde en meldingen. Meldingen
zijn bewust in-portaal gehouden (geen losse e-maildienst nodig): de
beheerderspagina toont bovenaan hoeveel projecten op een reactie wachten,
en elk project in de lijst laat het aantal open feedbackpunten zien,
oplopend gesorteerd zodat het dringendste bovenaan staat. De
videospeler op `/portaal/project.html` haalt een echte,
tijdelijke afspeellink op via een Cloud Function zodra een versie een
`bunnyVideoId` heeft; zonder dat veld toont hij de placeholder. Feedback
geven gaat via een los tijdcode-veld in het formulier (geen klikbare
tijdlijn meer, die werkte niet precies genoeg op specifieke momenten).

`/portaal/admin/` is de beheerderszijde: klanten en projecten aanmaken,
per project de fase/afspraken bijwerken, versies (incl. Bunny video-GUID)
toevoegen, deadlines en bestanden beheren, en op feedback reageren of die
als verwerkt markeren. Een nieuwe klant krijgt automatisch een
Firebase-account (willekeurig wachtwoord, onbekend) en een
wachtwoord-instelmail via Firebase's eigen e-mailsysteem, geen losse
e-mailservice nodig. Een video aan een versie koppelen is nog altijd het
plakken van het video-GUID uit Bunny's eigen dashboard (daar los van
uploaden hoort nog niet bij dit project); daadwerkelijk uploaden vanuit
het portaal zelf stond niet in de kernscope en kan later nog.

### Firebase-project koppelen

1. Maak een project op [console.firebase.google.com](https://console.firebase.google.com).
2. Zet **Authentication > Sign-in method > E-mail/wachtwoord** aan. Laat
   zelf-registratie uit, je maakt klantaccounts zelf aan (dat automatiseren
   we in een latere stap; voorlopig kan dat handmatig via de Firebase
   Console onder Authentication > Users > Add user).
3. Maak een **Firestore-database** aan (productiemodus, de rules in dit
   project regelen de toegang).
4. Ga naar **Projectinstellingen > Jouw apps > Web-app** en maak een
   web-app aan. Kopieer de config.

### Secrets zetten

Dit project gebruikt geen `.env` voor de portaal-frontend (dat kan niet
zonder build-stap), maar wel een vergelijkbaar voorbeeld/echt-patroon met
twee bestanden die bewust niet in git staan:

1. Kopieer `portaal/assets/js/firebase-config.example.js` naar
   `portaal/assets/js/firebase-config.js` en vul de waarden van stap 5
   hierboven in. (Dit zijn geen geheimen, zie de toelichting in dat
   bestand, maar zo blijft elk lokaal project zijn eigen waarden houden.)
2. Kopieer `.firebaserc.example` naar `.firebaserc` en vul je Firebase
   project-ID in.

### Bunny Stream koppelen (stap 3)

Video loopt via [Bunny Stream](https://bunny.net), nooit via Firebase
Storage. Dit vraagt twee aparte sleutels uit je Bunny Stream-bibliotheek
(tabblad **API** voor de eerste, tabblad **Security** voor de tweede, dit
zijn bewust twee verschillende sleutels):

1. **API Key** van de bibliotheek: nodig om later (stap 4, admin-upload)
   video's te kunnen aanmaken/uploaden.
2. **Token authentication key**: nodig om een tijdelijke, afgetekende
   afspeellink te maken. Zet **Token Authentication** aan op het
   Security-tabblad, anders werkt geen enkele embed-link meer.

De `getPlaybackUrl`-functie in `functions/index.js` gebruikt alleen de
token-sleutel, en alleen server-side: hij staat nooit in de
portaal-frontend. Lokaal testen (met de emulator) kan met een gitignored
bestand `functions/.secret.local`:

```
BUNNY_TOKEN_KEY=<token-authentication-key-uit-bunny>
```

Voor een echte deploy hoort die sleutel in Firebase Secret Manager, niet
in een bestand:

```
cd functions
npm install
firebase functions:secrets:set BUNNY_TOKEN_KEY
firebase deploy --only functions
```

Een versie (`projects/{id}/versions/{versionId}`) krijgt pas een
werkende player zodra het veld `bunnyVideoId` is ingevuld met het
video-GUID uit Bunny (dat koppelen gebeurt in stap 4 vanuit het
beheerdersscherm; tot die tijd kan het ook handmatig in Firestore).

### Jouw admin-account aanmaken

Er is geen hardcoded wachtwoord in dit project, dat zou een beveiligingsrisico
zijn. Zo maak je zelf je eigen admin-account aan:

1. Maak in de Firebase Console (Authentication > Users > Add user) een
   gebruiker aan met `contact@onemancrew.nl` en een wachtwoord naar keuze.
2. Zet de admin-rol op dat account:
   ```
   cd scripts
   npm install
   # GOOGLE_APPLICATION_CREDENTIALS moet naar een service-account-sleutel
   # wijzen (Projectinstellingen > Service accounts > Nieuwe private key).
   node set-admin.js contact@onemancrew.nl
   ```
3. Log in op `/portaal/login.html`. Je komt automatisch op
   `/portaal/admin/` terecht in plaats van de klantweergave.

### Security rules deployen en testen

```
firebase deploy --only firestore:rules
```

Rules-tests draaien lokaal tegen de emulator, nooit tegen een echt project.
De Firestore-emulator vraagt zelf om **Java 21 of hoger** (niet door
Firebase zelf geïnstalleerd, dat moet je los doen, bijvoorbeeld via
`winget install EclipseAdoptium.Temurin.21.JDK`):

```
cd tests
npm install
npm test
```

### Demo-data: een klant en project om mee te testen

```
cd scripts
npm install
# GOOGLE_APPLICATION_CREDENTIALS moet weer naar je service-account-sleutel wijzen
node seed-demo.js
```

Dit maakt (of overschrijft) één demo-klant met een demo-project, inclusief
twee versies, feedback, deadlines en bestanden, en print het e-mailadres
en wachtwoord waarmee je op `/portaal/login.html` kunt inloggen als klant
(niet als admin) om het portaal te bekijken zoals een klant het ziet.

### Lokaal bekijken

Dezelfde statische server als de hoofdsite (zie
["De site lokaal bekijken"](#de-site-lokaal-bekijken) hierboven) serveert
ook `/portaal`, bijvoorbeeld `http://localhost:8000/portaal/login.html`.
Zonder een eigen `firebase-config.js` met echte waarden werkt inloggen
niet, de rest van de pagina (styling, lay-out) is dan nog gewoon te
bekijken. Let op: gebruik hiervoor een server die paden exact doorgeeft
(zoals een simpele Node `http`-server), niet een server met "clean URLs"
die `.html` en querystrings herschrijft (zoals het npm-pakket `serve`
standaard doet), anders werkt `/portaal/project.html?id=...` niet.
