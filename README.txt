LIS ONBOARDING – ØNH AHUS – V24

Pakken bygger på den publiserte v23-koden fra imadjala/imadjalanew.github.io,
commit c0977d27a61063331a06d09f5a6d9dc4cdc955d6.

NYTT
Ny forside med hero, søk og kategoriene Kom i gang, På vakt, Fagområder,
Praktisk og Læring. Sju fagoversikter med 803 temaoppføringer fra planleggingen.
Dette er oversikter, ikke ferdige kliniske artikler eller behandlingsråd.
Alle sju opprinnelige sideobjekter i content.json er uendret.
Søk og dropdown-navigasjon er videreført. Søk finner også nye oversikter.
En ny AI-generert ENT-illustrasjon er inkludert i assets/ent-hero.png.
Det tidligere genererte bildet var ikke tilgjengelig i samtaleoverføringen.

PUBLISERING PÅ EKSISTERENDE NETTSTED
1. Pakk ut zip-filen.
2. Last opp filene og assets-mappen til samme nivå som eksisterende index.html
   i GitHub-repositoriet. Ta med alle HTML-filer, app.js, style.css og content.json.
3. Lagre endringene. Siden bruker eksisterende GitHub Pages-oppsett.
4. Åpne nettstedet og oppdater med Ctrl+F5.
Ingen filer er publisert automatisk fra denne oppgaven.

LOKAL FORHÅNDSVISNING
Siden laster content.json og må åpnes via en webserver, ikke ved å dobbeltklikke
index.html. Med Python installert: åpne terminal i den utpakkede mappen,
kjør python -m http.server 8000 og åpne http://localhost:8000.

VIDERE REDIGERING
Eksisterende pages -> slug/title/audience/nodes er beholdt. Fagoversiktene
bruker de samme nodetypene p, h2 og ul. Nye felt description og category
brukes til forsidekortene. home.sections bestemmer rekkefølge og kategorier.
Temaene er tekstoppføringer, slik at de ikke peker til artikler som ikke finnes.
Endre både content.json og tilhørende HTML-fil hvis en sides slug endres.

KONTROLL
Opprinnelig innhold er sammenlignet direkte med GitHub-versjonen.
DOM-baserte funksjonstester er bestått for alle 14 sider, 5 kategorier,
14 forsidekort, interne lenker, søketreff og avsnittsankre, dropdown-verdier,
tomme/korte søk og feilmelding ved mislykket lasting av content.json.
Nettleseroppstart ble blokkert i arbeidsmiljøet; visuell kontroll på PC og
mobil bør derfor gjøres før publisering. Kontroller også ekstern podkast.
