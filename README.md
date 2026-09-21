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
