/**
 * ONEMANCREW - projectdata
 *
 * Alle projecten voor de portfoliopagina en de "Laatste werk" slideshow op de
 * homepage komen uit deze ene lijst. Wil je een project toevoegen, aanpassen
 * of verwijderen? Doe dat hier, de rest van de site werkt dit automatisch bij.
 *
 * Velden:
 * - id:            unieke code, geen spaties (bijvoorbeeld "project-07")
 * - client:        naam van de klant
 * - category:      "werving" | "info" | "advertenties"
 * - categoryLabel: leesbare naam van de categorie, zoals getoond op de kaart
 * - title:         projecttitel
 * - summary:       korte omschrijving van het resultaat (1 zin, voor de kaart en slideshow)
 * - challenge:     de vraag of het probleem van de klant (voor de modal)
 * - approach:      hoe ONEMANCREW dit heeft aangepakt (voor de modal)
 * - result:         wat de video heeft opgeleverd (voor de modal)
 * - date:          "JJJJ-MM", wordt gebruikt om de nieuwste projecten te bepalen
 * - featured:      true/false, gebruikt als extra signaal voor de slideshow
 *
 * Thumbnails en videospelers zijn voorlopig placeholders (zie video-placeholder
 * in style.css en de toelichting in README.md). Zodra er echt beeldmateriaal
 * is, kan er in portfolio-card__media en modal__media een <img> of <video>
 * worden toegevoegd.
 */

const ONEMANCREW_PROJECTS = [
  {
    id: 'project-01',
    client: '[TEMPLATE: klantnaam]',
    category: 'werving',
    categoryLabel: 'Wervingsvideo',
    title: '[TEMPLATE: projecttitel invullen]',
    summary: '[TEMPLATE: korte omschrijving van het resultaat in een zin]',
    challenge: '[TEMPLATE: welke vraag of welk probleem had deze klant]',
    approach: '[TEMPLATE: hoe heeft ONEMANCREW dit aangepakt]',
    result: '[TEMPLATE: wat leverde de video concreet op]',
    date: '2026-08',
    featured: true,
  },
  {
    id: 'project-02',
    client: '[TEMPLATE: klantnaam]',
    category: 'info',
    categoryLabel: 'Instructievideo',
    title: '[TEMPLATE: projecttitel invullen]',
    summary: '[TEMPLATE: korte omschrijving van het resultaat in een zin]',
    challenge: '[TEMPLATE: welke vraag of welk probleem had deze klant]',
    approach: '[TEMPLATE: hoe heeft ONEMANCREW dit aangepakt]',
    result: '[TEMPLATE: wat leverde de video concreet op]',
    date: '2026-07',
    featured: true,
  },
  {
    id: 'project-03',
    client: '[TEMPLATE: klantnaam]',
    category: 'advertenties',
    categoryLabel: 'Recruitment advertentie',
    title: '[TEMPLATE: projecttitel invullen]',
    summary: '[TEMPLATE: korte omschrijving van het resultaat in een zin]',
    challenge: '[TEMPLATE: welke vraag of welk probleem had deze klant]',
    approach: '[TEMPLATE: hoe heeft ONEMANCREW dit aangepakt]',
    result: '[TEMPLATE: wat leverde de video concreet op]',
    date: '2026-06',
    featured: true,
  },
  {
    id: 'project-04',
    client: '[TEMPLATE: klantnaam]',
    category: 'werving',
    categoryLabel: 'Wervingsvideo',
    title: '[TEMPLATE: projecttitel invullen]',
    summary: '[TEMPLATE: korte omschrijving van het resultaat in een zin]',
    challenge: '[TEMPLATE: welke vraag of welk probleem had deze klant]',
    approach: '[TEMPLATE: hoe heeft ONEMANCREW dit aangepakt]',
    result: '[TEMPLATE: wat leverde de video concreet op]',
    date: '2026-05',
    featured: true,
  },
  {
    id: 'project-05',
    client: '[TEMPLATE: klantnaam]',
    category: 'info',
    categoryLabel: 'Onboardingvideo',
    title: '[TEMPLATE: projecttitel invullen]',
    summary: '[TEMPLATE: korte omschrijving van het resultaat in een zin]',
    challenge: '[TEMPLATE: welke vraag of welk probleem had deze klant]',
    approach: '[TEMPLATE: hoe heeft ONEMANCREW dit aangepakt]',
    result: '[TEMPLATE: wat leverde de video concreet op]',
    date: '2026-04',
    featured: false,
  },
  {
    id: 'project-06',
    client: '[TEMPLATE: klantnaam]',
    category: 'advertenties',
    categoryLabel: 'Recruitment advertentie',
    title: '[TEMPLATE: projecttitel invullen]',
    summary: '[TEMPLATE: korte omschrijving van het resultaat in een zin]',
    challenge: '[TEMPLATE: welke vraag of welk probleem had deze klant]',
    approach: '[TEMPLATE: hoe heeft ONEMANCREW dit aangepakt]',
    result: '[TEMPLATE: wat leverde de video concreet op]',
    date: '2026-03',
    featured: false,
  },
];

/**
 * Geeft de N nieuwste projecten terug, gesorteerd op datum (nieuw naar oud).
 * Wordt gebruikt door de "Laatste werk" slideshow op de homepage.
 */
function getLatestProjects(count) {
  return [...ONEMANCREW_PROJECTS]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, count);
}

function getProjectById(id) {
  return ONEMANCREW_PROJECTS.find((project) => project.id === id) || null;
}
