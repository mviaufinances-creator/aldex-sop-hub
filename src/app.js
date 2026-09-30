/* Aldex SOP Hub — application logic (no framework, no build dependencies). */
(function () {
  'use strict';

  /* ───────── Storage (never required for the page to work) ───────── */
  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode / blocked */ } },
    del(key) { try { localStorage.removeItem(key); } catch (e) {} }
  };
  const K_LANG = 'aldexSopHub.lang', K_PROGRESS = 'aldexSopHub.progress.v2', K_TARIFF = 'AldexChinaDutyManualV2', K_DUTY_HISTORY = 'AldexChinaDutyHistoryV1', K_DUTY_VERIFY = 'AldexChinaDutyVerifyV1';

  let lang = store.get(K_LANG, 'en') === 'fr' ? 'fr' : 'en';
  let progress = store.get(K_PROGRESS, {}) || {};
  let currentRole = '';

  /* ───────── i18n ───────── */
  const UI = {
    hub: t('ALDEX SOP HUB', 'CENTRE SOP ALDEX'),
    hubSub: t('Operations procedures', 'Procédures opérationnelles'),
    company: t('Aldex Chemical Company', 'Aldex Chemical Company'),
    home: t('Home', 'Accueil'), directory: t('SOP Directory', 'Répertoire des SOP'),
    live: t('Live Excel Data', 'Données Excel en direct'), tariff: t('Tariff Watch', 'Surveillance des tarifs'),
    departments: t('Departments', 'Départements'), selectRole: t('Select a role…', 'Sélectionner un rôle…'),
    homeTitle: t('Select your department or role to get started.', 'Sélectionnez votre département ou votre rôle pour commencer.'),
    homeSub: t('Each SOP walks you through one step at a time: what to do, what to verify, and what to flag.', 'Chaque SOP vous guide une étape à la fois : quoi faire, quoi vérifier et quoi signaler.'),
    sopsCount: t('{n} SOPs', '{n} SOP'), open: t('Open', 'Ouvrir'), comingSoon: t('Coming soon', 'À venir'),
    continueTitle: t('Continue where you left off', 'Reprendre où vous étiez'),
    startHere: t('Start Here', 'Commencer ici'), startHereSub: t('General controls — read before you start', 'Contrôles généraux — à lire avant de commencer'),
    mainFlow: t('Main shipment workflow', 'Flux principal d’expédition'), moreFlow: t('Additional procedures', 'Procédures supplémentaires'),
    followOrder: t('Follow in order', 'Suivre dans l’ordre'), asNeeded: t('Use as needed', 'Au besoin'),
    startWorkflow: t('Start workflow', 'Commencer le flux'), readStart: t('Read Start Here', 'Lire Commencer ici'),
    steps: t('{n} steps', '{n} étapes'), oneStep: t('1 step', '1 étape'),
    notStarted: t('Not started', 'Non commencé'), inProgress: t('Step {s} of {n}', 'Étape {s} de {n}'), completed: t('Completed', 'Terminé'),
    allSops: t('{role} SOPs', 'SOP — {role}'),
    step: t('Step', 'Étape'), stepOf: t('Step {s} of {n}', 'Étape {s} de {n}'),
    back: t('Back', 'Retour'), next: t('Next', 'Suivant'), complete: t('Complete SOP', 'Terminer le SOP'),
    whatToDo: t('What to do', 'Quoi faire'), verify: t('Verify', 'Vérifier'), important: t('Important', 'Important'),
    youNeed: t('You’ll need:', 'Vous aurez besoin de :'),
    unsure: t('Something doesn’t match or you’re not sure? Stop and flag it before proceeding.', 'Quelque chose ne concorde pas ou vous avez un doute? Arrêtez-vous et signalez-le avant de continuer.'),
    verifiedOf: t('{c} of {n} verified', '{c} sur {n} vérifiés'), allVerified: t('All verified', 'Tout est vérifié'),
    termsQ: t('Shipping terms on the customer PO:', 'Conditions de transport du BC client :'),
    prepaid: t('Prepaid & Charge', 'Prepaid & Charge'), collect: t('Collect', 'Collect'),
    termsPick: t('Select the terms to show only the documents you need.', 'Choisissez les conditions pour n’afficher que les documents requis.'),
    openExcel: t('Open Excel source', 'Ouvrir la source Excel'), openTariff: t('Open Tariff Watch', 'Ouvrir Tariff Watch'),
    zoom: t('Click to enlarge', 'Cliquer pour agrandir'), noShot: t('Screenshot to be added', 'Capture à ajouter'),
    restart: t('↺ Start this SOP over', '↺ Recommencer ce SOP'),
    restartConfirm: t('Start this SOP over? All checkmarks for this SOP will be cleared.', 'Recommencer ce SOP? Toutes les cases cochées de ce SOP seront effacées.'),
    jumpTo: t('Jump to step', 'Aller à l’étape'),
    doneTitle: t('SOP complete', 'SOP terminé'),
    doneAll: t('Every verification item was checked.', 'Tous les éléments de vérification ont été cochés.'),
    doneMissing: t('{n} items were not checked', '{n} éléments n’ont pas été cochés'),
    doneMissing1: t('1 item was not checked', '1 élément n’a pas été coché'),
    doneMissingHelp: t('Go back and confirm them. If any of these are unresolved, flag them before proceeding.', 'Revenez les confirmer. Si l’un d’eux n’est pas résolu, signalez-le avant de continuer.'),
    nextSop: t('Next: {sop}', 'Suivant : {sop}'), nextInList: t('Next in list: {sop}', 'Suivant dans la liste : {sop}'),
    backToList: t('Back to {role} SOPs', 'Retour aux SOP — {role}'), restartShort: t('Start over', 'Recommencer'),
    mainDone: t('Main shipment workflow complete.', 'Flux principal d’expédition terminé.'),
    reviewStep: t('Review step {s}', 'Revoir l’étape {s}'),
    soonTitle: t('SOPs coming soon', 'SOP à venir'),
    soonBody: t('This department is part of the hub. Its procedures will be added here as they are documented.', 'Ce département fait partie du centre. Ses procédures seront ajoutées ici à mesure qu’elles seront documentées.'),
    planned: t('Planned topics', 'Sujets prévus'), allDepts: t('All departments', 'Tous les départements'),
    searchSops: t('Search SOPs…', 'Rechercher un SOP…'), noResults: t('No SOP matches your search.', 'Aucun SOP ne correspond à votre recherche.'),
    dirSub: t('Every procedure, grouped by department.', 'Toutes les procédures, regroupées par département.'),
    sopInfo: t('SOP information', 'Information sur le SOP'), version: t('Version', 'Version'), effective: t('Effective date', 'Date d’entrée en vigueur'),
    purpose: t('Purpose', 'Objectif'), scope: t('Scope', 'Portée'), responsibilities: t('Responsibilities', 'Responsabilités'),
    principle: t('Operating principle', 'Principe opérationnel'), emailReview: t('Continuous email review', 'Surveillance continue des courriels'),
    jimReport: t('When Jim sends the report', 'Lorsque Jim envoie le rapport'), surchargeTitle: t('Current surcharge', 'Surcharge actuelle'),
    separateLine: t('Separate line', 'Ligne distincte'), tariffTitle: t('Chinese-origin tariff control', 'Contrôle des tarifs — origine chinoise'),
    controlRule: t('Control rule', 'Règle de contrôle'),
    liveSub: t('Excel remains the source of truth. This page shows the latest saved workbook data.', 'Excel demeure la source officielle. Cette page affiche les données du dernier classeur enregistré.'),
    liveNote: t('This page shows the embedded operational snapshot. The OneDrive / company-server connection will replace the snapshot automatically once it is configured. You do not need the Excel files on your computer.', 'Cette page affiche l’instantané opérationnel intégré. La connexion OneDrive / serveur de l’entreprise remplacera automatiquement l’instantané lorsqu’elle sera configurée. Vous n’avez pas besoin des fichiers Excel sur votre ordinateur.'),
    liveBefore: t('Before starting the Sales & Logistics workflow, make sure the operational Excel files are open and saved with the most recent data.', 'Avant de commencer le flux Ventes & Logistique, assurez-vous que les fichiers Excel opérationnels sont ouverts et enregistrés avec les données les plus récentes.'),
    refresh: t('↻ Refresh data', '↻ Actualiser les données'), connect: t('Connect Excel files', 'Connecter les fichiers Excel'),
    snapshotLoaded: t('Snapshot loaded — server connection coming soon', 'Instantané chargé — connexion serveur à venir'),
    connected: t('Connected — live read available', 'Connecté — lecture en direct disponible'),
    reconnect: t('Permission needed — click Refresh data', 'Autorisation requise — cliquez sur Actualiser'),
    searchTable: t('Search PO, client, destination, carrier…', 'Rechercher BC, client, destination, transporteur…'),
    rows: t('{n} rows', '{n} lignes'), noData: t('No data available.', 'Aucune donnée disponible.'),
    source: t('Source', 'Source'),
    tariffSub: t('Manual China duty control for the Sales & Logistics workflow. The rate is entered and maintained manually until you change it.', 'Contrôle manuel du droit de douane Chine pour le flux Ventes & Logistique. Le taux est saisi et maintenu manuellement jusqu’à sa prochaine modification.'),
    origin: t('Origin', 'Origine'), destination: t('Destination', 'Destination'), hts: t('HTS / HS reference', 'Référence HTS / HS'),
    rate: t('Current rate', 'Taux actuel'), lastVerified: t('Last verified', 'Dernière vérification'), notes: t('Notes', 'Notes'),
    china: t('China', 'Chine'), usa: t('United States', 'États-Unis'),
    controlledSource: t('Controlled source', 'Source contrôlée'), openSource: t('Open source', 'Ouvrir la source'), editManual: t('Edit manually', 'Modifier manuellement'),
    notConnected: t('Not connected — coming soon', 'Non connectée — à venir'), manualSaved: t('Manual source saved', 'Source manuelle enregistrée'),
    manualTitle: t('Manual Tariff Watch update', 'Mise à jour manuelle de Tariff Watch'),
    manualHelp: t('Enter the current China duty rate. Changes are saved in this browser only.', 'Entrez le taux de droit Chine actuel. Les changements sont enregistrés dans ce navigateur seulement.'),
    cancel: t('Cancel', 'Annuler'),
    serverLocation: t('Server location', 'Emplacement sur le serveur'), pathSub: t('Follow these steps to open the spreadsheet on the server.', 'Suivez ces étapes pour ouvrir le fichier Excel sur le serveur.'),
    path1: t('Open File Explorer on your computer.', 'Ouvrez l’Explorateur de fichiers sur votre ordinateur.'), path2: t('Open the Z: network drive.', 'Ouvrez le lecteur réseau Z:.'),
    path3: t('Open the “{folder}” folder.', 'Ouvrez le dossier « {folder} ».'), path4: t('Open “{wb}”, then select the “{sheet}” worksheet.', 'Ouvrez « {wb} », puis sélectionnez la feuille « {sheet} ».'),
    copyPath: t('Copy path', 'Copier le chemin'), copied: t('Copied', 'Copié'), copyManual: t('Path selected — press Ctrl+C to copy', 'Chemin sélectionné — appuyez sur Ctrl+C pour copier'),
    whereFile: t('Where is this file?', 'Où est ce fichier?'),
    chinaDuty: t('China duty', 'Droit Chine'), dutyRate: t('China duty rate', 'Taux de droit Chine'),
    dutyWidgetNote: t('Manually maintained · tap to update', 'Maintenu manuellement · modifier'),
    editDuty: t('Update China duty rate', 'Mettre à jour le taux de droit Chine'), resetDuty: t('Reset to 41.4%', 'Réinitialiser à 41,4 %'),
    lastUpdated: t('Last updated', 'Dernière mise à jour'), sourceNote: t('Source / note', 'Source / note'), sourcePh: t('Optional source or reference', 'Source ou référence facultative'),
    verifyEyebrow: t('Every 5 days', 'Tous les 5 jours'), verifyTitle: t('Verify the China duty rate', 'Vérifier le taux de droit Chine'),
    verifyBody: t('Confirm that this is still the applicable China duty rate before pricing, quoting or processing a shipment. If you are not sure, flag it and do not guess.', 'Confirmez qu’il s’agit toujours du taux de droit Chine applicable avant de fixer un prix, faire une soumission ou traiter une expédition. En cas de doute, signalez-le et ne devinez pas.'),
    verifyHow: t('If the rate has changed, close this message and update it in Tariff Watch. This reminder comes back in 5 days.', 'Si le taux a changé, fermez ce message et mettez-le à jour dans Tariff Watch. Ce rappel reviendra dans 5 jours.'),
    lastChangedOn: t('Last changed {date}: {from} → {to}', 'Dernière modification {date} : {from} → {to}'),
    defaultSince: t('Site default {rate} since {date} · no manual change yet', 'Taux par défaut {rate} depuis le {date} · aucune modification manuelle'),
    historyTitle: t('Rate change history', 'Historique des changements de taux'),
    historySub: t('Every manual change to the China duty rate, newest first. Saved in this browser.', 'Chaque modification manuelle du taux de droit Chine, la plus récente en premier. Enregistré dans ce navigateur.'),
    changedOn: t('Changed on', 'Modifié le'), rateChange: t('Rate', 'Taux'), effectiveDate: t('Rate date', 'Date du taux'),
    siteDefault: t('Site default', 'Défaut du site'), siteDefaultNote: t('Default rate updated on the website', 'Taux par défaut mis à jour sur le site'), resetChip: t('Reset', 'Réinitialisé'),
    reference: t('Reference', 'Référence'), sourceDoc: t('Source document', 'Document source'), openSop: t('Open: {sop}', 'Ouvrir : {sop}'),
    sourceUrl: t('Source URL', 'URL de la source'), save: t('Save changes', 'Enregistrer'), reset: t('Reset', 'Réinitialiser'), close: t('Close', 'Fermer'),
    saved: t('Saved. This rate stays until you change or reset it.', 'Enregistré. Ce taux reste jusqu’à ce que vous le modifiiez ou le réinitialisiez.'),
    saveFail: t('Could not save in this browser.', 'Impossible d’enregistrer dans ce navigateur.'),
    urlRule: t('The source URL must begin with http:// or https://', 'L’URL de la source doit commencer par http:// ou https://'),
    resetDone: t('Reset to the default rate (41.4%).', 'Réinitialisé au taux par défaut (41,4 %).'),
    tariffRule: t('The displayed China duty rate is manually maintained. Update it when the applicable rate changes; if you are not sure of the current rate, flag it and do not guess.', 'Le taux de droit Chine affiché est maintenu manuellement. Mettez-le à jour lorsque le taux applicable change; en cas de doute sur le taux actuel, signalez-le et ne devinez pas.'),
    excelSoonTitle: t('Excel connection coming soon', 'Connexion Excel à venir'),
    excelSoonBody: t('The direct link to the Aldex Excel source is not available yet. Open the workbook from the company drive, or view the embedded snapshot.', 'Le lien direct vers la source Excel Aldex n’est pas encore disponible. Ouvrez le classeur à partir du lecteur de l’entreprise ou consultez l’instantané intégré.'),
    workbook: t('Workbook', 'Classeur'), sheet: t('Excel tab', 'Onglet Excel'), viewSnapshot: t('View snapshot', 'Voir l’instantané'),
    tariffSoonTitle: t('Tariff source coming soon', 'Source tarifaire à venir'),
    tariffSoonBody: t('No controlled tariff source is connected yet. Add the approved link with “Edit manually”, or flag the rate if it cannot be verified.', 'Aucune source tarifaire contrôlée n’est encore connectée. Ajoutez le lien approuvé avec « Modifier manuellement », ou signalez le taux s’il ne peut pas être vérifié.'),
    fullSize: t('Actual size', 'Taille réelle'), fitSize: t('Fit to screen', 'Ajuster à l’écran'),
    menu: t('Open menu', 'Ouvrir le menu'), roles: t('Roles', 'Rôles'), sops: t('SOPs', 'SOP'), liveShort: t('Live', 'Direct'),
    refreshed: t('Data refreshed from the connected Excel files.', 'Données actualisées à partir des fichiers Excel connectés.'),
    noneConnected: t('No Excel files are connected, so the embedded snapshot is shown.', 'Aucun fichier Excel n’est connecté; l’instantané intégré est affiché.'),
    xlsxLoading: t('The Excel reader is still loading. Try again in a moment.', 'Le lecteur Excel est encore en chargement. Réessayez dans un instant.'),
    readFail: t('Could not read one of the connected workbooks. Make sure it is saved and try again.', 'Impossible de lire un des classeurs connectés. Assurez-vous qu’il est enregistré et réessayez.'),
    noPicker: t('This browser cannot connect Excel files directly. Use Microsoft Edge or Chrome, or use the embedded snapshot.', 'Ce navigateur ne peut pas connecter directement les fichiers Excel. Utilisez Microsoft Edge ou Chrome, ou l’instantané intégré.'),
    connectedMsg: t('Connected. Save your Excel files after changes, then click Refresh data.', 'Connecté. Enregistrez vos fichiers Excel après toute modification, puis cliquez sur Actualiser.'),
    footer: t('SOP-SLC-001 · Sales & Logistics process notes', 'SOP-SLC-001 · Notes du processus Ventes & Logistique')
  };
  const tx = (o) => (o == null ? '' : typeof o === 'string' ? o : (o[lang] != null ? o[lang] : o.en));
  const u = (key, vars) => { let s = tx(UI[key]); if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); }); return s; };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ───────── Lookups ───────── */
  const roleById = (id) => ROLES.find(r => r.id === id);
  const sopById = (id) => SOPS.find(s => s.id === id);
  const sopsFor = (roleId) => SOPS.filter(s => s.role === roleId);
  const sopName = (s) => s.num + ' · ' + tx(s.title);
  const hasSops = (roleId) => sopsFor(roleId).length > 0;
  const groupOf = (sop) => { const ro = roleById(sop.role); return (ro.groups || []).find(g => g.id === sop.group) || null; };
  const isRef = (sop) => sop.kind === 'ref';
  const itemLabel = (it) => Array.isArray(it) ? it[0] : it;
  const itemHtml = (it) => Array.isArray(it) ? '<b>' + esc(tx(it[0])) + '</b><small>' + esc(tx(it[1])) + '</small>' : esc(tx(it));

  /* ───────── Progress ───────── */
  function saveProgress() { store.set(K_PROGRESS, progress); }
  function prog(id) { if (!progress[id]) progress[id] = { step: 1, checks: {}, terms: null, done: false }; return progress[id]; }
  function resetSop(id) { delete progress[id]; saveProgress(); }

  function stepItems(sop, si, p) {
    const s = sop.steps[si], keys = [];
    (s.verify || []).forEach((it, i) => keys.push({ key: si + ':' + i, label: it }));
    (s.groups || []).forEach((g, gi) => {
      if (!p.terms || p.terms === g.when) g.items.forEach((it, ii) => keys.push({ key: si + ':g' + gi + ':' + ii, label: it, group: g }));
    });
    return keys;
  }
  function stepState(sop, si, p) {
    const items = stepItems(sop, si, p);
    const checked = items.filter(i => p.checks[i.key]).length;
    return { items, checked, total: items.length, complete: checked === items.length };
  }
  function sopStatus(sop) {
    const p = progress[sop.id];
    if (!p) return { kind: 'none' };
    if (p.done) return { kind: 'done' };
    return { kind: 'prog', step: p.step };
  }
  function statusChip(sop) {
    if (isRef(sop)) return '<span class="chip">' + esc(u('reference')) + '</span>';
    const st = sopStatus(sop);
    if (st.kind === 'done') return '<span class="chip ok">✓ ' + esc(u('completed')) + '</span>';
    if (st.kind === 'prog') return '<span class="chip prog">' + esc(u('inProgress', { s: st.step, n: sop.steps.length })) + '</span>';
    return '<span class="chip">' + esc(sop.steps.length === 1 ? u('oneStep') : u('steps', { n: sop.steps.length })) + '</span>';
  }

  /* ───────── Analytics (Google Analytics 4, tag in app.html) ───────── */
  function track(name, params) { try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) {} }
  let lastTrackedRoute = null;
  function trackPageView() {
    const route = location.hash.replace(/^#\/?/, '');
    if (route === lastTrackedRoute) return; // re-renders (language switch, checkbox terms) are not new page views
    lastTrackedRoute = route;
    const path = '/' + route;
    track('page_view', { page_title: document.title, page_location: location.origin + path, page_path: path, language: lang, role: currentRole || '(none)' });
  }

  /* ───────── Routing ───────── */
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
  function parseRoute() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    return { name: parts[0] || 'home', a: parts[1], b: parts[2] };
  }

  function render() {
    const r = parseRoute();
    let view = '';
    document.body.classList.remove('in-step', 'menu-open');
    $('#menuBtn').setAttribute('aria-expanded', 'false');

    if (r.name === 'role' && roleById(r.a)) { currentRole = r.a; view = viewRole(r.a); }
    else if (r.name === 'start') { currentRole = 'saleslog'; view = viewStart(); }
    else if (r.name === 'sop' && sopById(r.a)) {
      const sop = sopById(r.a); currentRole = sop.role;
      if (isRef(sop)) { if (r.b) { location.replace('#/sop/' + sop.id); return; } view = viewRef(sop); }
      else if (!r.b) { // entering from a list: resume, or start fresh if it was completed
        const p = progress[sop.id];
        if (!p || p.done) resetSop(sop.id);
        location.replace('#/sop/' + sop.id + '/' + ((progress[sop.id] && progress[sop.id].step) || 1));
        return;
      }
      else if (r.b === 'done') view = viewDone(sop);
      else {
        const n = Math.min(Math.max(parseInt(r.b, 10) || 1, 1), sop.steps.length);
        if (String(n) !== r.b) { location.replace('#/sop/' + sop.id + '/' + n); return; }
        view = viewStep(sop, n); document.body.classList.add('in-step');
      }
    }
    else if (r.name === 'directory') view = viewDirectory();
    else if (r.name === 'live') view = viewLive(r.a);
    else if (r.name === 'tariff') view = viewTariff();
    else { if (r.name !== 'home' && location.hash) { location.replace('#/'); return; } currentRole = ''; view = viewHome(); }

    const main = $('#view');
    main.innerHTML = view.html;
    document.title = (view.title ? view.title + ' — ' : '') + 'Aldex SOP Hub';
    renderChrome(r, view);
    trackPageView();
    if (view.mount) view.mount(main);
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  /* ───────── Chrome: sidebar, breadcrumbs, role select, bottom nav ───────── */
  function renderChrome(r, view) {
    document.documentElement.lang = lang;
    const lb = $('#langBtn'); lb.textContent = lang === 'en' ? 'FR' : 'EN'; lb.setAttribute('aria-label', lang === 'en' ? 'Français' : 'English');
    $('#menuBtn').setAttribute('aria-label', u('menu'));

    const sel = $('#roleSelect');
    sel.setAttribute('aria-label', u('selectRole'));
    sel.innerHTML = '<option value="">' + esc(u('selectRole')) + '</option>' +
      ROLES.map(ro => '<option value="' + ro.id + '"' + (ro.id === currentRole ? ' selected' : '') + '>' + esc(tx(ro.name)) + '</option>').join('');

    const activeSop = r.name === 'sop' ? r.a : (r.name === 'start' ? 'start' : '');
    const link = (href, ico, label, on, extra) => '<a class="side-link' + (on ? ' active' : '') + '" href="' + href + '"' + (on ? ' aria-current="page"' : '') + '><span class="ico" aria-hidden="true">' + ico + '</span><span>' + esc(label) + '</span>' + (extra || '') + '</a>';
    let side = '<a class="brand" href="#/"><span class="brand-mark">A</span><span><b>' + esc(u('hub')) + '</b><small>' + esc(u('hubSub')) + '</small></span></a>';
    side += '<div class="side-nav">' +
      link('#/', '⌂', u('home'), r.name === 'home') +
      link('#/directory', '▤', u('directory'), r.name === 'directory') +
      link('#/live', '▦', u('live'), r.name === 'live') +
      link('#/tariff', '⚑', u('tariff'), r.name === 'tariff') + '</div>' +
      '<a class="duty-widget" href="#/tariff"><span>🇨🇳 ' + esc(u('chinaDuty')) + '</span><b>' + esc(dutyRate()) + '</b><small>' + esc(u('dutyWidgetNote')) + '</small></a>';
    side += '<div class="side-label">' + esc(u('departments')) + '</div><div class="side-nav">';
    ROLES.forEach(ro => {
      const on = currentRole === ro.id;
      side += link('#/role/' + ro.id, ro.icon, tx(ro.short), on && r.name === 'role', hasSops(ro.id) ? '' : '<span class="soon">' + esc(u('comingSoon')) + '</span>');
      if (on && hasSops(ro.id)) {
        side += '<div class="side-sub">';
        const stOn = ro.start.href === '#/start' ? activeSop === 'start' : ro.start.href === '#/sop/' + activeSop;
        side += '<a href="' + ro.start.href + '"' + (stOn ? ' class="active" aria-current="page"' : '') + '><span class="n">▶</span><span>' + esc(tx(ro.start.title)) + '</span></a>';
        let group = '';
        sopsFor(ro.id).filter(s => s.group !== 'start').forEach(s => {
          if (s.group !== group) { const first = !group; group = s.group; const g = groupOf(s); if (g && !(first && g.seq)) side += '<div class="div">' + esc(tx(g.title)) + '</div>'; }
          side += '<a href="#/sop/' + s.id + '"' + (activeSop === s.id ? ' class="active" aria-current="page"' : '') + '><span class="n">' + s.num + '</span><span>' + esc(tx(s.title)) + '</span></a>';
        });
        side += '</div>';
      }
    });
    side += '</div><div class="side-foot">' + esc(u('footer')) + '</div>';
    $('#sidebar').innerHTML = side;

    const crumbs = [['#/', u('home')]];
    if (view.crumbs) view.crumbs.forEach(c => crumbs.push(c));
    $('#crumbs').innerHTML = crumbs.map((c, i) => {
      const last = i === crumbs.length - 1, hide = crumbs.length > 2 && i < crumbs.length - 2 ? ' hide-sm' : '';
      const sepHide = crumbs.length > 2 && i <= crumbs.length - 2 ? ' hide-sm' : '';
      const sep = i ? '<span class="sep' + sepHide + '" aria-hidden="true">›</span>' : '';
      return sep + (last ? '<span class="cur' + hide + '" aria-current="page">' + esc(c[1]) + '</span>' : '<a class="' + hide.trim() + '" href="' + c[0] + '">' + esc(c[1]) + '</a>');
    }).join('');

    const bn = [['#/', '⌂', u('home'), r.name === 'home' || r.name === 'role'], ['#/directory', '▤', u('sops'), r.name === 'directory'], [null, '☰', u('roles'), false], ['#/live', '▦', u('liveShort'), r.name === 'live']];
    $('#bottomNav').innerHTML = bn.map(b => b[0]
      ? '<a href="' + b[0] + '" class="' + (b[3] ? 'on' : '') + '"><span class="i" aria-hidden="true">' + b[1] + '</span>' + esc(b[2]) + '</a>'
      : '<button type="button" data-open-menu><span class="i" aria-hidden="true">' + b[1] + '</span>' + esc(b[2]) + '</button>').join('');
  }

  /* ───────── Home ───────── */
  function viewHome() {
    let resume = '';
    const active = SOPS.filter(s => !isRef(s) && progress[s.id] && !progress[s.id].done);
    if (active.length) {
      const s = active[0], p = progress[s.id];
      resume = '<a class="card resume" href="#/sop/' + s.id + '/' + p.step + '"><span class="t"><span class="eyebrow">' + esc(u('continueTitle')) + '</span><b>' + esc(sopName(s)) + '</b><span class="muted small">' + esc(u('stepOf', { s: p.step, n: s.steps.length })) + ' · ' + esc(tx(s.steps[p.step - 1].title)) + '</span></span><span class="btn primary sm">' + esc(u('open')) + ' →</span></a>';
    }
    const live = ROLES.filter(ro => hasSops(ro.id)), soon = ROLES.filter(ro => !hasSops(ro.id));
    const cards = live.map(ro => {
      const n = sopsFor(ro.id).filter(s => s.group !== 'start').length;
      return '<a class="card role-card" href="#/role/' + ro.id + '"><span class="ico" aria-hidden="true">' + ro.icon + '</span><h2>' + esc(tx(ro.name)) + '</h2><p>' + esc(tx(ro.desc)) + '</p><span class="foot"><span>' + esc(u('sopsCount', { n: n })) + '</span><span aria-hidden="true">→</span></span></a>';
    }).join('');
    const soonRow = '<div class="list-title"><h2>' + esc(u('comingSoon')) + '</h2></div><div class="soon-grid">' +
      soon.map(ro => '<a class="card soon-card" href="#/role/' + ro.id + '"><span aria-hidden="true">' + ro.icon + '</span><span><b>' + esc(tx(ro.name)) + '</b><small>' + esc(u('comingSoon')) + '</small></span></a>').join('') + '</div>';
    return {
      title: '',
      html: '<div class="home-head"><div class="eyebrow">' + esc(u('company')) + '</div><h1>' + esc(u('hub')) + '</h1><p>' + esc(u('homeTitle')) + '</p><p class="muted small" style="margin-top:4px">' + esc(u('homeSub')) + '</p></div>' +
        resume + '<div class="role-grid two">' + cards + '</div>' + soonRow +
        '<div class="quick"><a class="tool" href="#/directory">▤ ' + esc(u('directory')) + '</a><a class="tool" href="#/live">▦ ' + esc(u('live')) + '</a><a class="tool" href="#/tariff">⚑ ' + esc(u('tariff')) + '</a></div>'
    };
  }

  /* ───────── Role page ───────── */
  function sopRow(s) {
    return '<a class="sop-row" href="#/sop/' + s.id + '"><span class="num">' + s.num + '</span><span class="body"><b>' + esc(tx(s.title)) + '</b><span>' + esc(tx(s.purpose)) + '</span></span><span class="meta">' + statusChip(s) + '<span class="chev" aria-hidden="true">›</span></span></a>';
  }
  function viewRole(id) {
    const ro = roleById(id), list = sopsFor(id);
    if (!list.length) {
      return {
        title: tx(ro.name), crumbs: [['#/role/' + id, tx(ro.short)]],
        html: '<div class="role-hero"><div><div class="eyebrow">' + esc(u('departments')) + '</div><h1>' + ro.icon + ' ' + esc(tx(ro.name)) + '</h1><p>' + esc(tx(ro.desc)) + '</p></div></div>' +
          '<div class="card pad stack"><h3>' + esc(u('soonTitle')) + '</h3><p>' + esc(u('soonBody')) + '</p>' +
          (ro.planned ? '<div><div class="eyebrow">' + esc(u('planned')) + '</div><p style="margin-top:4px">' + esc(tx(ro.planned)) + '</p></div>' : '') +
          '<div><a class="btn" href="#/">← ' + esc(u('allDepts')) + '</a></div></div>'
      };
    }
    const firstGroup = ro.groups[0], first = list.find(s => s.group === firstGroup.id);
    const primary = firstGroup.seq ? u('startWorkflow') + ' →' : u('openSop', { sop: tx(first.title) }) + ' →';
    return {
      title: tx(ro.name), crumbs: [['#/role/' + id, tx(ro.short)]],
      html: '<div class="role-hero"><div><div class="eyebrow">' + esc(u('departments')) + '</div><h1>' + ro.icon + ' ' + esc(tx(ro.name)) + '</h1><p>' + esc(tx(ro.desc)) + '</p></div>' +
        '<div class="actions"><a class="btn" href="' + ro.start.href + '">' + esc(tx(ro.start.title)) + '</a><a class="btn primary" href="#/sop/' + first.id + '">' + esc(primary) + '</a></div></div>' +
        '<div class="card sop-list"><a class="sop-row" href="' + ro.start.href + '"><span class="num start">▶</span><span class="body"><b>' + esc(tx(ro.start.title)) + '</b><span>' + esc(tx(ro.start.sub)) + '</span></span><span class="meta"><span class="chev" aria-hidden="true">›</span></span></a></div>' +
        ro.groups.map(g => {
          const items = list.filter(s => s.group === g.id);
          return items.length ? '<div class="list-title"><h2>' + esc(tx(g.title)) + '</h2><span class="muted small">' + esc(tx(g.hint)) + '</span></div><div class="card sop-list">' + items.map(sopRow).join('') + '</div>' : '';
        }).join('')
    };
  }

  /* ───────── Start Here ───────── */
  function viewStart() {
    const S = START_HERE, ro = roleById('saleslog'), first = sopsFor('saleslog')[0];
    return {
      title: u('startHere'), crumbs: [['#/role/saleslog', tx(ro.short)], ['#/start', u('startHere')]],
      html: '<a class="back-link" href="#/role/saleslog">← ' + esc(u('allSops', { role: tx(ro.short) })) + '</a>' +
        '<div class="page-head" style="margin-top:0"><div class="eyebrow">' + esc(tx(ro.name)) + '</div><h1>' + esc(u('startHere')) + '</h1><p>' + esc(u('startHereSub')) + '</p></div>' +
        '<div class="stack">' +
        '<div class="callout flag"><strong>' + esc(u('principle')) + '</strong>' + esc(tx(S.principle)) + '</div>' +
        '<div class="card pad"><h3>' + esc(u('sopInfo')) + '</h3><div class="ref-grid" style="margin-top:10px"><div class="kv"><b>SOP ID</b><span>' + S.sopId + '</span></div><div class="kv"><b>' + esc(u('version')) + '</b><span>' + S.version + '</span></div><div class="kv"><b>' + esc(u('effective')) + '</b><span>' + esc(tx(S.effective)) + '</span></div></div></div>' +
        '<div class="grid2"><div class="card pad"><h3>' + esc(u('purpose')) + '</h3><p>' + esc(tx(S.purpose)) + '</p></div><div class="card pad"><h3>' + esc(u('scope')) + '</h3><p>' + esc(tx(S.scope)) + '</p></div></div>' +
        '<div class="grid2">' + S.duties.map(d => '<div class="card pad"><h3>' + esc(tx(d[0])) + '</h3><p>' + esc(tx(d[1])) + '</p></div>').join('') + '</div>' +
        '<div class="grid2"><div class="card pad"><h3>' + esc(u('emailReview')) + '</h3><p>' + esc(tx(S.email)) + '</p></div>' +
        '<div class="card pad"><h3>' + esc(u('jimReport')) + '</h3><ul class="plain">' + S.jimReport.map(x => '<li>' + esc(tx(x)) + '</li>').join('') + '</ul></div></div>' +
        '<div class="card pad"><h3>' + esc(u('surchargeTitle')) + '</h3><div class="surcharge">' + S.surcharge.map(x => '<div><b>' + x[0] + '</b><span>' + esc(tx(x[1])) + '</span></div>').join('') + '<div><b>' + esc(u('separateLine')) + '</b><span>' + esc(tx(S.surchargeNote)) + '</span></div></div></div>' +
        '<div class="card pad"><h3>' + esc(u('tariffTitle')) + '</h3><p>' + esc(tx(S.tariff)) + '</p><div class="tools"><a class="tool" href="#/tariff">⚑ ' + esc(u('openTariff')) + ' <small>' + esc(u('chinaDuty')) + ' ' + esc(dutyRate()) + '</small></a></div></div>' +
        '<div class="callout flag"><strong>' + esc(u('controlRule')) + '</strong>' + esc(tx(S.control)) + '</div>' +
        '<div class="page-foot"><a class="btn" href="#/role/saleslog">← ' + esc(u('back')) + '</a><a class="btn primary" href="#/sop/' + first.id + '">' + esc(u('nextSop', { sop: sopName(first) })) + ' →</a></div>' +
        '</div>'
    };
  }

  /* ───────── SOP step ───────── */
  function viewStep(sop, n) {
    const p = prog(sop.id), si = n - 1, s = sop.steps[si], total = sop.steps.length, ro = roleById(sop.role);
    p.step = n; p.done = false; saveProgress();
    const st = stepState(sop, si, p);
    const isLast = n === total;
    const prevHref = n > 1 ? '#/sop/' + sop.id + '/' + (n - 1) : (sop.role === 'saleslog' && sop.num === '01' ? '#/start' : '#/role/' + sop.role);
    const nextHref = isLast ? '#/sop/' + sop.id + '/done' : '#/sop/' + sop.id + '/' + (n + 1);
    const nextLabel = isLast ? u('complete') + ' ✓' : u('next') + ' →';

    // Stepper
    const stepper = sop.steps.map((x, i) => {
      const ss = stepState(sop, i, p);
      let cls = i === si ? 'cur' : '', mark = String(i + 1);
      if (i !== si && i < si) { if (ss.complete) { cls = 'ok'; mark = '✓'; } else { cls = 'warn'; mark = '!'; } }
      else if (i !== si && ss.total && ss.complete) { cls = 'ok'; mark = '✓'; }
      return '<li><a class="' + cls + '" href="#/sop/' + sop.id + '/' + (i + 1) + '"' + (i === si ? ' aria-current="step"' : '') + '><span class="dot">' + mark + '</span><span>' + esc(tx(x.title)) + '</span></a></li>';
    }).join('');
    const picker = '<label class="step-picker"><span class="sr" style="position:absolute;left:-9999px">' + esc(u('jumpTo')) + '</span><select class="select" data-jump>' +
      sop.steps.map((x, i) => '<option value="' + (i + 1) + '"' + (i === si ? ' selected' : '') + '>' + (i + 1) + '. ' + esc(tx(x.title)) + '</option>').join('') + '</select></label>';

    // Step card
    let body = '<div class="step-label"><span>' + esc(u('step')) + ' ' + n + '</span>' + (s.tag ? '<span class="chip tag">' + esc(tx(s.tag)) + '</span>' : '') + '</div>';
    body += '<h2>' + esc(tx(s.title)) + '</h2>';
    if (n === 1 && sop.needs) body += '<p class="needs"><b>' + esc(u('youNeed')) + '</b> ' + esc(tx(sop.needs)) + '</p>';
    if (s.do) {
      body += '<div class="block"><h3>' + esc(u('whatToDo')) + '</h3>' +
        (Array.isArray(s.do) ? '<ol class="actions">' + s.do.map(x => '<li>' + esc(tx(x)) + '</li>').join('') + '</ol>' : '<p>' + esc(tx(s.do)) + '</p>') + '</div>';
    }
    const tableHtml = () => '<div class="block"><table class="tbl"><thead><tr>' + s.table.head.map(h => '<th>' + esc(tx(h)) + '</th>').join('') + '</tr></thead><tbody>' +
        s.table.rows.map(row => '<tr>' + row.map(c => '<td>' + esc(tx(c)) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
    if (s.table && !s.tableAfter) body += tableHtml();
    if (s.verify || s.groups) {
      body += '<div class="block"><h3>' + esc(u('verify')) + '</h3>';
      if (s.groups) {
        body += '<p class="small" style="font-size:14px">' + esc(u('termsQ')) + '</p><div class="terms" role="group">' +
          ['prepaid', 'collect'].map(w => '<button type="button" data-terms="' + w + '" aria-pressed="' + (p.terms === w) + '">' + esc(u(w)) + '</button>').join('') + '</div>';
        if (!p.terms) body += '<p class="muted small" style="margin-top:6px">' + esc(u('termsPick')) + '</p>';
      }
      const items = st.items;
      let lastGroup = null, open = false;
      items.forEach(it => {
        if (it.group !== lastGroup) {
          if (open) body += '</ul></div>';
          lastGroup = it.group;
          body += it.group ? '<div class="group"><h4>' + esc(tx(it.group.title)) + '</h4><ul class="checks">' : '<div><ul class="checks">';
          open = true;
        }
        const on = !!p.checks[it.key];
        body += '<li><label class="' + (on ? 'on' : '') + '"><input type="checkbox" data-check="' + it.key + '"' + (on ? ' checked' : '') + '><span>' + itemHtml(it.label) + '</span></label></li>';
      });
      if (open) body += '</ul></div>';
      if (!s.flag) body += '<p class="unsure">⚑ ' + esc(u('unsure')) + '</p>';
      body += '</div>';
    }
    if (s.table && s.tableAfter) body += tableHtml();
    if (s.flag) body += '<div class="block callout flag"><strong>⚑ ' + esc(u('important')) + '</strong>' + esc(tx(s.flag)) + '</div>';
    if (s.note) body += '<div class="block callout note">' + esc(tx(s.note)) + '</div>';
    const tools = [];
    if (s.excel) tools.push('<button type="button" class="tool" data-excel="' + esc(s.excel[0]) + '|' + esc(s.excel[1]) + '">▦ ' + esc(u('openExcel')) + ' <small>' + esc(s.excel[1]) + '</small></button>');
    if (s.tariff) tools.push('<a class="tool" href="#/tariff">⚑ ' + esc(u('openTariff')) + ' <small>' + esc(u('chinaDuty')) + ' ' + esc(dutyRate()) + '</small></a>');
    if (s.link && sopById(s.link[0])) tools.push('<a class="tool" href="#/sop/' + s.link[0] + '">↗ ' + esc(tx(s.link[1])) + '</a>');
    if (tools.length) body += '<div class="tools">' + tools.join('') + '</div>';
    (s.img || []).forEach(im => {
      if (!IMG[im[0]]) return;
      body += '<figure><button type="button" class="shot" data-zoom="' + im[0] + '" data-cap="' + esc(tx(im[1])) + '"><img src="' + IMG[im[0]] + '" alt="' + esc(tx(im[1])) + '" loading="lazy"><span class="zoom">⤢ ' + esc(u('zoom')) + '</span></button><figcaption>' + esc(tx(im[1])) + '</figcaption></figure>';
    });
    if (s.shot) body += '<div class="shot-missing"><span aria-hidden="true">📷</span><span>' + esc(tx(s.shot)) + '</span></div>';

    const statusTxt = st.total ? (st.complete ? '✓ ' + u('allVerified') : u('verifiedOf', { c: st.checked, n: st.total })) : '';
    body += '<div class="step-foot"><a class="btn" href="' + prevHref + '">← <span class="lbl">' + esc(u('back')) + '</span></a><span class="status' + (st.total && st.complete ? ' all' : '') + '" data-status>' + esc(statusTxt) + '</span>' +
      '<a class="btn primary" href="' + nextHref + '">' + (isLast ? esc(u('complete')) + ' ✓' : esc(u('next')) + ' <span class="next-title">· ' + esc(tx(sop.steps[n].title)) + '</span> →') + '</a></div>';

    const html =
      '<div class="sop-head"><div class="main-col"><a class="back-link" href="#/role/' + sop.role + '">← ' + esc(u('allSops', { role: tx(ro.short) })) + '</a>' +
      '<div class="eyebrow">' + esc(tx(roleById(sop.role).short)) + ' · ' + sop.num + ' · ' + esc(tx(groupOf(sop).title)) + '</div><h1>' + esc(tx(sop.title)) + '</h1><p class="purpose">' + esc(tx(sop.purpose)) + '</p></div>' +
      '<div class="nav-col"><div class="step-count">' + u('stepOf', { s: '<b>' + n + '</b>', n: total }) + '</div><div class="nav-btns"><a class="btn" href="' + prevHref + '" aria-label="' + esc(u('back')) + '">← <span class="lbl">' + esc(u('back')) + '</span></a><a class="btn primary" href="' + nextHref + '">' + esc(nextLabel) + '</a></div></div></div>' +
      '<div class="progress" aria-hidden="true">' + sop.steps.map((x, i) => '<span class="' + (i === si ? 'cur' : i < si ? 'past' : '') + '"></span>').join('') + '</div>' +
      '<div class="sop-body"><div><ol class="card stepper">' + stepper + '<li><button type="button" class="restart" data-restart>' + esc(u('restart')) + '</button></li></ol>' + picker + '</div>' +
      '<article class="card step-card" aria-labelledby="stepTitle">' + body.replace('<h2>', '<h2 id="stepTitle">') + '</article></div>';

    return {
      title: sopName(sop) + ' — ' + u('stepOf', { s: n, n: total }),
      crumbs: [['#/role/' + sop.role, tx(ro.short)], ['#/sop/' + sop.id + '/' + n, sopName(sop)]],
      html: html,
      mount(root) {
        $$('[data-check]', root).forEach(cb => cb.addEventListener('change', () => {
          if (cb.checked) p.checks[cb.dataset.check] = true; else delete p.checks[cb.dataset.check];
          cb.closest('label').classList.toggle('on', cb.checked);
          saveProgress();
          const now = stepState(sop, si, p), el = $('[data-status]', root);
          el.textContent = now.total ? (now.complete ? '✓ ' + u('allVerified') : u('verifiedOf', { c: now.checked, n: now.total })) : '';
          el.classList.toggle('all', now.total > 0 && now.complete);
        }));
        $$('[data-terms]', root).forEach(b => b.addEventListener('click', () => {
          p.terms = p.terms === b.dataset.terms ? null : b.dataset.terms; saveProgress(); render();
        }));
        const jump = $('[data-jump]', root);
        if (jump) jump.addEventListener('change', () => go('#/sop/' + sop.id + '/' + jump.value));
        $('[data-restart]', root).addEventListener('click', () => {
          confirmModal(u('restartShort'), u('restartConfirm'), u('restartShort'), () => { resetSop(sop.id); go('#/sop/' + sop.id + '/1'); });
        });
      }
    };
  }

  /* ───────── Reference page (read-through, no checkboxes) ───────── */
  function refBlock(b) {
    const title = b.title ? '<h3 class="ref-h">' + esc(tx(b.title)) + '</h3>' : '';
    if (b.type === 'flow') {
      return '<section class="card pad">' + title + '<ol class="gates">' + b.items.map((x, i) => '<li><span class="gn">' + (i + 1) + '</span><b>' + esc(tx(x[0])) + '</b><span>' + esc(tx(x[1])) + '</span></li>').join('') + '</ol>' +
        (b.caption ? '<p class="muted small" style="margin-top:12px">' + esc(tx(b.caption)) + '</p>' : '') + '</section>';
    }
    if (b.type === 'cards') {
      return '<div class="ref-cards">' + b.items.map(c => '<section class="card pad' + (c.warn ? ' warn-card' : '') + '"><h3>' + esc(tx(c.title)) + '</h3>' +
        (c.text ? '<p>' + esc(tx(c.text)) + '</p>' : '') + (c.list ? '<ul class="plain">' + c.list.map(x => '<li>' + esc(tx(x)) + '</li>').join('') + '</ul>' : '') + '</section>').join('') + '</div>';
    }
    if (b.type === 'rule') return '<div class="callout ' + (b.kind === 'ok' ? 'ok' : 'flag') + '"><strong>' + (b.kind === 'ok' ? '✓ ' : '⚑ ') + esc(tx(b.title)) + '</strong>' + esc(tx(b.text)) + '</div>';
    if (b.type === 'note') return '<div class="callout note">' + (b.title ? '<b>' + esc(tx(b.title)) + '.</b> ' : '') + esc(tx(b.text)) + '</div>';
    if (b.type === 'chain') {
      return '<ol class="chain">' + b.items.map((x, i) => '<li><span class="gn">' + (i + 1) + '</span><span class="who"><b>' + esc(tx(x[0])) + '</b>' + (tx(x[1]) !== tx(x[0]) ? '<small>' + esc(tx(x[1])) + '</small>' : '') + '</span><span class="what">' + esc(tx(x[2])) + '</span></li>').join('') + '</ol>';
    }
    if (b.type === 'phases') {
      return '<div class="ref-cards">' + b.items.map(x => '<section class="card pad"><div class="eyebrow">' + esc(tx(x[0])) + '</div><h3 style="margin-top:4px">' + esc(tx(x[1])) + '</h3><ul class="plain">' + x[2].map(y => '<li>' + esc(tx(y)) + '</li>').join('') + '</ul></section>').join('') + '</div>';
    }
    if (b.type === 'links') {
      return '<section>' + title + '<div class="card sop-list">' + b.items.filter(x => sopById(x[0])).map(x => { const s = sopById(x[0]); return '<a class="sop-row" href="#/sop/' + s.id + '"><span class="num">' + s.num + '</span><span class="body"><b>' + esc(tx(s.title)) + '</b><span>' + esc(u('sourceDoc')) + ': ' + esc(tx(x[1])) + '</span></span><span class="meta">' + statusChip(s) + '<span class="chev" aria-hidden="true">›</span></span></a>'; }).join('') + '</div></section>';
    }
    return '';
  }
  function viewRef(sop) {
    const ro = roleById(sop.role), g = groupOf(sop);
    const list = sopsFor(sop.role).filter(s => s.group !== 'start'), idx = list.indexOf(sop);
    const nxt = idx >= 0 ? list[idx + 1] : list[0];
    return {
      title: tx(sop.title), crumbs: [['#/role/' + sop.role, tx(ro.short)], ['#/sop/' + sop.id, tx(sop.title)]],
      html: '<a class="back-link" href="#/role/' + sop.role + '">← ' + esc(u('allSops', { role: tx(ro.short) })) + '</a>' +
        '<div class="page-head" style="margin-top:0"><div class="eyebrow">' + esc(tx(ro.short)) + (sop.num ? ' · ' + sop.num : '') + (g ? ' · ' + esc(tx(g.title)) : '') + '</div><h1>' + esc(tx(sop.title)) + '</h1><p>' + esc(tx(sop.purpose)) + '</p>' +
        (sop.meta ? '<p class="muted small" style="margin-top:6px">' + esc(tx(sop.meta)) + '</p>' : '') + '</div>' +
        '<div class="stack">' + sop.blocks.map(refBlock).join('') +
        '<div class="page-foot"><a class="btn" href="#/role/' + sop.role + '">← ' + esc(u('back')) + '</a>' + (nxt ? '<a class="btn primary" href="#/sop/' + nxt.id + '">' + esc(u('nextSop', { sop: (nxt.num ? nxt.num + ' · ' : '') + tx(nxt.title) })) + ' →</a>' : '') + '</div></div>'
    };
  }

  /* ───────── SOP complete ───────── */
  function viewDone(sop) {
    const p = prog(sop.id), ro = roleById(sop.role);
    const firstTime = !p.done;
    p.done = true; saveProgress();
    const missing = [];
    sop.steps.forEach((s, i) => { stepState(sop, i, p).items.forEach(it => { if (!p.checks[it.key]) missing.push({ step: i + 1, label: it.label }); }); });
    if (firstTime) track('sop_complete', { sop_id: sop.id, sop_title: sop.num + ' · ' + sop.title.en, role: sop.role, items_unchecked: missing.length });
    const list = sopsFor(sop.role).filter(s => s.group !== 'start'), idx = list.indexOf(sop), nxt = list[idx + 1];
    const seq = !!(groupOf(sop) && groupOf(sop).seq);
    const mainEnd = seq && (!nxt || nxt.group !== sop.group);
    let summary;
    if (missing.length) {
      summary = '<div class="callout flag"><strong>⚑ ' + esc(missing.length === 1 ? u('doneMissing1') : u('doneMissing', { n: missing.length })) + '</strong>' + esc(u('doneMissingHelp')) +
        '<ul>' + missing.map(m => '<li><a href="#/sop/' + sop.id + '/' + m.step + '">' + esc(u('step')) + ' ' + m.step + '</a> — ' + esc(tx(itemLabel(m.label))) + '</li>').join('') + '</ul></div>';
    } else {
      summary = '<div class="callout ok">✓ ' + esc(u('doneAll')) + '</div>';
    }
    let buttons = '';
    if (seq && nxt && nxt.group === sop.group) {
      buttons = '<a class="btn primary" href="#/sop/' + nxt.id + '">' + esc(u('nextSop', { sop: sopName(nxt) })) + ' →</a><a class="btn" href="#/role/' + sop.role + '">' + esc(u('backToList', { role: tx(ro.short) })) + '</a>';
    } else {
      buttons = '<a class="btn primary" href="#/role/' + sop.role + '">' + esc(u('backToList', { role: tx(ro.short) })) + '</a>' +
        (nxt ? '<a class="btn" href="#/sop/' + nxt.id + '">' + esc(u('nextInList', { sop: sopName(nxt) })) + ' →</a>' : '');
    }
    return {
      title: sopName(sop) + ' — ' + u('doneTitle'),
      crumbs: [['#/role/' + sop.role, tx(ro.short)], ['#/sop/' + sop.id, sopName(sop)]],
      html: '<div class="card done"><div class="big" aria-hidden="true">✓</div><div class="eyebrow">SOP ' + sop.num + '</div><h1>' + esc(u('doneTitle')) + '</h1><p class="sub">' + esc(tx(sop.title)) + (mainEnd ? ' — ' + esc(u('mainDone')) : '') + '</p>' +
        summary + '<div class="row">' + buttons + '</div>' +
        '<div class="row" style="margin-top:12px"><a class="btn ghost sm" href="#/sop/' + sop.id + '/' + sop.steps.length + '">← ' + esc(u('reviewStep', { s: sop.steps.length })) + '</a><button type="button" class="btn ghost sm" data-restart>↺ ' + esc(u('restartShort')) + '</button></div></div>',
      mount(root) {
        $('[data-restart]', root).addEventListener('click', () => { resetSop(sop.id); go('#/sop/' + sop.id + '/1'); });
      }
    };
  }

  /* ───────── Directory ───────── */
  function viewDirectory() {
    return {
      title: u('directory'), crumbs: [['#/directory', u('directory')]],
      html: '<div class="page-head"><h1>' + esc(u('directory')) + '</h1><p>' + esc(u('dirSub')) + '</p></div>' +
        '<input class="search" type="search" data-search placeholder="' + esc(u('searchSops')) + '" aria-label="' + esc(u('searchSops')) + '"><div data-dir></div>',
      mount(root) {
        const box = $('[data-dir]', root), input = $('[data-search]', root);
        const draw = () => {
          const q = input.value.trim().toLowerCase();
          const match = (s) => !q || [s.num, s.title.en, s.title.fr, s.purpose.en, s.purpose.fr].join(' ').toLowerCase().includes(q);
          let html = '', any = false;
          ROLES.forEach(ro => {
            const list = sopsFor(ro.id).filter(match);
            const roleMatch = !q || [ro.name.en, ro.name.fr].join(' ').toLowerCase().includes(q);
            if (!list.length && !(roleMatch && !sopsFor(ro.id).length)) return;
            any = true;
            html += '<section class="dir-role"><h2>' + ro.icon + ' <a href="#/role/' + ro.id + '" style="color:inherit;text-decoration:none">' + esc(tx(ro.name)) + '</a></h2>';
            if (!sopsFor(ro.id).length) html += '<div class="card sop-list"><div class="sop-row"><span class="num start">…</span><span class="body"><b>' + esc(u('soonTitle')) + '</b><span>' + esc(tx(ro.planned)) + '</span></span><span class="meta"><span class="chip soon">' + esc(u('comingSoon')) + '</span></span></div></div>';
            else {
              html += '<div class="card sop-list">' + (!q ? '<a class="sop-row" href="' + ro.start.href + '"><span class="num start">▶</span><span class="body"><b>' + esc(tx(ro.start.title)) + '</b><span>' + esc(tx(ro.start.sub)) + '</span></span><span class="meta"><span class="chev">›</span></span></a>' : '') + list.filter(s => q || s.group !== 'start').map(sopRow).join('') + '</div>';
            }
            html += '</section>';
          });
          box.innerHTML = any ? html : '<div class="card empty" style="margin-top:22px">' + esc(u('noResults')) + '</div>';
        };
        input.addEventListener('input', draw); draw();
      }
    };
  }

  /* ───────── Live Excel Data ───────── */
  const LIVE_FILE_MAP = {
    suivi: { label: 'Suivi des commandes' },
    price: { label: 'Price list' },
    weights: { label: 'Shipping Weight Chart' }
  };
  const LIVE_TABS = {
    agenda: { title: t('Agenda Expedition', 'Agenda Expedition'), sheet: 'AGENDA EXPEDITION', file: 'suivi', note: t('Shipment schedule and record keeping.', 'Planification des expéditions et tenue des dossiers.') },
    analysisAE: { title: t('Analysis (AE) — Transport Rates', 'Analysis (AE) — Tarifs de transport'), sheet: 'Analysis (AE)', file: 'suivi', note: t('Primary lookup for historical transport rates and shipment patterns.', 'Source principale des tarifs de transport historiques et des tendances d’expédition.') },
    containerArrivals: { title: t('Container Arrivals', 'Arrivées de conteneurs'), sheet: 'Container Arrivals ', file: 'suivi', note: t('Container arrival record keeping.', 'Tenue des dossiers des arrivées de conteneurs.') },
    acideUser: { title: t('ACIDE USER', 'ACIDE USER'), sheet: 'ACIDE USER', file: 'suivi', note: t('Used-acid record keeping and shipment tracking.', 'Tenue des dossiers et suivi des expéditions d’acide usé.') },
    acPolymers: { title: t('AC POLYMERS', 'AC POLYMERS'), sheet: 'AC POLYMERS', file: 'suivi', note: t('Latest polymer PO / freight history to support the next PO.', 'Historique récent des BC / transports de polymères pour préparer le prochain BC.') },
    projectTransport: { title: t('Project Transport', 'Project Transport'), sheet: 'Project Transport', file: 'suivi', note: t('Carrier / lane reference data.', 'Données de référence des transporteurs / lignes.') },
    guilbault: { title: t('Guilbault Rates (LTL)', 'Tarifs Guilbault (LTL)'), sheet: 'Guilbault Rates (LTL)', file: 'suivi', note: t('LTL rate reference.', 'Référence des tarifs LTL.') },
    price2024: { title: t('Price List — Current Sheet', 'Liste de prix — Feuille actuelle'), sheet: '2024', file: 'price', note: t('Current pricing source used for customer price verification.', 'Source de prix actuelle pour la vérification des prix clients.') },
    weights: { title: t('Shipping Weight Chart', 'Tableau des poids d’expédition'), sheet: 'Feuil1', file: 'weights', note: t('Product weights used for BOL and pallet / weight checks.', 'Poids des produits pour les vérifications BOL et palettes / poids.') }
  };
  // Excel tab name -> snapshot tab key (used by "View snapshot" in the Excel modal)
  const SHEET_TO_TAB = { 'AGENDA EXPEDITION': 'agenda', 'Analysis (AE)': 'analysisAE', 'Container Arrivals': 'containerArrivals', 'ACIDE USER': 'acideUser', 'AC POLYMERS': 'acPolymers', 'Project Transport': 'projectTransport', 'Guilbault Rates (LTL)': 'guilbault', '2024': 'price2024', 'Feuil1': 'weights' };

  const liveTables = Object.assign({}, LIVE_SNAPSHOT);
  const liveMeta = {};
  const liveFiles = {}; // key -> FileSystemFileHandle (granted)
  const livePending = {}; // key -> handle that needs a permission prompt
  let liveMessage = '';

  let liveDbPromise = null;
  function liveDB() {
    if (liveDbPromise) return liveDbPromise;
    liveDbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error('no idb'));
      const req = indexedDB.open('AldexSOPHubLiveExcel', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('handles');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return liveDbPromise;
  }
  async function saveHandle(key, handle) {
    try { const db = await liveDB(); await new Promise((res, rej) => { const tr = db.transaction('handles', 'readwrite'); tr.objectStore('handles').put(handle, key); tr.oncomplete = res; tr.onerror = () => rej(tr.error); }); } catch (e) {}
  }
  async function loadSavedHandles() {
    try {
      const db = await liveDB();
      for (const key of Object.keys(LIVE_FILE_MAP)) {
        const handle = await new Promise((res, rej) => { const q = db.transaction('handles', 'readonly').objectStore('handles').get(key); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
        if (!handle || !handle.queryPermission) continue;
        const perm = await handle.queryPermission({ mode: 'read' });
        if (perm === 'granted') liveFiles[key] = handle; else if (perm === 'prompt') livePending[key] = handle;
      }
      if (Object.keys(liveFiles).length) await refreshLive(true);
      else if (parseRoute().name === 'live') render();
    } catch (e) { /* storage unavailable: snapshot only */ }
  }
  function fmtCell(v) {
    if (v == null) return '';
    const s = String(v);
    const m = /^(\d{4}-\d{2}-\d{2})T00:00:00(\.000)?Z?$/.exec(s);
    if (m) return m[1];
    if (typeof v === 'number' && !Number.isInteger(v)) return String(Math.round(v * 100) / 100);
    return s;
  }
  async function refreshLive(silent) {
    // Ask again for any saved file that needs permission (this runs from a click).
    for (const [key, h] of Object.entries(livePending)) {
      try { if ((await h.requestPermission({ mode: 'read' })) === 'granted') { liveFiles[key] = h; delete livePending[key]; } } catch (e) {}
    }
    if (!Object.keys(liveFiles).length) { liveMessage = u('noneConnected'); if (!silent || parseRoute().name === 'live') render(); return; }
    if (!window.XLSX) { liveMessage = u('xlsxLoading'); render(); return; }
    let failed = false;
    for (const [key, handle] of Object.entries(liveFiles)) {
      try {
        const file = await handle.getFile();
        const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
        Object.entries(LIVE_TABS).filter(([, info]) => info.file === key).forEach(([tab, info]) => {
          const ws = wb.Sheets[info.sheet] || wb.Sheets[info.sheet.trim()];
          if (ws) liveTables[tab] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: false });
        });
        liveMeta[key] = { name: file.name, modified: file.lastModified ? new Date(file.lastModified).toLocaleString() : '' };
      } catch (e) { failed = true; }
    }
    liveMessage = failed ? u('readFail') : u('refreshed');
    if (parseRoute().name === 'live') render();
  }
  async function connectLive() {
    if (!window.showOpenFilePicker) { liveMessage = u('noPicker'); render(); return; }
    try {
      const handles = await window.showOpenFilePicker({ multiple: true, types: [{ description: 'Excel workbooks', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] } }] });
      for (const h of handles) {
        const name = (h.name || '').toLowerCase();
        let key = null;
        if (name.includes('price list')) key = 'price';
        else if (name.includes('shipping weight') || name.includes('poids d')) key = 'weights';
        else if (name.includes('suivi') || name.includes('commandes') || name.includes('commamdes')) key = 'suivi';
        if (key) { liveFiles[key] = h; delete livePending[key]; await saveHandle(key, h); }
      }
      await refreshLive();
      liveMessage = u('connectedMsg'); render();
    } catch (e) { if (e && e.name !== 'AbortError') { liveMessage = u('readFail'); render(); } }
  }
  function viewLive(tab) {
    const active = LIVE_TABS[tab] ? tab : null;
    const status = Object.entries(LIVE_FILE_MAP).map(([key, m]) => {
      const on = !!liveFiles[key], pend = !!livePending[key];
      return '<div class="fstatus' + (on ? ' on' : '') + '"><b><span class="led"></span>' + esc(m.label) + '</b><span>' + esc(on ? u('connected') + (liveMeta[key] && liveMeta[key].modified ? ' · ' + liveMeta[key].modified : '') : pend ? u('reconnect') : u('snapshotLoaded')) + '</span></div>';
    }).join('');
    const tabs = Object.entries(LIVE_TABS).map(([k, info]) => '<a href="#/live/' + k + '" class="' + (k === active ? 'on' : '') + '">' + esc(tx(info.title)) + '</a>').join('');
    let table = '';
    if (active) {
      const info = LIVE_TABS[active];
      table = '<div class="card" style="margin-top:4px"><div class="table-head"><div><div class="eyebrow">' + esc(LIVE_FILE_MAP[info.file].label) + ' · ' + esc(info.sheet.trim()) + '</div><h2 style="font-size:19px;margin-top:4px">' + esc(tx(info.title)) + '</h2><p class="muted small" style="margin-top:2px">' + esc(tx(info.note)) + ' <span data-count></span></p></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><button type="button" class="tool" data-path="' + active + '">📁 ' + esc(u('whereFile')) + '</button><input class="search" type="search" data-live-search placeholder="' + esc(u('searchTable')) + '" aria-label="' + esc(u('searchTable')) + '"></div></div><div class="table-wrap"><table class="data"><thead></thead><tbody></tbody></table></div></div>';
    }
    return {
      title: u('live'), crumbs: [['#/live', u('live')]].concat(active ? [['#/live/' + active, tx(LIVE_TABS[active].title)]] : []),
      html: '<div class="page-head"><div class="eyebrow">' + esc(u('company')) + '</div><h1>' + esc(u('live')) + '</h1><p>' + esc(u('liveSub')) + '</p></div>' +
        '<div class="card pad"><p>' + esc(u('liveNote')) + '</p><div class="status-grid">' + status + '</div>' +
        '<div class="tools"><button type="button" class="btn primary sm" data-refresh>' + esc(u('refresh')) + '</button>' + (window.showOpenFilePicker ? '<button type="button" class="btn sm" data-connect>' + esc(u('connect')) + '</button>' : '') + '</div>' +
        (liveMessage ? '<p class="muted small" style="margin-top:10px" role="status">' + esc(liveMessage) + '</p>' : '') + '</div>' +
        '<div class="callout note" style="margin-top:14px">' + esc(u('liveBefore')) + '</div>' +
        '<div class="tabs" role="navigation">' + tabs + '<a href="#/tariff">⚑ ' + esc(u('tariff')) + '</a></div>' + table,
      mount(root) {
        $('[data-refresh]', root).addEventListener('click', () => refreshLive());
        const c = $('[data-connect]', root); if (c) c.addEventListener('click', connectLive);
        if (!active) return;
        const rows = (liveTables[active] || []).filter(r => r && r.some(v => v != null && v !== ''));
        const head = rows[0] || [], data = rows.slice(1);
        const cols = Math.max(head.length, ...data.slice(0, 300).map(r => r.length), 0);
        const thead = $('thead', root), tbody = $('tbody', root), count = $('[data-count]', root), input = $('[data-live-search]', root);
        thead.innerHTML = '<tr>' + Array.from({ length: cols }, (_, i) => '<th>' + esc(head[i] != null ? head[i] : 'Column ' + (i + 1)) + '</th>').join('') + '</tr>';
        const draw = () => {
          const q = input.value.trim().toLowerCase();
          const list = q ? data.filter(r => r.some(v => String(v == null ? '' : fmtCell(v)).toLowerCase().includes(q))) : data;
          tbody.innerHTML = list.length ? list.map(r => '<tr>' + Array.from({ length: cols }, (_, i) => { const v = fmtCell(r[i]); return '<td title="' + esc(v) + '">' + esc(v) + '</td>'; }).join('') + '</tr>').join('')
            : '<tr><td class="empty" colspan="' + Math.max(cols, 1) + '">' + esc(u('noData')) + '</td></tr>';
          count.textContent = '· ' + u('rows', { n: list.length });
        };
        input.addEventListener('input', draw); draw();
      }
    };
  }

  /* ───────── Tariff Watch — China duty rate (manually maintained, from hub V40) ───────── */
  const DUTY_DEFAULT = '41.4';
  const tariffData = () => {
    const d = store.get(K_TARIFF, {}) || {};
    // 37.5% was the previous default; a browser that saved it should now show the current rate.
    if (String(d.rate || '').trim() === '37.5') delete d.rate;
    return d;
  };
  const pct = (r) => { r = String(r == null ? '' : r).trim(); return /^[\d.,]+$/.test(r) ? r + '%' : r; };
  const dutyRate = () => pct(tariffData().rate || DUTY_DEFAULT);

  // Archive of manual rate changes (newest first). The site-default row records when the
  // built-in rate itself was changed in the code.
  const DUTY_DEFAULT_SINCE = '2026-09-30', DUTY_PREVIOUS_DEFAULT = '37.5';
  const dutyHistory = () => { const h = store.get(K_DUTY_HISTORY, []); return Array.isArray(h) ? h : []; };
  function logDutyChange(from, to, extra) {
    const h = dutyHistory();
    h.unshift(Object.assign({ at: new Date().toISOString(), from: String(from), to: String(to) }, extra || {}));
    store.set(K_DUTY_HISTORY, h.slice(0, 200));
  }
  const fmtDateTime = (iso) => { try { return new Date(iso).toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return iso; } };
  const fmtDate = (ymd) => { try { const [y, m, d] = ymd.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return ymd; } };
  function lastChangeText() {
    const h = dutyHistory()[0];
    return h ? u('lastChangedOn', { date: fmtDateTime(h.at), from: pct(h.from), to: pct(h.to) })
             : u('defaultSince', { rate: pct(DUTY_DEFAULT), date: fmtDate(DUTY_DEFAULT_SINCE) });
  }
  function historyTable() {
    const rows = dutyHistory().map(h => '<tr><td>' + esc(fmtDateTime(h.at)) + '</td><td><span class="rate-old">' + esc(pct(h.from)) + '</span> → <b>' + esc(pct(h.to)) + '</b>' + (h.reset ? ' <span class="chip">' + esc(u('resetChip')) + '</span>' : '') + '</td><td>' + esc(h.effective ? fmtDate(h.effective) : '—') + '</td><td>' + esc([h.source, h.note].filter(Boolean).join(' · ') || '—') + '</td></tr>').join('');
    const base = '<tr class="base"><td>' + esc(fmtDate(DUTY_DEFAULT_SINCE)) + '</td><td><span class="rate-old">' + esc(pct(DUTY_PREVIOUS_DEFAULT)) + '</span> → <b>' + esc(pct(DUTY_DEFAULT)) + '</b> <span class="chip">' + esc(u('siteDefault')) + '</span></td><td>' + esc(fmtDate(DUTY_DEFAULT_SINCE)) + '</td><td>' + esc(u('siteDefaultNote')) + '</td></tr>';
    return '<section class="card"><div class="table-head" style="padding-bottom:10px"><div><h2 style="font-size:17px">' + esc(u('historyTitle')) + '</h2><p class="muted small" style="margin-top:2px">' + esc(u('historySub')) + '</p></div></div>' +
      '<div class="hist-wrap"><table class="tbl hist"><thead><tr><th>' + esc(u('changedOn')) + '</th><th>' + esc(u('rateChange')) + '</th><th>' + esc(u('effectiveDate')) + '</th><th>' + esc(u('sourceNote')) + '</th></tr></thead><tbody>' + rows + base + '</tbody></table></div></section>';
  }
  function viewTariff() {
    const d = tariffData();
    return {
      title: u('tariff'), crumbs: [['#/tariff', u('tariff')]],
      html: '<div class="page-head"><div class="eyebrow">' + esc(u('company')) + '</div><h1>' + esc(u('tariff')) + '</h1><p>' + esc(u('tariffSub')) + '</p></div>' +
        '<div class="card pad stack">' +
        '<div class="field-grid"><div class="field"><span>' + esc(u('origin')) + '</span><strong>' + esc(u('china')) + '</strong></div><div class="field"><span>' + esc(u('destination')) + '</span><strong>' + esc(u('usa')) + '</strong></div>' +
        '<div class="field"><span>' + esc(u('hts')) + '</span><strong>' + esc(d.hs || '3914.00') + '</strong></div><div class="field duty"><span>' + esc(u('dutyRate')) + '</span><strong>' + esc(dutyRate()) + '</strong></div></div>' +
        ((d.verified || d.note || d.source) ? '<div class="callout note">' + [d.verified ? '<b>' + esc(u('lastUpdated')) + ':</b> ' + esc(d.verified) : '', d.source ? '<b>' + esc(u('sourceNote')) + ':</b> ' + esc(d.source) : '', d.note ? '<b>' + esc(u('notes')) + ':</b> ' + esc(d.note) : ''].filter(Boolean).join('<br>') + '</div>' : '') +
        '<div class="duty-meta"><span class="muted small">' + esc(lastChangeText()) + '</span><button type="button" class="btn sm" data-edit>✎ ' + esc(u('editDuty')) + '</button></div>' +
        '<div data-editor hidden><div class="card pad" style="box-shadow:none;background:var(--surface-2)"><h3>' + esc(u('dutyRate')) + '</h3><p class="small" style="margin:4px 0 14px">' + esc(u('manualHelp')) + '</p>' +
        '<div class="form-grid"><div><label for="tRate">' + esc(u('dutyRate')) + ' (%)</label><input class="input" id="tRate" inputmode="decimal" placeholder="41.4"></div><div><label for="tHs">' + esc(u('hts')) + '</label><input class="input" id="tHs"></div>' +
        '<div><label for="tSrc">' + esc(u('sourceNote')) + '</label><input class="input" id="tSrc" placeholder="' + esc(u('sourcePh')) + '"></div><div><label for="tVer">' + esc(u('lastUpdated')) + '</label><input class="input" id="tVer" type="date"></div></div>' +
        '<div class="form-full" style="margin-top:12px"><label for="tNote">' + esc(u('notes')) + '</label><textarea class="input" id="tNote"></textarea></div>' +
        '<div class="tools"><button type="button" class="btn primary sm" data-save>' + esc(u('save')) + '</button><button type="button" class="btn sm" data-reset>↺ ' + esc(u('resetDuty')) + '</button></div><p class="small" data-save-status role="status" style="margin-top:8px"></p></div></div>' +
        '<div class="callout flag"><strong>⚑ ' + esc(u('important')) + '</strong>' + esc(u('tariffRule')) + '</div></div>' +
        '<div style="margin-top:18px">' + historyTable() + '</div>',
      mount(root) {
        const ed = $('[data-editor]', root);
        const fill = () => { const x = tariffData(); $('#tRate').value = x.rate || DUTY_DEFAULT; $('#tHs').value = x.hs || '3914.00'; $('#tSrc').value = x.source || ''; $('#tVer').value = x.verified || new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10); $('#tNote').value = x.note || ''; };
        const reopen = (msg) => { render(); const e2 = $('[data-editor]'); e2.hidden = false; fill(); $('[data-save-status]').textContent = msg; };
        $('[data-edit]', root).addEventListener('click', () => { ed.hidden = !ed.hidden; if (!ed.hidden) { fill(); $('#tRate').focus(); $('#tRate').select(); } });
        $('[data-save]', root).addEventListener('click', () => {
          const x = { rate: $('#tRate').value.trim().replace(/%$/, '') || DUTY_DEFAULT, hs: $('#tHs').value.trim() || '3914.00', source: $('#tSrc').value.trim(), verified: $('#tVer').value, note: $('#tNote').value.trim() };
          const before = String(tariffData().rate || DUTY_DEFAULT).trim();
          store.set(K_TARIFF, x);
          if (before !== x.rate) logDutyChange(before, x.rate, { effective: x.verified, source: x.source, note: x.note });
          track('china_duty_update', { rate: x.rate, from: before });
          reopen(JSON.stringify(tariffData()) === JSON.stringify(x) ? u('saved') : u('saveFail'));
        });
        $('[data-reset]', root).addEventListener('click', () => {
          const before = String(tariffData().rate || DUTY_DEFAULT).trim();
          store.del(K_TARIFF);
          if (before !== DUTY_DEFAULT) logDutyChange(before, DUTY_DEFAULT, { reset: true });
          reopen(u('resetDone'));
        });
      }
    };
  }

  /* ───────── China duty verification pop-up (every 5 days; closes only with its Close button) ───────── */
  const VERIFY_EVERY_MS = 5 * 24 * 60 * 60 * 1000;
  let verifyShownThisLoad = false;
  function verifyDue() {
    const last = Number((store.get(K_DUTY_VERIFY, {}) || {}).lastClosed) || 0;
    return Date.now() - last >= VERIFY_EVERY_MS;
  }
  function maybeShowVerify() {
    if (!verifyDue() || !$('#dutyVerify').hidden) return;
    // Without browser storage the close time can't be remembered; then show it once per visit only.
    if (verifyShownThisLoad && (store.get(K_DUTY_VERIFY, null) == null)) return;
    verifyShownThisLoad = true;
    const d = tariffData(), box = $('#dutyVerifyBody');
    box.innerHTML = '<div class="eyebrow">⚑ ' + esc(u('verifyEyebrow')) + '</div><h2 id="dutyVerifyTitle" style="margin-top:4px">' + esc(u('verifyTitle')) + '</h2>' +
      '<div class="verify-rate"><span>' + esc(u('dutyRate')) + ' · HTS ' + esc(d.hs || '3914.00') + '</span><b>' + esc(dutyRate()) + '</b><small>' + esc(lastChangeText()) + '</small></div>' +
      '<p>' + esc(u('verifyBody')) + '</p><p class="muted small" style="margin-top:8px">' + esc(u('verifyHow')) + '</p>' +
      '<div class="row"><button type="button" class="btn primary" data-verify-close>' + esc(u('close')) + '</button></div>';
    const m = $('#dutyVerify');
    lastFocus = document.activeElement;
    m.hidden = false;
    $('[data-verify-close]', m).addEventListener('click', () => {
      store.set(K_DUTY_VERIFY, { lastClosed: Date.now(), rate: dutyRate() });
      m.hidden = true;
      track('duty_verify_closed', { rate: dutyRate() });
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    });
    $('[data-verify-close]', m).focus();
  }

  /* ───────── Modal & lightbox ───────── */
  let lastFocus = null;
  function openModal(title, body, workbook, sheet) {
    lastFocus = document.activeElement;
    const tab = sheet ? SHEET_TO_TAB[sheet.trim()] : null;
    $('#excelModalBody').innerHTML = '<h2 id="excelModalTitle">' + esc(title) + '</h2><p>' + esc(body) + '</p>' +
      (workbook ? '<div class="kv"><div><b>' + esc(u('workbook')) + '</b><span>' + esc(workbook) + '</span></div><div><b>' + esc(u('sheet')) + '</b><span>' + esc(sheet) + '</span></div></div>' : '') +
      '<div class="row">' + (tab ? '<a class="btn" href="#/live/' + tab + '" data-close>▦ ' + esc(u('viewSnapshot')) + '</a>' : '') + '<button type="button" class="btn primary" data-close>' + esc(u('close')) + '</button></div>';
    const m = $('#excelModal'); m.hidden = false;
    $$('[data-close]', m).forEach(b => b.addEventListener('click', closeModal));
    $('button[data-close]', m).focus();
  }
  // Where each workbook lives on the company server (from hub V40's server-path dialog).
  const SERVER_ROOTS = { 'Suivi des commandes': 'Z:\\- Suivis des Commandes', 'Price list': 'Z:\\', 'Shipping Weight Chart': 'Z:\\' };
  function openServerPath(workbook, sheet) {
    lastFocus = document.activeElement;
    track('excel_path_open', { workbook: workbook, sheet: sheet });
    const root = SERVER_ROOTS[workbook] || 'Z:\\';
    const path = root + ' → ' + workbook + ' → ' + sheet;
    const tab = SHEET_TO_TAB[sheet.trim()];
    const steps = [u('path1'), u('path2'), root.length > 3 ? u('path3', { folder: root.slice(3) }) : null, u('path4', { wb: workbook, sheet: sheet })].filter(Boolean);
    $('#excelModalBody').innerHTML = '<div class="eyebrow">' + esc(u('serverLocation')) + '</div><h2 id="excelModalTitle" style="margin-top:4px">' + esc(workbook) + ' · ' + esc(sheet) + '</h2><p>' + esc(u('pathSub')) + '</p>' +
      '<div class="path-box"><code data-path-text>' + esc(path) + '</code></div>' +
      '<ol class="path-steps">' + steps.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol>' +
      '<div class="row"><span class="muted small" data-copied role="status" style="margin-right:auto;align-self:center"></span><button type="button" class="btn" data-copy>' + esc(u('copyPath')) + '</button>' + (tab ? '<a class="btn" href="#/live/' + tab + '" data-close>▦ ' + esc(u('viewSnapshot')) + '</a>' : '') + '<button type="button" class="btn primary" data-close>' + esc(u('close')) + '</button></div>';
    const m = $('#excelModal'); m.hidden = false;
    $$('[data-close]', m).forEach(b => b.addEventListener('click', closeModal));
    $('[data-copy]', m).addEventListener('click', () => {
      const done = (ok) => { $('[data-copied]', m).textContent = ok ? u('copied') : u('copyManual'); };
      const selectIt = () => { const r = document.createRange(); r.selectNodeContents($('[data-path-text]', m)); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); };
      try { navigator.clipboard.writeText(path).then(() => done(true), () => { selectIt(); done(false); }); } catch (e) { selectIt(); done(false); }
    });
    $('button[data-close]', m).focus();
  }
  function confirmModal(title, body, okLabel, onOk) {
    lastFocus = document.activeElement;
    $('#excelModalBody').innerHTML = '<h2 id="excelModalTitle">' + esc(title) + '</h2><p>' + esc(body) + '</p><div class="row"><button type="button" class="btn" data-close>' + esc(u('cancel')) + '</button><button type="button" class="btn primary" data-ok>' + esc(okLabel) + '</button></div>';
    const m = $('#excelModal'); m.hidden = false;
    $('[data-close]', m).addEventListener('click', closeModal);
    $('[data-ok]', m).addEventListener('click', () => { m.hidden = true; onOk(); });
    $('[data-ok]', m).focus();
  }
  function closeModal() { $('#excelModal').hidden = true; if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }
  function openLightbox(id, cap) {
    lastFocus = document.activeElement;
    const lb = $('#lightbox'); lb.classList.remove('full');
    $('#lightboxImg').src = IMG[id]; $('#lightboxImg').alt = cap; $('#lightboxCap').textContent = cap;
    $('#lightboxFull').textContent = u('fullSize'); $('#lightboxClose').textContent = u('close');
    lb.hidden = false; $('#lightboxClose').focus();
  }
  function closeLightbox() { $('#lightbox').hidden = true; $('#lightboxImg').removeAttribute('src'); if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }

  /* ───────── Global events ───────── */
  document.addEventListener('click', (e) => {
    const ex = e.target.closest('[data-excel]');
    if (ex) { const [wb, sh] = ex.dataset.excel.split('|'); openServerPath(wb, sh); return; }
    const sp = e.target.closest('[data-path]');
    if (sp) { const info = LIVE_TABS[sp.dataset.path]; openServerPath(LIVE_FILE_MAP[info.file].label, info.sheet.trim()); return; }
    const z = e.target.closest('[data-zoom]');
    if (z) { openLightbox(z.dataset.zoom, z.dataset.cap); return; }
    if (e.target.closest('[data-open-menu]')) { toggleMenu(true); return; }
    // Close the mobile menu after following a link inside it
    if (e.target.closest('#sidebar a')) toggleMenu(false);
  });
  function toggleMenu(open) {
    document.body.classList.toggle('menu-open', open);
    $('#menuBtn').setAttribute('aria-expanded', String(open));
  }
  $('#menuBtn').addEventListener('click', () => toggleMenu(!document.body.classList.contains('menu-open')));
  $('#scrim').addEventListener('click', () => toggleMenu(false));
  $('#excelModal').addEventListener('click', (e) => { if (e.target.id === 'excelModal') closeModal(); });
  $('#lightbox').addEventListener('click', (e) => { if (e.target.id === 'lightbox') closeLightbox(); });
  $('#lightboxClose').addEventListener('click', closeLightbox);
  $('#lightboxFull').addEventListener('click', () => { const lb = $('#lightbox'); lb.classList.toggle('full'); $('#lightboxFull').textContent = lb.classList.contains('full') ? u('fitSize') : u('fullSize'); });
  document.addEventListener('keydown', (e) => {
    if (!$('#dutyVerify').hidden) {
      if (e.key === 'Tab') { e.preventDefault(); $('[data-verify-close]').focus(); }
      if (e.key === 'Escape') e.preventDefault();
      return;
    }
    if (e.key !== 'Escape') return;
    if (!$('#lightbox').hidden) closeLightbox();
    else if (!$('#excelModal').hidden) closeModal();
    else if (document.body.classList.contains('menu-open')) toggleMenu(false);
  });
  $('#roleSelect').addEventListener('change', (e) => go(e.target.value ? '#/role/' + e.target.value : '#/'));
  $('#langBtn').addEventListener('click', () => {
    lang = lang === 'en' ? 'fr' : 'en'; store.set(K_LANG, lang);
    track('language_change', { language: lang });
    const y = window.scrollY; render(); window.scrollTo(0, y);
  });
  window.addEventListener('hashchange', render);

  render();
  loadSavedHandles();
  maybeShowVerify();
  // Also catch the 5-day mark when the hub stays open (checked hourly and when the tab comes back).
  setInterval(maybeShowVerify, 60 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) maybeShowVerify(); });
})();
