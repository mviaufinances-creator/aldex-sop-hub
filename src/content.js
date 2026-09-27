/* Aldex SOP Hub — SOP content (EN/FR).
   Source: SOP-SLC-001 and the Sales & Logistics process notes in the previous hub (v17).
   Wording is restructured for scanning only; procedures, order, rules and responsibilities are unchanged.

   Step fields:
     title    step action (required)
     tag      optional chip, e.g. "Prepaid & Charge"
     do       what to do: one string or a list of short actions
     verify   checklist items (rendered as checkboxes)
     groups   checklist groups that depend on shipping terms: {when:'prepaid'|'collect', title, items}
     table    {head:[...], rows:[[...]]}
     flag     "if you are not sure / stop" callout (amber)
     note     neutral tip
     excel    [workbook, sheet]  -> Open Excel source button
     tariff   true -> Open Tariff Watch button
     link     [sopId, label] -> button that opens another SOP
     img      [[imageId, caption], ...]  (only screenshots that show this exact step)
     shot     placeholder text when a screenshot would help but none exists yet
   Verify items are t(label) or [t(label), t(detail)].
   Reference pages (kind:'ref') have `blocks` instead of `steps` — see the Shipping & Receiving pages.
*/
const t = (en, fr) => ({ en, fr });

const ROLES = [
  { id: 'saleslog', icon: '📦', name: t('Sales & Logistics Coordinator', 'Coordonnateur ventes et logistique'),
    short: t('Sales & Logistics', 'Ventes & Logistique'),
    desc: t('PO control, transportation, Sage, invoicing, BOL, Deringer documentation and final shipment checks.',
            'Contrôle des BC, transport, Sage, facturation, BOL, documentation Deringer et vérification finale des expéditions.'),
    start: { href: '#/start', title: t('Start Here', 'Commencer ici'), sub: t('General controls — read before you start', 'Contrôles généraux — à lire avant de commencer') },
    groups: [
      { id: 'main', title: t('Main shipment workflow', 'Flux principal d’expédition'), hint: t('Follow in order', 'Suivre dans l’ordre'), seq: true },
      { id: 'more', title: t('Additional procedures', 'Procédures supplémentaires'), hint: t('Use as needed', 'Au besoin') }
    ] },
  { id: 'expedition', icon: '🚚', name: t('Shipping & Receiving', 'Expédition & Réception'), short: t('Shipping & Receiving', 'Expédition & Réception'),
    desc: t('Dock operations, shipping, receiving, trailer checks, document validation, LOT traceability, seals, checklists and escalation.',
            'Opérations de quai, expédition, réception, vérification des remorques, validation des documents, traçabilité des LOT, scellés, checklists et escalade.'),
    start: { href: '#/sop/shiprxHub', title: t('Operations Handbook', 'Manuel opérationnel'), sub: t('Overview — the shipping gates and core dock rules', 'Aperçu — les étapes d’expédition et les règles de base du quai') },
    groups: [
      { id: 'dock', title: t('Daily dock controls', 'Contrôles quotidiens du quai'), hint: t('Use at the dock', 'À utiliser au quai') },
      { id: 'docs', title: t('Documents & traceability', 'Documents et traçabilité'), hint: t('Reference', 'Référence') },
      { id: 'audit', title: t('Audit, training & implementation', 'Audit, formation et implantation'), hint: t('Supervisors', 'Superviseurs') }
    ] },
  { id: 'finance', icon: '💼', name: t('Finance', 'Finance'), short: t('Finance', 'Finance'),
    desc: t('Financial controls, approvals, reporting and management procedures.', 'Contrôles financiers, approbations, rapports et procédures de gestion.'),
    planned: t('Approvals, recurring reports and deadlines, exceptions and escalation.', 'Approbations, rapports récurrents et échéances, exceptions et escalade.') },
  { id: 'accounting', icon: '🧾', name: t('Accounting', 'Comptabilité'), short: t('Accounting', 'Comptabilité'),
    desc: t('AP/AR, invoicing, reconciliations, month-end and accounting controls.', 'Fournisseurs/clients, facturation, rapprochements, fin de mois et contrôles comptables.'),
    planned: t('AP/AR, invoicing, reconciliations, month-end, document filing and accounting escalation.', 'Fournisseurs/clients, facturation, rapprochements, fin de mois, classement et escalade comptable.') },
  { id: 'cnesst', icon: '🦺', name: t('CNESST', 'CNESST'), short: t('CNESST', 'CNESST'),
    desc: t('Workplace safety, incidents, prevention and required documentation.', 'Santé et sécurité, incidents, prévention et documentation requise.'),
    planned: t('Reporting, incident response, documentation, prevention and internal escalation.', 'Déclarations, intervention en cas d’incident, documentation, prévention et escalade interne.') },
  { id: 'production', icon: '🏭', name: t('Director of Production', 'Directeur de production'), short: t('Director of Production', 'Directeur de production'),
    desc: t('Production planning, quality, inventory decisions and escalation.', 'Planification de production, qualité, décisions d’inventaire et escalade.'),
    planned: t('Production planning, priorities, quality controls, maintenance coordination, inventory decisions and escalation.', 'Planification, priorités, contrôle de la qualité, coordination de l’entretien, décisions d’inventaire et escalade.') },
  { id: 'assistant', icon: '🧭', name: t('Assistant Director', 'Directeur adjoint'), short: t('Assistant Director', 'Directeur adjoint'),
    desc: t('Management support, approvals, coordination and continuity procedures.', 'Soutien à la direction, approbations, coordination et continuité.'),
    planned: t('Management support, approvals, cross-department coordination, escalation and continuity.', 'Soutien à la direction, approbations, coordination entre départements, escalade et continuité.') }
];

/* Start Here — reference page for the Sales & Logistics role (not a step-by-step SOP). */
const START_HERE = {
  sopId: 'SOP-SLC-001', version: '1.0', effective: t('November 5, 2025', '5 novembre 2025'),
  purpose: t('To standardize order processing, shipment scheduling, documentation, inventory management and purchase order creation for the Sales & Logistics Coordinator at Aldex. The role requires ongoing email monitoring for timely and professional responses and coordination with the VP of Sales (Jim), Director General and Assistant Director.',
             'Standardiser le traitement des commandes, la planification des expéditions, la documentation, la gestion de l’inventaire et la création des bons de commande pour le Coordonnateur ventes et logistique chez Aldex. Le rôle exige une surveillance continue des courriels afin d’assurer des réponses rapides et professionnelles, en coordination avec le VP des ventes (Jim), le Directeur général et le Directeur adjoint.'),
  scope: t('Applies to domestic and international resin shipments, supplier orders, inventory tracking, documentation, and long-term optimization and efficiency projects at Aldex.',
           'S’applique aux expéditions de résines nationales et internationales, aux commandes fournisseurs, au suivi de l’inventaire, à la documentation et aux projets d’optimisation et d’efficacité à long terme chez Aldex.'),
  duties: [
    [t('Sales Coordinator', 'Coordonnateur ventes'), t('Process customer POs, enter orders into Sage, validate pricing, surcharges and tariffs, create purchase orders, manage inventory adjustments, compile documentation for Accounting and support sales analysis with Al Karim and Jim.', 'Traiter les BC clients, entrer les commandes dans Sage, valider les prix, surcharges et tarifs, créer les BC, gérer les ajustements d’inventaire, compiler les documents pour la comptabilité et soutenir l’analyse des ventes avec Al Karim et Jim.')],
    [t('Logistics Coordinator', 'Coordonnateur logistique'), t('Schedule transportation, coordinate carriers, prepare and validate shipping documentation, liaise with customs, and work with the DG, Assistant DG, shipper and chef de plancher.', 'Planifier le transport, coordonner les transporteurs, préparer et valider les documents d’expédition, communiquer avec les douanes et travailler avec le DG, le DG adjoint, l’expéditeur et le chef de plancher.')]
  ],
  principle: t('If you are not sure, flag it. Stop, identify the uncertainty, and escalate rather than guessing or forcing the transaction through.',
               'Si vous n’êtes pas certain, signalez-le. Arrêtez-vous, identifiez l’incertitude et escaladez plutôt que de deviner ou de forcer la transaction.'),
  email: t('Keep email under continuous review so customer, supplier, carrier and production changes are not missed.',
           'Garder les courriels sous surveillance continue afin de ne pas manquer les changements des clients, fournisseurs, transporteurs ou de la production.'),
  jimReport: [
    t('Print all possible customer POs', 'Imprimer tous les BC clients possibles'),
    t('Verify quantities against Jim’s report', 'Vérifier les quantités par rapport au rapport de Jim'),
    t('Verify pricing against the price list', 'Vérifier les prix avec la liste de prix'),
    t('Keep the temporary 12% / 15% surcharge on a separate line item', 'Garder la surcharge temporaire de 12 % / 15 % sur une ligne distincte')
  ],
  surcharge: [
    ['12%', t('C-800 products', 'Produits C-800')],
    ['15%', t('C-800X10 and resale products', 'C-800X10 et produits de revente')]
  ],
  surchargeNote: t('Keep the temporary surcharge separate from the base price.', 'Garder la surcharge temporaire séparée du prix de base.'),
  tariff: t('For Chinese-origin goods, check HTS/HS 3914.00 and verify the applicable tariff in Tariff Watch before processing. Treat the rate as changeable and verify it against the controlled live source every time.',
            'Pour les marchandises d’origine chinoise, vérifier le code HTS/HS 3914.00 et le tarif applicable dans Tariff Watch avant le traitement. Considérer le taux comme variable et le vérifier auprès de la source contrôlée à chaque fois.'),
  control: t('If a rate, quantity, price, surcharge, duty, carrier or document does not match, stop and flag it.',
             'Si un tarif, une quantité, un prix, une surcharge, un droit, un transporteur ou un document ne concorde pas, arrêtez-vous et signalez-le.')
};

const SOPS = [
  /* ───────────── MAIN SHIPMENT WORKFLOW ───────────── */
  {
    id: 'order', num: '01', role: 'saleslog', group: 'main',
    title: t('Customer PO & Shipping Terms', 'BC client et conditions de transport'),
    purpose: t('Before creating the Sales Order, validate the Shipping Report against the actual customer PO and confirm every order detail.',
               'Avant de créer la commande client, valider le rapport d’expédition avec le BC client réel et confirmer chaque information de la commande.'),
    needs: t('Shipping Report (Jim’s report) · the actual customer PO · the current Price List', 'Rapport d’expédition (rapport de Jim) · le BC client réel · la liste de prix actuelle'),
    excel: ['Suivi des commandes', 'AGENDA EXPEDITION'],
    steps: [
      {
        title: t('Match the Shipping Report to the customer PO', 'Comparer le rapport d’expédition au BC client'),
        do: t('Put the Shipping Report next to the actual customer PO and compare them line by line.',
              'Placer le rapport d’expédition à côté du BC client réel et les comparer ligne par ligne.'),
        verify: [t('Customer matches', 'Le client correspond'), t('Product matches', 'Le produit correspond'), t('Quantity matches', 'La quantité correspond')],
        flag: t('Mismatch = stop and call Jim. If the product and/or quantity does not match, do not guess and do not continue until it is clarified.',
                'Différence = arrêter et appeler Jim. Si le produit et/ou la quantité ne concorde pas, ne pas deviner et ne pas continuer avant clarification.'),
        excel: ['Suivi des commandes', 'AGENDA EXPEDITION']
      },
      {
        title: t('Confirm shipping terms, pricing and delivery address', 'Confirmer les conditions de transport, le prix et l’adresse de livraison'),
        do: t('Check the terms and price on the customer PO against the current Price List.',
              'Vérifier les conditions et le prix du BC client avec la liste de prix actuelle.'),
        verify: [
          t('Shipping terms on the PO: Collect or Prepaid & Charge', 'Conditions de transport du BC : Collect ou Prepaid & Charge'),
          t('Price matches the current Price List', 'Le prix correspond à la liste de prix actuelle'),
          t('Any applicable surcharge is confirmed (12% C-800 · 15% C-800X10 and resale)', 'Toute surcharge applicable est confirmée (12 % C-800 · 15 % C-800X10 et revente)'),
          t('Delivery address on the PO is correct', 'L’adresse de livraison du BC est correcte')
        ],
        flag: t('If a price, surcharge or tariff cannot be confirmed, flag it before proceeding. Chinese-origin goods: verify HTS 3914.00 in Tariff Watch.',
                'Si un prix, une surcharge ou un tarif ne peut pas être confirmé, signalez-le avant de continuer. Origine chinoise : vérifier le HTS 3914.00 dans Tariff Watch.'),
        excel: ['Price list', '2024'], tariff: true,
        img: [['price-list-search', t('Finding the current “Price list” workbook (search on the Y:\\ drive).', 'Trouver le classeur « Price list » actuel (recherche sur le lecteur Y:\\).')]]
      },
      {
        title: t('Confirm all other order details', 'Confirmer toutes les autres informations de la commande'),
        do: t('Do a final pass on the PO. Only move on when everything is confirmed.', 'Faire une dernière vérification du BC. Continuer seulement lorsque tout est confirmé.'),
        verify: [
          t('Customer', 'Client'), t('PO number', 'Numéro de BC'), t('Product', 'Produit'), t('Quantity', 'Quantité'),
          t('Requested timing', 'Échéancier demandé'), t('Any other required information', 'Toute autre information requise')
        ],
        flag: t('Rule: validate first, create second. Do not create the Sales Order until every discrepancy is resolved.',
                'Règle : valider d’abord, créer ensuite. Ne pas créer la commande client avant que toute différence soit résolue.'),
        note: t('Next: source transportation (02), then create the Sales Order in Sage (03).', 'Ensuite : trouver le transport (02), puis créer la commande client dans Sage (03).')
      }
    ]
  },
  {
    id: 'freight', num: '02', role: 'saleslog', group: 'main',
    title: t('Source Transportation', 'Trouver le transport'),
    purpose: t('Select the lane, shipment type, carrier and rate before moving into Sage.', 'Sélectionner la ligne, le type d’expédition, le transporteur et le tarif avant de passer à Sage.'),
    needs: t('Validated customer PO · shipment details · Excel transport report (Analysis AE)', 'BC client validé · détails de l’expédition · rapport Excel de transport (Analysis AE)'),
    excel: ['Suivi des commandes', 'Analysis (AE)'],
    steps: [
      {
        title: t('Determine LTL or TL', 'Déterminer LTL ou TL'),
        do: t('Use the Excel report and the shipment details to decide whether the shipment is LTL or TL.', 'Utiliser le rapport Excel et les détails de l’expédition pour déterminer s’il s’agit de LTL ou TL.'),
        excel: ['Suivi des commandes', 'AGENDA EXPEDITION']
      },
      {
        title: t('Get carrier options and rates for the lane', 'Obtenir les options et tarifs de transport pour la ligne'),
        do: t('Find the lane below and use the source listed for it.', 'Trouver la ligne ci-dessous et utiliser la source indiquée.'),
        table: {
          head: [t('Lane', 'Ligne'), t('Where to get carrier and rate', 'Où obtenir le transporteur et le tarif')],
          rows: [
            [t('Canada — especially LTL', 'Canada — surtout LTL'), t('Transexpert', 'Transexpert')],
            [t('USA', 'USA'), t('Excel report (Analysis AE) to help determine carrier and rate', 'Rapport Excel (Analysis AE) pour aider à déterminer le transporteur et le tarif')],
            [t('USA — TX / FL', 'USA — TX / FL'), t('Rates from Transexpert and Traffictech', 'Tarifs de Transexpert et Traffictech')],
            [t('Returns from Mexico', 'Retours du Mexique'), t('TQL, when applicable', 'TQL, lorsque applicable')]
          ]
        },
        flag: t('If the lane or rate is unclear, flag it before booking.', 'Si la ligne ou le tarif n’est pas clair, signalez-le avant de réserver.'),
        excel: ['Suivi des commandes', 'Analysis (AE)']
      },
      {
        title: t('Polymer lane: Byhalia, MS → Granby, QC', 'Ligne polymère : Byhalia, MS → Granby, QC'),
        tag: t('Polymer lane only', 'Ligne polymère seulement'),
        do: [
          t('Check TQL, Rajpura and alternate carriers each week.', 'Vérifier TQL, Rajpura et les transporteurs alternatifs chaque semaine.'),
          t('Tiffany will ask for the date and transportation company.', 'Tiffany demandera la date et le transporteur.'),
          t('Send the AC PO and the Transport PO to Tiffany.', 'Envoyer le BC AC et le BC transport à Tiffany.'),
          t('Use the AC Polymer Excel report to determine which PO is next.', 'Utiliser le rapport Excel AC Polymer pour déterminer quel BC vient ensuite.')
        ],
        excel: ['Suivi des commandes', 'AC POLYMERS']
      },
      {
        title: t('Calculate the freight margin', 'Calculer la marge de fret'),
        tag: t('Prepaid & Charge', 'Prepaid & Charge'),
        table: {
          head: [t('Customer currency', 'Devise du client'), t('Freight to charge', 'Fret à facturer')],
          rows: [
            [t('USD customer', 'Client USD'), t('Freight × 0.88', 'Fret × 0,88')],
            [t('CAD customer', 'Client CAD'), t('CAD freight from the transporter × 1.1', 'Fret CAD du transporteur × 1,1')]
          ]
        },
        flag: t('If you are not sure which currency or freight amount applies, flag it before proceeding.', 'Si vous n’êtes pas certain de la devise ou du montant de fret applicable, signalez-le avant de continuer.')
      },
      {
        title: t('Move to Sage', 'Passer à Sage'),
        do: t('Once transportation is selected, continue to the Sage Sales Order step.', 'Une fois le transport sélectionné, passer à l’étape Commande client dans Sage.'),
        verify: [t('Shipment type (LTL / TL) decided', 'Type d’expédition (LTL / TL) déterminé'), t('Carrier selected', 'Transporteur sélectionné'), t('Rate confirmed', 'Tarif confirmé')]
      }
    ]
  },
  {
    id: 'invoice', num: '03', role: 'saleslog', group: 'main',
    title: t('Sage — Create Sales Order', 'Sage — Créer la commande client'),
    purpose: t('Enter and verify the Sales Order using the Sage recurring transaction workflow.', 'Saisir et vérifier la commande client avec le flux de transaction récurrente dans Sage.'),
    needs: t('Validated customer PO (01) · selected carrier and rate (02)', 'BC client validé (01) · transporteur et tarif sélectionnés (02)'),
    excel: ['Suivi des commandes', 'AGENDA EXPEDITION'],
    steps: [
      {
        title: t('Open the recurring transaction in Sage', 'Ouvrir la transaction récurrente dans Sage'),
        do: t('SAGE → Customers and Sales → Create Sales Orders → Recurring Transaction.', 'SAGE → Clients et ventes → Créer des commandes clients → Transaction récurrente.'),
        img: [['sage-customers-sales', t('Sage 50 → Customers & Sales. Sales Orders is in the Tasks panel.', 'Sage 50 → Clients et ventes. Commandes clients se trouve dans le panneau Tâches.')]]
      },
      {
        title: t('Find the customer', 'Trouver le client'),
        do: t('Search using the first few letters of the customer name. Pick the transaction with the most recent Date Last Processed.', 'Rechercher avec les premières lettres du nom du client. Choisir la transaction dont la date Date Last Processed est la plus récente.'),
        verify: [t('Correct customer selected', 'Bon client sélectionné'), t('Most recent Date Last Processed', 'Date Last Processed la plus récente')],
        img: [['sage-recall-recurring', t('Recall Recurring Transaction — check the Date Last Processed column.', 'Recall Recurring Transaction — vérifier la colonne Date Last Processed.')]]
      },
      {
        title: t('Review the recurring transaction', 'Vérifier la transaction récurrente'),
        do: t('Compare the Sales Order loaded from the recurring transaction with the customer PO.', 'Comparer la commande client chargée de la transaction récurrente avec le BC client.'),
        verify: [t('Quantity', 'Quantité'), t('Product', 'Produit'), t('PO number', 'Numéro de BC'), t('Customer information', 'Informations du client')],
        img: [['sage-sales-order-recurring', t('Sales Order loaded from the recurring transaction — check every line against the PO.', 'Commande client chargée de la transaction récurrente — vérifier chaque ligne avec le BC.')]]
      },
      {
        title: t('Verify the customer PO', 'Vérifier le BC client'),
        do: t('Make sure the PO contains all correct information before proceeding.', 'S’assurer que le BC contient toutes les informations correctes avant de continuer.'),
        verify: [t('Customer PO information is complete and correct', 'Les informations du BC client sont complètes et correctes')],
        flag: t('If anything on the PO looks wrong or incomplete, flag it before proceeding.', 'Si une information du BC semble incorrecte ou incomplète, signalez-la avant de continuer.')
      },
      {
        title: t('Apply the temporary surcharge', 'Appliquer la surcharge temporaire'),
        do: t('Add the surcharge as a separate line item, following the current approved instruction and Jim’s surcharge note.', 'Ajouter la surcharge sur une ligne distincte, selon l’instruction approuvée en vigueur et la note de surcharge de Jim.'),
        table: {
          head: [t('Surcharge', 'Surcharge'), t('Applies to', 'S’applique à')],
          rows: [[t('12%', '12 %'), t('C-800 products', 'Produits C-800')], [t('15%', '15 %'), t('C-800X10 and resale products', 'C-800X10 et produits de revente')]]
        },
        verify: [t('Correct surcharge rate for each product', 'Bon taux de surcharge pour chaque produit'), t('Surcharge is on a separate line item', 'La surcharge est sur une ligne distincte')],
        flag: t('If you are not sure which surcharge applies, flag it before proceeding.', 'Si vous n’êtes pas certain de la surcharge applicable, signalez-le avant de continuer.')
      },
      {
        title: t('Print ×2 and record', 'Imprimer ×2 et enregistrer'),
        do: t('Print the Sales Order twice and keep the required record.', 'Imprimer la commande client deux fois et conserver l’enregistrement requis.'),
        verify: [t('2 copies printed', '2 copies imprimées'), t('Sales Order record kept', 'Enregistrement de la commande conservé')]
      },
      {
        title: t('Duties go on the Invoice, not the Sales Order', 'Les droits vont sur la facture, pas sur la commande'),
        do: t('If duties apply, add them in the Invoice section (04) — not in the Sales Order.', 'Si des droits s’appliquent, les ajouter dans la section Facture (04) — pas dans la commande client.'),
        flag: t('If you are not sure whether duties apply, flag it.', 'Si vous n’êtes pas certain que des droits s’appliquent, signalez-le.')
      }
    ]
  },
  {
    id: 'pricing', num: '04', role: 'saleslog', group: 'main',
    title: t('Convert Sales Order to Invoice', 'Convertir la commande en facture'),
    purpose: t('Convert and verify the invoice, create the Transport PO when applicable, then process the invoice.', 'Convertir et vérifier la facture, créer le BC transport lorsque requis, puis traiter la facture.'),
    needs: t('The Sales Order from 03 · carrier, destination and rate from 02', 'La commande client de 03 · transporteur, destination et tarif de 02'),
    excel: ['Price list', '2024'],
    steps: [
      {
        title: t('Find the Sales Order in Sage', 'Trouver la commande client dans Sage'),
        do: t('Search using the customer / PO you just entered and open the Sales Order.', 'Rechercher avec le client / BC saisi et ouvrir la commande client.'),
        verify: [t('Correct customer and PO number', 'Bon client et bon numéro de BC')],
        img: [['sage-select-order', t('Select Order or Quote — open the Sales Order you just created (example: 23270, “Not Filled”).', 'Select Order or Quote — ouvrir la commande client créée (exemple : 23270, « Not Filled »).')]]
      },
      {
        title: t('Convert to Invoice', 'Convertir en facture'),
        do: t('Select Convert to Invoice.', 'Sélectionner Convert to Invoice.'),
        img: [['sage-sales-order-convert', t('The open Sales Order. Use the “Convert…” button at the top left.', 'La commande client ouverte. Utiliser le bouton « Convert… » en haut à gauche.')]]
      },
      {
        title: t('Re-input and verify values', 'Ressaisir et vérifier les valeurs'),
        do: t('Re-input values where necessary and check carefully before processing to avoid transaction mistakes.', 'Ressaisir les valeurs au besoin et vérifier attentivement avant le traitement afin d’éviter les erreurs de transaction.'),
        verify: [t('Invoice values match the Sales Order', 'Les valeurs de la facture correspondent à la commande client'), t('Values re-entered where necessary', 'Valeurs ressaisies au besoin')],
        flag: t('If a value does not match and you are not sure why, stop and flag it.', 'Si une valeur ne concorde pas et que vous ne savez pas pourquoi, arrêtez-vous et signalez-le.'),
        img: [['sage-sales-invoice', t('Sales Invoice created from the Sales Order — verify every value before processing.', 'Facture créée à partir de la commande client — vérifier chaque valeur avant le traitement.')]]
      },
      {
        title: t('Add the Transport PO # to the invoice', 'Ajouter le no de BC transport à la facture'),
        tag: t('Prepaid & Charge', 'Prepaid & Charge'),
        do: t('The Transport PO # goes in the yellow box at the top left of the Invoice. Create it in the next two steps.', 'Le no de BC transport va dans la case jaune en haut à gauche de la facture. Le créer aux deux étapes suivantes.'),
        flag: t('If you are not sure whether a Transport PO applies to this shipment, flag it.', 'Si vous n’êtes pas certain qu’un BC transport s’applique à cette expédition, signalez-le.')
      },
      {
        title: t('Open Supplier Purchase Orders', 'Ouvrir les bons de commande fournisseurs'),
        tag: t('Prepaid & Charge', 'Prepaid & Charge'),
        do: t('Select the transportation company chosen in 02, then edit the fields below.', 'Sélectionner le transporteur choisi à l’étape 02, puis modifier les champs ci-dessous.'),
        verify: [t('Destination', 'Destination'), t('Rate', 'Tarif'), t('Invoice reference #', 'No de référence de facture'), t('Date', 'Date')],
        excel: ['Suivi des commandes', 'PO to Suppliers'],
        img: [['sage-transport-po-create', t('Transport PO in Sage — carrier, destination, rate, invoice reference and pick-up date.', 'BC transport dans Sage — transporteur, destination, tarif, référence de facture et date de ramassage.')]]
      },
      {
        title: t('Copy, print ×2 and send the Transport PO', 'Copier, imprimer ×2 et envoyer le BC transport'),
        tag: t('Prepaid & Charge', 'Prepaid & Charge'),
        do: [
          t('Copy the Transport PO #.', 'Copier le no de BC transport.'),
          t('Print two copies.', 'Imprimer deux copies.'),
          t('Send one copy to the appropriate email / contact.', 'Envoyer une copie au bon courriel / contact.'),
          t('Process the PO.', 'Traiter le BC.')
        ],
        verify: [t('Transport PO # copied', 'No de BC transport copié'), t('2 copies printed', '2 copies imprimées'), t('Copy sent', 'Copie envoyée'), t('PO processed', 'BC traité')],
        img: [['sage-po-email', t('Sending the Transport PO by email from Sage.', 'Envoi du BC transport par courriel depuis Sage.')]]
      },
      {
        title: t('Return to the Invoice', 'Retourner à la facture'),
        do: t('Paste the Transport PO # into the yellow box, then check the lines below.', 'Coller le no de BC transport dans la case jaune, puis vérifier les lignes ci-dessous.'),
        verify: [
          t('Transport PO # pasted on the invoice', 'No de BC transport collé sur la facture'),
          t('12% / 15% surcharge is still a separate line item', 'La surcharge de 12 % / 15 % est toujours sur une ligne distincte'),
          t('Duties added now, if applicable', 'Droits ajoutés maintenant, s’il y a lieu')
        ],
        flag: t('If you are not sure whether duties apply, flag it before processing.', 'Si vous n’êtes pas certain que des droits s’appliquent, signalez-le avant le traitement.'),
        img: [['sage-invoice-transport-po', t('Example: the Transport PO # (Traffictech- 16821) recorded on the Sales Invoice.', 'Exemple : le no de BC transport (Traffictech- 16821) inscrit sur la facture.')]]
      },
      {
        title: t('Print → Process → Documents', 'Imprimer → Traiter → Documents'),
        do: t('Print the invoice, process it, and continue to Documents (05).', 'Imprimer la facture, la traiter et passer aux Documents (05).'),
        note: t('Example: Rajpura — paste the Transport PO #, then print, process and continue to Documents.', 'Exemple : Rajpura — coller le no de BC transport, puis imprimer, traiter et passer aux Documents.'),
        verify: [t('Invoice printed', 'Facture imprimée'), t('Invoice processed', 'Facture traitée')]
      }
    ]
  },
  {
    id: 'documents', num: '05', role: 'saleslog', group: 'main', terms: true,
    title: t('Documents', 'Documents'),
    purpose: t('Know exactly what the file must contain before creating the shipment documents.', 'Savoir exactement ce que le dossier doit contenir avant de créer les documents d’expédition.'),
    excel: ['Suivi des commandes', 'AGENDA EXPEDITION'],
    steps: [
      {
        title: t('Assemble the required document set', 'Rassembler les documents requis'),
        do: t('Choose the shipping terms on the customer PO, then gather each document.', 'Choisir les conditions de transport du BC client, puis rassembler chaque document.'),
        groups: [
          { when: 'prepaid', title: t('Prepaid & Charge — required set', 'Prepaid & Charge — documents requis'),
            items: [t('Invoice', 'Facture'), t('Customer PO', 'BC client'), t('Sales Order ×2', 'Commande client ×2'), t('Transport Purchase Order ×2', 'BC transport ×2')] },
          { when: 'collect', title: t('Collect — required set', 'Collect — documents requis'),
            items: [t('Invoice', 'Facture'), t('Customer PO', 'BC client'), t('Sales Order ×2', 'Commande client ×2')] }
        ],
        flag: t('Document control: make sure dates, customer/PO references, quantities and addresses match before sending the package forward.', 'Contrôle documentaire : s’assurer que les dates, références client/BC, quantités et adresses concordent avant de poursuivre.')
      },
      {
        title: t('Then prepare the shipment documents', 'Ensuite, préparer les documents d’expédition'),
        do: t('The shipment package continues with the BOL (06) and the Deringer Commercial Invoice (07).', 'Le dossier d’expédition continue avec le BOL (06) et la facture commerciale Deringer (07).')
      }
    ]
  },
  {
    id: 'bol', num: '06', role: 'saleslog', group: 'main',
    title: t('Generate BOL', 'Créer le BOL'),
    purpose: t('Create, verify, print and save the Bill of Lading.', 'Créer, vérifier, imprimer et enregistrer le connaissement (BOL).'),
    needs: t('Customer PO · invoice # · carrier name and Transport PO #', 'BC client · no de facture · nom du transporteur et no de BC transport'),
    excel: ['Suivi des commandes', 'AGENDA EXPEDITION'],
    steps: [
      {
        title: t('Open the BOL source folder', 'Ouvrir le dossier source des BOL'),
        do: t('File Explorer → General → Bills of Lading → select 2 – Bills of Lading.', 'Explorateur de fichiers → General → Bills of Lading → sélectionner 2 – Bills of Lading.')
      },
      {
        title: t('Find the client’s most recent BOL', 'Trouver le BOL le plus récent du client'),
        do: t('Search the client from the PO. Wait about 5 seconds for the most recent BOL to load, then select and open it.', 'Rechercher le client du BC. Attendre environ 5 secondes que le BOL le plus récent se charge, puis le sélectionner et l’ouvrir.'),
        img: [['bol-search', t('Search results in Z:\\2-BILLS OF LADING — open the client’s most recent BOL.', 'Résultats dans Z:\\2-BILLS OF LADING — ouvrir le BOL le plus récent du client.')]]
      },
      {
        title: t('Verify the destination', 'Vérifier la destination'),
        verify: [t('Delivery address is the same as on the customer PO', 'L’adresse de livraison est la même que sur le BC client')],
        flag: t('If the address does not match, stop and flag it.', 'Si l’adresse ne concorde pas, arrêtez-vous et signalez-le.')
      },
      {
        title: t('Update the shipment fields', 'Mettre à jour les champs d’expédition'),
        do: t('Verify or change each field below.', 'Vérifier ou modifier chaque champ ci-dessous.'),
        verify: [
          t('Carrier name and number', 'Nom et numéro du transporteur'), t('Date', 'Date'), t('Customer PO #', 'No de BC client'),
          t('Invoice #', 'No de facture'), t('Delivery address', 'Adresse de livraison'), t('Product', 'Produit'), t('Quantities', 'Quantités')
        ],
        img: [['bol-document', t('A completed BOL. The highlighted fields are the ones to verify or update.', 'Un BOL complété. Les champs surlignés sont ceux à vérifier ou à mettre à jour.')]]
      },
      {
        title: t('Check quantity, pallets and weight', 'Vérifier quantité, palettes et poids'),
        do: t('For clients taking the same product in different quantities, change the CF quantity. The report should update the pallet count and weight.', 'Pour les clients qui prennent le même produit en quantités différentes, modifier la quantité en pi³. Le rapport devrait mettre à jour le nombre de palettes et le poids.'),
        verify: [t('Pallet count updated', 'Nombre de palettes mis à jour'), t('Weight updated', 'Poids mis à jour')],
        flag: t('If the pallet count or weight does not update, check the Shipping Weight Chart.', 'Si le nombre de palettes ou le poids ne se met pas à jour, vérifier le tableau des poids d’expédition.'),
        excel: ['Shipping Weight Chart', 'Feuil1']
      },
      {
        title: t('Confirm shipping terms and gross weight', 'Confirmer les conditions de transport et le poids brut'),
        verify: [t('Shipping terms are correct', 'Les conditions de transport sont correctes'), t('Gross weight looks right', 'Le poids brut semble correct')],
        note: t('Internal note: 1 PAL = 40 lbs gross weight.', 'Note interne : 1 PAL = 40 lb de poids brut.'),
        flag: t('If the system result looks wrong, stop and check the weight chart.', 'Si le résultat du système semble incorrect, arrêtez-vous et vérifiez le tableau de poids.'),
        excel: ['Shipping Weight Chart', 'Feuil1']
      },
      {
        title: t('Print ×4', 'Imprimer ×4'),
        do: t('Print four copies of the BOL.', 'Imprimer quatre copies du BOL.'),
        verify: [t('4 copies printed', '4 copies imprimées')],
        img: [['bol-print', t('Excel print screen for the BOL. The SOP requires 4 copies — this example screenshot still shows Copies: 1.', 'Écran d’impression Excel du BOL. Le SOP exige 4 copies — cette capture d’exemple indique encore Copies : 1.')]]
      },
      {
        title: t('Save with the correct PO #', 'Enregistrer avec le bon no de BC'),
        do: t('Save the BOL using the appropriate PO number.', 'Enregistrer le BOL avec le numéro de BC approprié.'),
        verify: [t('File name includes the correct PO #', 'Le nom du fichier contient le bon no de BC')],
        img: [['bol-save', t('Save As in Z:\\2-BILLS OF LADING — the file name ends with the PO # (example: 23270).', 'Enregistrer sous dans Z:\\2-BILLS OF LADING — le nom du fichier se termine par le no de BC (exemple : 23270).')]]
      }
    ]
  },
  {
    id: 'customs', num: '07', role: 'saleslog', group: 'main',
    title: t('Deringer Commercial Invoice', 'Facture commerciale Deringer'),
    purpose: t('Prepare the commercial invoice from the BOL / customer PO using the required value rules.', 'Préparer la facture commerciale à partir du BOL / BC client selon les règles de valeur requises.'),
    needs: t('The BOL from 06 · customer PO · Sales Order value', 'Le BOL de 06 · BC client · valeur de la commande client'),
    excel: ['Suivi des commandes', 'AGENDA EXPEDITION'],
    steps: [
      {
        title: t('Open the Deringer Commercial Invoice folder', 'Ouvrir le dossier des factures commerciales Deringer'),
        do: t('File Explorer → General → 3- Deringer Commercial Invoice → select 3 – Deringer Commercial Invoice.', 'Explorateur de fichiers → General → 3- Deringer Commercial Invoice → sélectionner 3 – Deringer Commercial Invoice.'),
        note: t('In the screenshots for this SOP, this folder appears as “3-FACTURE RBI INVOICES”.', 'Dans les captures de ce SOP, ce dossier apparaît sous le nom « 3-FACTURE RBI INVOICES ».')
      },
      {
        title: t('Find the client’s invoice', 'Trouver la facture du client'),
        do: t('Search the client name from the PO. If you search the BOL, the Commercial Invoice should normally be right above it.', 'Rechercher le nom du client du BC. Si vous recherchez le BOL, la facture commerciale devrait normalement être juste au-dessus.'),
        img: [['deringer-search', t('Search results for the client’s previous Deringer invoices.', 'Résultats de recherche des factures Deringer précédentes du client.')]]
      },
      {
        title: t('Verify the destination', 'Vérifier la destination'),
        verify: [t('Destination / delivery address matches the customer PO', 'La destination / adresse de livraison correspond au BC client')],
        flag: t('If the address does not match, stop and flag it.', 'Si l’adresse ne concorde pas, arrêtez-vous et signalez-le.')
      },
      {
        title: t('Update the invoice fields', 'Mettre à jour les champs de la facture'),
        do: t('Verify or change each field below.', 'Vérifier ou modifier chaque champ ci-dessous.'),
        verify: [
          t('Invoice #', 'No de facture'), t('Skid quantity', 'Quantité de palettes'), t('Gross weight', 'Poids brut'), t('Product names', 'Noms des produits'),
          t('Quantity', 'Quantité'), t('Pricing', 'Prix'), t('Temporary 12% / 15% surcharge', 'Surcharge temporaire de 12 % / 15 %'), t('PO #', 'No de BC'), t('Date', 'Date')
        ],
        img: [['deringer-invoice', t('Deringer Proforma Invoice — example with invoice #, packages, weight, products, HTS code and PO filled in.', 'Facture pro forma Deringer — exemple avec no de facture, colis, poids, produits, code HTS et BC remplis.')]]
      },
      {
        title: t('Check the invoice value — no duties', 'Vérifier la valeur de la facture — sans droits'),
        do: t('The Deringer Commercial Invoice value must equal the Sales Order value: base price plus the applicable temporary 12% / 15% increase.', 'La valeur de la facture commerciale Deringer doit être égale à la valeur de la commande client : prix de base plus l’augmentation temporaire applicable de 12 % / 15 %.'),
        verify: [t('Invoice value = Sales Order value', 'Valeur de la facture = valeur de la commande client'), t('Duties are NOT included', 'Les droits NE sont PAS inclus')],
        flag: t('Duties are NOT included in the Commercial Invoice value. If the totals do not match, stop and flag it.', 'Les droits ne sont PAS inclus dans la valeur de la facture commerciale. Si les totaux ne concordent pas, arrêtez-vous et signalez-le.')
      },
      {
        title: t('Print ×3', 'Imprimer ×3'),
        do: t('Print three copies: two for transportation and one for internal records.', 'Imprimer trois copies : deux pour le transport et une pour les dossiers internes.'),
        verify: [t('2 copies for transportation', '2 copies pour le transport'), t('1 copy for internal records', '1 copie pour les dossiers internes')],
        img: [['deringer-print', t('Print dialog with Copies set to 3.', 'Fenêtre d’impression avec Copies réglé à 3.')]]
      },
      {
        title: t('Save with the correct PO #', 'Enregistrer avec le bon no de BC'),
        do: t('Save using the appropriate PO number.', 'Enregistrer avec le numéro de BC approprié.'),
        verify: [t('File name includes the correct PO #', 'Le nom du fichier contient le bon no de BC')],
        img: [['deringer-save', t('Save As — the file name ends with the PO # (example: 23270).', 'Enregistrer sous — le nom du fichier se termine par le no de BC (exemple : 23270).')]]
      }
    ]
  },
  {
    id: 'checklist', num: '08', role: 'saleslog', group: 'main', terms: true,
    title: t('Final Documents Check', 'Vérification finale des documents'),
    purpose: t('Final control before the shipment documents are released.', 'Contrôle final avant l’envoi des documents d’expédition.'),
    excel: ['Suivi des commandes', 'AGENDA EXPEDITION'],
    steps: [
      {
        title: t('Check the complete document package', 'Vérifier le dossier complet'),
        do: t('Choose the shipping terms, then confirm every document is present and correct.', 'Choisir les conditions de transport, puis confirmer que chaque document est présent et correct.'),
        groups: [
          { when: 'prepaid', title: t('Prepaid & Charge — final document check', 'Prepaid & Charge — vérification finale'),
            items: [t('Invoice', 'Facture'), t('Customer PO', 'BC client'), t('Sales Order ×2', 'Commande client ×2'), t('Transport Purchase Order ×2', 'BC transport ×2'), t('BOL', 'BOL'), t('Deringer Commercial Invoice', 'Facture commerciale Deringer')] },
          { when: 'collect', title: t('Collect — final document check', 'Collect — vérification finale'),
            items: [t('Invoice', 'Facture'), t('Customer PO', 'BC client'), t('Sales Order ×2', 'Commande client ×2'), t('BOL', 'BOL'), t('Deringer Commercial Invoice', 'Facture commerciale Deringer')] }
        ],
        flag: t('Before sending: if any document is missing or any value does not match, stop and flag it before the shipment leaves.', 'Avant l’envoi : si un document manque ou si une valeur ne concorde pas, arrêtez-vous et signalez-le avant le départ de l’expédition.'),
        excel: ['Suivi des commandes', 'AGENDA EXPEDITION']
      }
    ]
  },

  /* ───────────── ADDITIONAL PROCEDURES ───────────── */
  {
    id: 'credits', num: '09', role: 'saleslog', group: 'more',
    title: t('Credits', 'Crédits'),
    purpose: t('Create a credit with the correct number and the required approval.', 'Créer un crédit avec le bon numéro et l’approbation requise.'),
    excel: ['Suivi des commandes', 'Stock Return - Credit'],
    steps: [
      {
        title: t('Create the credit', 'Créer le crédit'),
        do: [
          t('Use the same invoice number with “-CR”.', 'Utiliser le même numéro de facture avec « -CR ».'),
          t('For a new invoice credit, add CR to the generated invoice number.', 'Pour un crédit sur une nouvelle facture, ajouter CR au numéro généré.')
        ],
        verify: [t('Credit number follows the -CR rule', 'Le numéro de crédit respecte la règle -CR')]
      },
      {
        title: t('Attach the approval', 'Joindre l’approbation'),
        do: t('Attach Jim’s written email approval and include the RMA or customer request.', 'Joindre l’approbation écrite par courriel de Jim et le RMA ou la demande du client.'),
        verify: [t('Jim’s written email approval attached', 'Approbation écrite de Jim jointe'), t('RMA or customer request included', 'RMA ou demande du client inclus')],
        flag: t('If the approval or the RMA / customer request is missing, flag it before proceeding.', 'S’il manque l’approbation ou le RMA / la demande du client, signalez-le avant de continuer.')
      }
    ]
  },
  {
    id: 'stock', num: '10', role: 'saleslog', group: 'more',
    title: t('Stock Transfers', 'Transferts de stock'),
    purpose: t('Process and value stock transfers.', 'Traiter et valoriser les transferts de stock.'),
    excel: ['Suivi des commandes', 'Stock Return - Credit'],
    steps: [
      { title: t('Process as a regular order', 'Traiter comme une commande régulière'),
        do: t('Process the transfer as a regular order, then issue a credit.', 'Traiter le transfert comme une commande régulière, puis émettre un crédit.'),
        link: ['credits', t('How to create a credit (09)', 'Comment créer un crédit (09)')] },
      { title: t('Assign fair market value', 'Attribuer une juste valeur marchande'),
        do: t('Use the Aldex price list to avoid tariff / duties exposure.', 'Utiliser la liste de prix Aldex pour éviter une exposition aux tarifs / droits.'),
        excel: ['Price list', '2024'],
        flag: t('If you are not sure which value to use, flag it.', 'Si vous n’êtes pas certain de la valeur à utiliser, signalez-le.') }
    ]
  },
  {
    id: 'containers', num: '11', role: 'saleslog', group: 'more',
    title: t('Container Arrivals', 'Arrivées de conteneurs'),
    purpose: t('Manage container arrival notifications and delivery scheduling.', 'Gérer les avis d’arrivée des conteneurs et les horaires de livraison.'),
    excel: ['Suivi des commandes', 'Container Arrivals'],
    steps: [
      { title: t('Monitor arrival notices', 'Surveiller les avis d’arrivée'),
        do: t('Watch for arrival notices from the contacts listed in the SOP:', 'Surveiller les avis d’arrivée des contacts indiqués dans le SOP :'),
        table: { head: [t('Contact', 'Contact'), t('Email', 'Courriel')], rows: [
          [t('Alice Liu', 'Alice Liu'), t('op7@sunshinelogistics.ca', 'op7@sunshinelogistics.ca')],
          [t('Komal Hundal', 'Komal Hundal'), t('komal@a1intermodal.ca', 'komal@a1intermodal.ca')],
          [t('Paro Sekhon', 'Paro Sekhon'), t('psekhon@a1intermodal.ca', 'psekhon@a1intermodal.ca')]
        ] } },
      { title: t('Retrieve the latest PO summary', 'Récupérer le dernier résumé des BC'),
        do: t('Search “Updated Aldex-Huxcon PO summary” in email, or use the Container Arrivals file in Z:\\6- Suivis des Commandes.', 'Rechercher « Updated Aldex-Huxcon PO summary » dans les courriels, ou utiliser le fichier Container Arrivals dans Z:\\6- Suivis des Commandes.'),
        img: [['suivi-folder', t('Z:\\6- Suivis des Commandes — the SUIVI DES COMMANDES workbook.', 'Z:\\6- Suivis des Commandes — le classeur SUIVI DES COMMANDES.')]] },
      { title: t('Update Container Arrivals', 'Mettre à jour Container Arrivals'),
        do: t('Update the Suivi des Commandes → Container Arrivals tab with the load details.', 'Mettre à jour l’onglet Suivi des Commandes → Container Arrivals avec les détails du chargement.'),
        excel: ['Suivi des commandes', 'Container Arrivals'] },
      { title: t('Confirm schedules', 'Confirmer les horaires'),
        do: t('Confirm delivery schedules with the DG and Assistant DG.', 'Confirmer les horaires de livraison avec le DG et le DG adjoint.'),
        verify: [t('Confirmed with the DG', 'Confirmé avec le DG'), t('Confirmed with the Assistant DG', 'Confirmé avec le DG adjoint')] },
      { title: t('Send confirmations', 'Envoyer les confirmations'),
        verify: [t('Minimum 1.5-hour interval between deliveries', 'Intervalle minimum de 1,5 heure entre les livraisons')],
        flag: t('If deliveries are closer than 1.5 hours apart, flag it before confirming.', 'Si les livraisons sont à moins de 1,5 heure d’intervalle, signalez-le avant de confirmer.') },
      { title: t('Print and share reports', 'Imprimer et partager les rapports'),
        do: t('Usually 3 copies. Share with:', 'Habituellement 3 copies. Partager avec :'),
        verify: [t('DG', 'DG'), t('Assistant DG', 'DG adjoint'), t('Shipper', 'Expéditeur'), t('Chef de plancher', 'Chef de plancher')] }
    ]
  },
  {
    id: 'inventory', num: '12', role: 'saleslog', group: 'more',
    title: t('Inventory & BOL Tracking', 'Inventaire et suivi des BOL'),
    purpose: t('Scheduled inventory reviews and BOL-based inventory control.', 'Vérifications planifiées et contrôle d’inventaire basé sur les BOL.'),
    excel: ['Suivi des commandes', 'Fab-Sourcing Data'],
    steps: [
      { title: t('Review inventory on schedule', 'Vérifier l’inventaire selon l’horaire'),
        do: t('Inventory file: Z:\\ Inventory.', 'Fichier d’inventaire : Z:\\ Inventory.'),
        table: { head: [t('When', 'Quand'), t('Review', 'Vérification')], rows: [
          [t('Tuesday and Thursday', 'Mardi et jeudi'), t('Inventory review', 'Vérification de l’inventaire')],
          [t('Month-end', 'Fin de mois'), t('Inventory review', 'Vérification de l’inventaire')],
          [t('10th of each month', 'Le 10 de chaque mois'), t('Fab sourcing', 'Sourcing Fab')]
        ] },
        excel: ['Suivi des commandes', 'Fab-Sourcing Data'] },
      { title: t('Process returned BOLs', 'Traiter les BOL retournés'),
        verify: [t('Required deductions / additions processed', 'Déductions / additions requises effectuées'), t('Invoice stapled to the BOL', 'Facture agrafée au BOL'), t('LOT numbers match the documentation', 'Les numéros de LOT correspondent aux documents'), t('Pallet count matches the documentation', 'Le nombre de palettes correspond aux documents')],
        flag: t('Inventory discrepancy? Flag it — do not adjust to force a match.', 'Écart d’inventaire? Signalez-le — ne pas ajuster pour forcer la concordance.') },
      { title: t('Prepare the Monday Accounting package', 'Préparer le dossier du lundi pour la comptabilité'),
        do: t('Set aside completed BOLs and invoices for compilation and submission to Accounting (Jess) on Monday.', 'Mettre de côté les BOL et factures complétés pour compilation et remise à la comptabilité (Jess) le lundi.') },
      { title: t('Make daily inventory adjustments', 'Faire les ajustements quotidiens'),
        do: t('Adjust Packaging, NS, Polymer and other key items subject to regular deductions; update received goods and track all inventory movements.', 'Ajuster emballage, NS, polymère et autres articles clés soumis à des déductions régulières; mettre à jour les réceptions et suivre tous les mouvements d’inventaire.') }
    ]
  },
  {
    id: 'coa', num: '13', role: 'saleslog', group: 'more',
    title: t('COA Shipments', 'Expéditions COA'),
    purpose: t('Certificate of Analysis shipment handling.', 'Traitement des expéditions avec certificat d’analyse.'),
    excel: ['Suivi des commandes', 'AGENDA EXPEDITION'],
    steps: [
      { title: t('Check the COA client list', 'Vérifier la liste des clients COA'),
        do: t('The COA-required client list is posted above the pigeonhole.', 'La liste des clients COA est affichée au-dessus du casier.'),
        flag: t('If you are not sure whether a client needs a COA, flag it.', 'Si vous n’êtes pas certain qu’un client ait besoin d’un COA, signalez-le.') },
      { title: t('Give the BOLs to Cyril', 'Remettre les BOL à Cyril'),
        do: t('Provide the corresponding BOLs to Cyril, the lab chemist.', 'Remettre les BOL correspondants à Cyril, le chimiste du laboratoire.') },
      { title: t('Adjust and mark inventory', 'Ajuster et marquer l’inventaire'),
        do: t('Complete the required inventory adjustments and mark them with a post-it note.', 'Effectuer les ajustements d’inventaire requis et les marquer avec une note autocollante.') },
      { title: t('File after the green sticker', 'Classer après l’autocollant vert'),
        do: t('When Cyril returns the documents with a green sticker, staple the invoice to the BOL and file it.', 'Lorsque Cyril retourne les documents avec un autocollant vert, agrafer la facture au BOL et classer le tout.'),
        verify: [t('Green sticker received', 'Autocollant vert reçu'), t('Invoice stapled to the BOL', 'Facture agrafée au BOL'), t('Filed', 'Classé')] }
    ]
  },
  {
    id: 'supplier', num: '14', role: 'saleslog', group: 'more',
    title: t('Supplier Orders', 'Commandes fournisseurs'),
    purpose: t('AC Polymers and the weekly supplier-order process.', 'AC Polymers et processus hebdomadaire des commandes fournisseurs.'),
    excel: ['Suivi des commandes', 'PO to Suppliers'],
    steps: [
      { title: t('Receive the AC Polymers request', 'Recevoir la demande AC Polymers'),
        do: t('Tiffany Page (tpage@ac-polymers.com) usually sends a Polymer PO request on Fridays.', 'Tiffany Page (tpage@ac-polymers.com) envoie généralement une demande de BC polymère le vendredi.'),
        excel: ['Suivi des commandes', 'AC POLYMERS'] },
      { title: t('Create four POs', 'Créer quatre BC'),
        verify: [t('2 POs for the polymer purchase', '2 BC pour l’achat de polymère'), t('2 POs for transport', '2 BC pour le transport')],
        link: ['po', t('How to create a PO in Sage (15)', 'Comment créer un BC dans Sage (15)')],
        shot: t('Screenshot to be added: an AC Polymers polymer PO in Sage.', 'Capture à ajouter : un BC polymère AC Polymers dans Sage.') },
      { title: t('Send the copies', 'Envoyer les copies'),
        do: t('Send 1 copy of each PO to Tiffany Page.', 'Envoyer 1 copie de chaque BC à Tiffany Page.'),
        verify: [t('1 copy of each PO sent to Tiffany Page', '1 copie de chaque BC envoyée à Tiffany Page')] },
      { title: t('Weekly Accounting submission', 'Remise hebdomadaire à la comptabilité'),
        do: t('Every Monday, gather all sales invoices and supplier POs and submit the complete documentation to Accounting (Jess).', 'Chaque lundi, rassembler toutes les factures de vente et BC fournisseurs et remettre les documents complets à la comptabilité (Jess).'),
        verify: [t('All sales invoices gathered', 'Toutes les factures de vente rassemblées'), t('All supplier POs gathered', 'Tous les BC fournisseurs rassemblés'), t('Submitted to Accounting (Jess)', 'Remis à la comptabilité (Jess)')] }
    ]
  },
  {
    id: 'po', num: '15', role: 'saleslog', group: 'more',
    title: t('Creating Purchase Orders', 'Création des bons de commande'),
    purpose: t('Create supplier POs accurately and on time in Sage.', 'Créer les BC fournisseurs avec exactitude et à temps dans Sage.'),
    excel: ['Suivi des commandes', 'PO to Suppliers'],
    steps: [
      { title: t('Open Sage → Suppliers', 'Ouvrir Sage → Fournisseurs'),
        do: t('Navigate to Suppliers.', 'Naviguer vers Fournisseurs.'),
        shot: t('Screenshot to be added: Sage → Suppliers & Purchases.', 'Capture à ajouter : Sage → Fournisseurs et achats.') },
      { title: t('Create the Purchase Order', 'Créer le bon de commande'),
        do: t('Select the supplier and click Create Purchase Order.', 'Sélectionner le fournisseur et cliquer sur Create Purchase Order.'),
        excel: ['Suivi des commandes', 'PO to Suppliers'] },
      { title: t('Enter the details', 'Entrer les détails'),
        verify: [t('Supplier', 'Fournisseur'), t('Items / quantities', 'Articles / quantités'), t('Unit pricing', 'Prix unitaires'), t('Delivery date / location', 'Date / lieu de livraison'), t('Reference PO number, if applicable', 'Numéro de BC de référence, s’il y a lieu')],
        flag: t('If a price or quantity is not confirmed, flag it before saving.', 'Si un prix ou une quantité n’est pas confirmé, signalez-le avant d’enregistrer.'),
        img: [['sage-purchase-order', t('Sage Purchase Order window — supplier, item, quantity, price and dates (example: a transport PO).', 'Fenêtre Bon de commande de Sage — fournisseur, article, quantité, prix et dates (exemple : un BC transport).')]] },
      { title: t('Review, save and print', 'Vérifier, enregistrer et imprimer'),
        do: t('Review for accuracy, save the PO and print it.', 'Vérifier l’exactitude, enregistrer le BC et l’imprimer.'),
        verify: [t('Reviewed for accuracy', 'Exactitude vérifiée'), t('Saved', 'Enregistré'), t('Printed', 'Imprimé')] },
      { title: t('Attach the supplier PO number to invoices', 'Joindre le numéro de BC fournisseur aux factures'),
        do: t('Attach the supplier PO number to the related sales invoices and follow up with Accounting if required.', 'Joindre le numéro de BC fournisseur aux factures de vente liées et faire un suivi avec la comptabilité au besoin.') }
    ]
  },
  {
    id: 'followup', num: '16', role: 'saleslog', group: 'more',
    title: t('Email, Dispatch & ETA Follow-up', 'Courriels, répartition et suivi ETA'),
    purpose: t('Process the transaction, file the Transport PO, send the package to the carrier and monitor ETA changes.', 'Traiter la transaction, classer le BC transport, envoyer le dossier au transporteur et suivre les changements d’ETA.'),
    excel: ['Suivi des commandes', 'AGENDA EXPEDITION'],
    steps: [
      { title: t('Process the Sage transaction', 'Traiter la transaction Sage'),
        do: [
          t('Once all is good, print and say yes to process the transaction anyway.', 'Lorsque tout est correct, imprimer et répondre oui pour traiter la transaction.'),
          t('Click Process (bottom right).', 'Cliquer sur Process (en bas à droite).'),
          t('Clean Sage data such as pricing and item-number accounts.', 'Nettoyer les données Sage, notamment les prix et les comptes des numéros d’articles.')
        ] },
      { title: t('Confirm processing', 'Confirmer le traitement'),
        do: t('After clicking Process, click Yes to continue.', 'Après Process, cliquer sur Oui pour continuer.') },
      { title: t('File the Transport PO PDF', 'Classer le PDF du BC transport'),
        do: t('Drag the PDF to the “Transport PO’s” folder and change the title to the transporter name.', 'Déplacer le PDF vers le dossier « Transport PO’s » et remplacer le titre par le nom du transporteur.'),
        verify: [t('PDF is in “Transport PO’s”', 'Le PDF est dans « Transport PO’s »'), t('Renamed with the transporter name', 'Renommé avec le nom du transporteur')],
        img: [
          ['transport-po-file', t('Before: the PDF as saved by Sage (purorder_16821).', 'Avant : le PDF tel qu’enregistré par Sage (purorder_16821).')],
          ['transport-po-renamed', t('After: renamed with the transporter name (Traffictech PO-16821).', 'Après : renommé avec le nom du transporteur (Traffictech PO-16821).')]
        ] },
      { title: t('Email the transporter / dispatch', 'Écrire au transporteur / répartiteur'),
        do: t('Find the existing conversation with the transporter / dispatch and attach the documents.', 'Trouver la conversation existante avec le transporteur / répartiteur et joindre les documents.'),
        verify: [t('Replied in the correct conversation', 'Réponse dans la bonne conversation'), t('Documents attached', 'Documents joints')],
        img: [['transporter-email', t('Reply to the carrier thread with the Transport PO, Deringer invoice and BOL attached.', 'Réponse dans le fil du transporteur avec le BC transport, la facture Deringer et le BOL joints.')]] },
      { title: t('Communicate the required ETA', 'Communiquer l’ETA requise'),
        do: t('Tell the transporter the ETA required by production and ask for updates if there is a truck breakdown, a previous-stop delay, etc.', 'Communiquer au transporteur l’ETA requise par la production et demander des mises à jour en cas de panne, de retard à l’arrêt précédent, etc.'),
        verify: [t('Required ETA sent to the transporter', 'ETA requise envoyée au transporteur'), t('Asked for updates on delays', 'Mises à jour demandées en cas de retard')] }
    ]
  },
  {
    id: 'recordkeeping', num: '17', role: 'saleslog', group: 'more',
    title: t('Record Keeping', 'Tenue des dossiers'),
    purpose: t('File the shipper and Accounting sets and maintain the trackers.', 'Classer les ensembles expéditeur et comptabilité et maintenir les tableaux de suivi.'),
    excel: ['Suivi des commandes', 'AGENDA EXPEDITION'],
    steps: [
      { title: t('Organize the hard copies', 'Organiser les copies papier'),
        do: t('Place the papers in order: one set for the shipper and the other for Accounting.', 'Placer les documents dans l’ordre : un ensemble pour l’expéditeur et l’autre pour la comptabilité.'),
        verify: [t('Shipper set', 'Ensemble expéditeur'), t('Accounting set', 'Ensemble comptabilité')] },
      { title: t('Update the record-keeping tracker', 'Mettre à jour le tableau de suivi'),
        do: t('Maintain the record-keeping files and trackers in Z:\\6- Suivis des Commandes.', 'Maintenir les fichiers et tableaux de suivi dans Z:\\6- Suivis des Commandes.'),
        excel: ['Suivi des commandes', 'AGENDA EXPEDITION'],
        img: [
          ['suivi-folder', t('Z:\\6- Suivis des Commandes — open SUIVI DES COMMANDES.', 'Z:\\6- Suivis des Commandes — ouvrir SUIVI DES COMMANDES.')],
          ['suivi-agenda', t('AGENDA EXPEDITION tab — date, destination, PO #, invoice #, transport and LTL/TL for each shipment.', 'Onglet AGENDA EXPEDITION — date, destination, no de BC, no de facture, transport et LTL/TL pour chaque expédition.')]
        ] }
    ]
  }
];

/* ───────────── SHIPPING & RECEIVING (Expédition & Réception) ─────────────
   Source: SOP-001 Rev. 01 (effective January 19, 2026), the Expédition / Réception checklists,
   the Chain of Command diagram, the Aldex Employee Handbook Visual, the Random Audit checklist,
   Implementation Plan 4.0 and the Operational Analysis & Training document (as integrated in hub V40). */
SOPS.push(
  {
    id: 'shiprxHub', num: '', role: 'expedition', group: 'start', kind: 'ref',
    title: t('Operations Handbook', 'Manuel opérationnel'),
    purpose: t('How every shipment moves through the dock, the core rules, and where to find each checklist.', 'Comment chaque expédition passe par le quai, les règles de base et où trouver chaque checklist.'),
    meta: t('Based on SOP-001 · Rev. 01 · January 19, 2026', 'Basé sur le SOP-001 · Rév. 01 · 19 janvier 2026'),
    blocks: [
      { type: 'flow', title: t('Shipping gates', 'Étapes d’expédition'),
        items: [
          [t('PO / Order', 'BC / Commande'), t('Customer order', 'Commande client')],
          [t('Product', 'Produit'), t('Product + quantity', 'Produit + quantité')],
          [t('LOT / COA', 'LOT / COA'), t('Traceability + quality', 'Traçabilité + qualité')],
          [t('Documents', 'Documents'), t('BOL + required invoice', 'BOL + facture requise')],
          [t('Dock', 'Quai'), t('Trailer + safety checks', 'Remorque + sécurité')],
          [t('Release', 'Libération'), t('Final validation', 'Validation finale')]
        ],
        caption: t('The shipment moves forward only when each gate has been validated.', 'L’expédition avance seulement lorsque chaque étape est validée.') },
      { type: 'cards', items: [
        { title: t('Two-person dock rule', 'Règle des deux personnes au quai'), text: t('The forklift operator and the shipping/receiving supervisor must be present before loading or unloading starts.', 'Le cariste et le superviseur expédition/réception doivent être présents avant tout début de chargement ou déchargement.') },
        { title: t('Document concordance', 'Concordance documentaire'), text: t('PO, product, quantities and delivery address must match the applicable BOL and commercial invoice.', 'Le BC, le produit, les quantités et l’adresse de livraison doivent correspondre au BOL et à la facture commerciale applicables.') },
        { title: t('LOT / COA control', 'Contrôle LOT / COA'), text: t('LOT and COA accuracy is a critical shipping control. Validate before loading.', 'L’exactitude des LOT et COA est un contrôle critique de l’expédition. Valider avant le chargement.') }
      ] },
      { type: 'rule', title: t('Core rule', 'Règle centrale'), text: t('If something does not match or cannot be verified, stop and flag it rather than guessing.', 'Si quelque chose ne concorde pas ou ne peut pas être vérifié, arrêtez-vous et signalez-le plutôt que de deviner.') },
      { type: 'links', title: t('Where to find each document', 'Où trouver chaque document'), items: [
        ['shiprxSOP', t('SOP – Expédition et Réception (SOP-001)', 'SOP – Expédition et Réception (SOP-001)')],
        ['shiprxCheck', t('Expédition Checklist', 'Checklist Expédition')],
        ['recvCheck', t('Réception Checklist', 'Checklist Réception')],
        ['chainCommand', t('Chain of Commands', 'Chaîne de commandement')],
        ['visualHandbook', t('Aldex Employee Handbook Visual', 'Handbook visuel de l’employé Aldex')],
        ['randomAudit', t('Random Audit Checklist', 'Checklist d’audit aléatoire')],
        ['operationalTraining', t('Operational Analysis & Training', 'Analyse opérationnelle et formation')],
        ['implementationPlan', t('Implementation Plan 4.0', 'Plan d’implantation 4.0')]
      ] }
    ]
  },
  {
    id: 'shiprxSOP', num: '01', role: 'expedition', group: 'dock',
    title: t('Shipping & Receiving SOP', 'SOP Expédition & Réception'),
    purpose: t('SOP-001 · Revision 01 · Effective January 19, 2026. The controlled field procedure for every loading and unloading.', 'SOP-001 · Révision 01 · En vigueur le 19 janvier 2026. La procédure terrain contrôlée pour chaque chargement et déchargement.'),
    steps: [
      { title: t('Confirm dock presence', 'Confirmer la présence au quai'),
        do: t('Both people must be at the dock before loading or unloading starts.', 'Les deux personnes doivent être au quai avant tout début de chargement ou déchargement.'),
        verify: [
          [t('Forklift operator', 'Cariste'), t('Mandatory at the dock.', 'Présence obligatoire au quai.')],
          [t('Shipping / receiving supervisor', 'Superviseur expédition / réception'), t('Assistant Director General or designated person.', 'Directeur adjoint ou personne désignée.')]
        ],
        flag: t('If either person is missing, do not start. Escalate using the Chain of Command.', 'Si l’une des deux personnes est absente, ne pas commencer. Escalader selon la chaîne de commandement.'),
        link: ['chainCommand', t('Chain of Command', 'Chaîne de commandement')] },
      { title: t('Inspect the dock', 'Inspecter le quai'),
        verify: [
          [t('Clean and clear', 'Propre et dégagé'), t('No debris or obstacles.', 'Aucun débris ni obstacle.')],
          [t('Dry floor', 'Sol sec'), t('No oil, water or slippery residue.', 'Aucune huile, eau ou résidu glissant.')],
          [t('Equipment ready', 'Équipement prêt'), t('Forklift, pallets, straps and PPE available.', 'Chariot, palettes, sangles et EPI disponibles.')]
        ] },
      { title: t('Verify the trailer', 'Vérifier la remorque'),
        verify: [
          [t('Clean / no odor', 'Propre / sans odeur'), t('General condition suitable for transport.', 'État général apte au transport.')],
          [t('No visible damage', 'Aucun dommage visible'), t('Check floor, walls and ceiling.', 'Vérifier plancher, murs et plafond.')],
          [t('Dry and suitable', 'Sèche et appropriée'), t('No moisture; correct trailer type for the goods.', 'Sans humidité; bon type de remorque pour la marchandise.')]
        ] },
      { title: t('Validate the documents', 'Valider les documents'),
        verify: [
          [t('Aldex BOL', 'BOL Aldex'), t('Required before loading.', 'Requis avant le chargement.')],
          [t('Picking Slip / Sales Order', 'Picking Slip / commande client'), t('Must match the shipment.', 'Doit correspondre à l’expédition.')],
          [t('Commercial invoice — USA', 'Facture commerciale — USA'), t('Required for U.S. shipments.', 'Obligatoire pour les expéditions aux États-Unis.')],
          [t('PO / product / quantity / address', 'BC / produit / quantité / adresse'), t('All must agree across the applicable documents.', 'Tous doivent concorder dans les documents applicables.')]
        ],
        tableAfter: true,
        table: { head: [t('Situation', 'Situation'), t('How to load', 'Comment charger')], rows: [
          [t('Multiple POs on one BOL', 'Plusieurs BC sur un même BOL'), t('Use when the delivery address and destination are the same. Validate every Picking Slip against the BOL and, for U.S. shipments, the commercial invoice.', 'À utiliser lorsque l’adresse et la destination sont les mêmes. Valider chaque Picking Slip avec le BOL et, pour les États-Unis, la facture commerciale.')],
          [t('Separate BOLs / multi-drop', 'BOL séparés / multi-drop'), t('Load the last-stop freight first and the first-stop freight last. Example: Trenton is Stop 1 and Cape Coral is Stop 2.', 'Charger d’abord la marchandise du dernier arrêt et en dernier celle du premier arrêt. Exemple : Trenton est l’arrêt 1 et Cape Coral l’arrêt 2.')]
        ] },
        flag: t('If any document does not match, stop and flag it before loading.', 'Si un document ne concorde pas, arrêtez-vous et signalez-le avant le chargement.') },
      { title: t('Final verification before departure', 'Vérification finale avant départ'),
        verify: [
          [t('Stable and secured', 'Stable et sécurisée'), t('Cargo and pallets correctly positioned.', 'Marchandise et palettes correctement positionnées.')],
          [t('Packing Slip on last pallet', 'Packing Slip sur la dernière palette'), t('Envelope contains signed BOL(s) and LOT sheet.', 'L’enveloppe contient le(s) BOL signé(s) et la fiche LOT.')],
          [t('Seal control', 'Contrôle du scellé'), t('TL: seal required. LTL: only when required by customer/carrier.', 'TL : scellé obligatoire. LTL : seulement si requis par le client/transporteur.')],
          [t('Driver safety reminder', 'Rappel sécurité au chauffeur'), t('Verify lights, brakes and other relevant safety items.', 'Vérifier lumières, freins et autres éléments de sécurité pertinents.')]
        ],
        flag: t('Directive: no loading or unloading may continue without complete validation. Deviations are prohibited without written General Manager approval.', 'Directive : aucun chargement ou déchargement ne peut se poursuivre sans validation complète. Les dérogations sont interdites sans approbation écrite du Directeur Général.') }
    ]
  },
  {
    id: 'shiprxCheck', num: '02', role: 'expedition', group: 'dock',
    title: t('Shipping Checklist', 'Checklist Expédition'),
    purpose: t('Field checklist for every outgoing truck, from the Aldex shipping checklist.', 'Checklist terrain pour chaque camion sortant, tirée de la checklist d’expédition Aldex.'),
    steps: [
      { title: t('Safety & dock preparation', 'Sécurité et préparation du quai'),
        verify: [
          [t('Clean, clear and safe', 'Propre, dégagé et sécuritaire'), t('Work area ready before loading.', 'Zone prête avant le chargement.')],
          [t('PPE', 'EPI'), t('Helmet, gloves, boots and safety glasses.', 'Casque, gants, bottes et lunettes.')],
          [t('Equipment verified', 'Matériel vérifié'), t('Forklift, straps, wheel chocks and pallets.', 'Chariot, sangles, cales et palettes.')]
        ] },
      { title: t('Mandatory presence', 'Présence obligatoire'),
        verify: [
          [t('Forklift operator', 'Cariste'), t('Present at the dock.', 'Présent au quai.')],
          [t('Floor lead', 'Chef de plancher'), t('Present / assigned.', 'Présent / désigné.')],
          [t('Assistant Director or S&L Coordinator', 'Directeur adjoint ou coordonnateur V&L'), t('Available according to the checklist requirement.', 'Disponible selon l’exigence de la checklist.')]
        ] },
      { title: t('Documents', 'Documents'),
        verify: [
          [t('Aldex BOL validated', 'BOL Aldex validé'), t('Shipment document checked.', 'Document d’expédition vérifié.')],
          [t('Picking Slip / Sales Order', 'Picking Slip / commande client'), t('Matches the shipment.', 'Correspond à l’expédition.')],
          [t('Commercial invoice — USA', 'Facture commerciale — USA'), t('Present for U.S. shipments.', 'Présente pour les expéditions aux États-Unis.')],
          [t('PO / product / quantity / address', 'BC / produit / quantité / adresse'), t('All match.', 'Tout concorde.')]
        ] },
      { title: t('Final departure check', 'Vérification finale avant départ'),
        verify: [
          [t('Cargo stable and secured', 'Marchandise stable et sécurisée'), t('No movement or obvious issue.', 'Aucun mouvement ni problème évident.')],
          [t('Packing Slip on last pallet', 'Packing Slip sur la dernière palette'), t('Envelope attached / placed correctly.', 'Enveloppe placée correctement.')],
          [t('Signed BOL + LOT number', 'BOL signé + numéro LOT'), t('Traceability included.', 'Traçabilité incluse.')],
          [t('Seal + driver safety', 'Scellé + sécurité chauffeur'), t('TL seal; lights / brakes reminder.', 'Scellé TL; rappel lumières / freins.')]
        ],
        flag: t('Release gate: only release the truck after all required checks are complete.', 'Point de libération : libérer le camion seulement lorsque toutes les vérifications requises sont complétées.') }
    ]
  },
  {
    id: 'recvCheck', num: '03', role: 'expedition', group: 'dock',
    title: t('Receiving Checklist', 'Checklist Réception'),
    purpose: t('Use this sequence when receiving goods or containers: prepare, open, unload, validate.', 'Utiliser cette séquence pour la réception des marchandises ou conteneurs : préparer, ouvrir, décharger, valider.'),
    steps: [
      { title: t('Safety & preparation', 'Sécurité et préparation'),
        verify: [
          [t('Clean and clear dock', 'Quai propre et dégagé'), t('Prepare a safe receiving area.', 'Préparer une zone de réception sécuritaire.')],
          [t('PPE', 'EPI'), t('Required protective equipment worn.', 'Équipement de protection porté.')],
          [t('Required personnel present', 'Personnel requis présent'), t('Forklift operator and supervisor.', 'Cariste et superviseur.')]
        ] },
      { title: t('Before opening the trailer', 'Avant d’ouvrir la remorque'),
        verify: [
          [t('Documents received', 'Documents reçus'), t('Have receiving documents available.', 'Avoir les documents disponibles.')],
          [t('Seal intact if applicable', 'Scellé intact si applicable'), t('Confirm before breaking the seal.', 'Confirmer avant de briser le scellé.')],
          [t('Confirm cargo', 'Confirmer la marchandise'), t('Verify what is expected before opening.', 'Vérifier la marchandise attendue avant ouverture.')]
        ] },
      { title: t('Unloading', 'Déchargement'),
        verify: [
          [t('Trailer safe', 'Remorque sécuritaire'), t('Good condition before unloading.', 'Bon état avant déchargement.')],
          [t('Orderly unloading', 'Déchargement ordonné'), t('Unload safely and systematically.', 'Décharger de façon sécuritaire et ordonnée.')],
          [t('No visible damage', 'Aucun dommage visible'), t('Document any issue immediately.', 'Documenter immédiatement tout problème.')]
        ] },
      { title: t('Final validation', 'Validation finale'),
        verify: [
          [t('Quantities match', 'Quantités conformes'), t('Compare physical quantity to documents.', 'Comparer la quantité physique aux documents.')],
          [t('Product + LOT match', 'Produit + LOT conformes'), t('Traceability must be correct.', 'La traçabilité doit être correcte.')],
          [t('Anomalies documented', 'Anomalies documentées'), t('Report immediately.', 'Signaler immédiatement.')],
          [t('Correct location', 'Bon emplacement'), t('Place goods in the designated location.', 'Placer la marchandise à l’emplacement désigné.')]
        ],
        flag: t('If quantities, product or LOT do not match the documents, stop and flag it.', 'Si les quantités, le produit ou le LOT ne concordent pas avec les documents, arrêtez-vous et signalez-le.') }
    ]
  },
  {
    id: 'chainCommand', num: '04', role: 'expedition', group: 'docs', kind: 'ref',
    title: t('Chain of Command', 'Chaîne de commandement'),
    purpose: t('Who to go to at the dock, in order. The General Manager holds final authority.', 'À qui s’adresser au quai, dans l’ordre. Le Directeur Général détient l’autorité finale.'),
    blocks: [
      { type: 'chain', items: [
        [t('Cariste', 'Cariste'), t('Forklift operator', 'Cariste'), t('Initial loading / unloading validation', 'Validation initiale du chargement / déchargement')],
        [t('Sébastien — Chef de plancher', 'Sébastien — Chef de plancher'), t('Floor lead', 'Chef de plancher'), t('Consult when a question or doubt arises', 'Consulter en cas de question ou de doute')],
        [t('Assistant Directeur Général', 'Assistant Directeur Général'), t('Assistant Director General', 'Directeur général adjoint'), t('Operational validation when required', 'Validation opérationnelle si requise')],
        [t('Coordonnateur Ventes & Logistique', 'Coordonnateur Ventes & Logistique'), t('Sales & Logistics Coordinator', 'Coordonnateur ventes et logistique'), t('Validation and escalation point', 'Point de validation et d’escalade')],
        [t('Directeur Général', 'Directeur Général'), t('General Manager', 'Directeur Général'), t('Final decision authority', 'Autorité décisionnelle finale')]
      ] },
      { type: 'rule', title: t('Mandatory rule', 'Règle obligatoire'), text: t('No loading or unloading may continue without complete validation. Any deviation requires written approval from the General Manager.', 'Aucun chargement ou déchargement ne peut se poursuivre sans validation complète. Toute dérogation exige une approbation écrite du Directeur Général.') }
    ]
  },
  {
    id: 'visualHandbook', num: '05', role: 'expedition', group: 'docs', kind: 'ref',
    title: t('Visual Handbook', 'Handbook visuel'),
    purpose: t('Key points from the Aldex Employee Handbook: standardized procedures, traceability, LOT / COA accuracy, receiving controls, communication and escalation.', 'Points clés du handbook de l’employé Aldex : procédures standardisées, traçabilité, exactitude LOT / COA, réception, communication et escalade.'),
    blocks: [
      { type: 'flow', title: t('Standard shipping sequence', 'Séquence d’expédition standard'), items: [
        [t('PO', 'BC'), t('Customer order', 'Commande client')],
        [t('LOT', 'LOT'), t('Traceability', 'Traçabilité')],
        [t('COA', 'COA'), t('Quality', 'Qualité')],
        [t('BOL', 'BOL'), t('Shipment document', 'Document d’expédition')],
        [t('LOAD', 'CHARGER'), t('Final release', 'Libération finale')]
      ] },
      { type: 'cards', items: [
        { title: t('Why the handbook exists', 'Pourquoi le handbook existe'), list: [t('Reduce errors', 'Réduire les erreurs'), t('Improve traceability', 'Améliorer la traçabilité'), t('Reduce operational stress', 'Réduire le stress opérationnel'), t('Facilitate training', 'Faciliter la formation'), t('Create a uniform method', 'Créer une méthode uniforme')] },
        { title: t('Frequent errors to avoid', 'Erreurs fréquentes à éviter'), warn: true, list: [t('Wrong LOT', 'Mauvais LOT'), t('Wrong COA', 'Mauvais COA'), t('Quantity errors', 'Erreurs de quantités'), t('Missing documents', 'Oubli de documents'), t('USA / Canada error', 'Erreur USA / Canada'), t('Wrong carrier', 'Mauvais transporteur')] },
        { title: t('When in doubt', 'En cas de doute'), text: t('Stop and communicate immediately for missing product, incorrect LOT, document error, damaged product or carrier problem.', 'Arrêter et communiquer immédiatement en cas de produit manquant, LOT incorrect, erreur documentaire, produit endommagé ou problème transporteur.') }
      ] },
      { type: 'note', text: t('Aldex standard: Precision · Organization · Communication · Safety · Teamwork · Respect for procedures.', 'Standard Aldex : Précision · Organisation · Communication · Sécurité · Travail d’équipe · Respect des procédures.') }
    ]
  },
  {
    id: 'randomAudit', num: '06', role: 'expedition', group: 'audit',
    title: t('Random Audit Checklist', 'Checklist d’audit aléatoire'),
    purpose: t('Quick control for spot audits at the dock, from the three-page audit checklist.', 'Contrôle rapide pour les audits ponctuels au quai, tiré de la checklist d’audit de trois pages.'),
    steps: [
      { title: t('Operational compliance', 'Conformité opérationnelle'),
        verify: [
          [t('Required dock resources present', 'Ressources requises au quai'), t('Verify required personnel are present.', 'Vérifier la présence du personnel requis.')],
          [t('SOP followed', 'SOP respecté'), t('Check the shipping / receiving procedure.', 'Vérifier la procédure expédition / réception.')],
          [t('PPE used', 'EPI utilisés'), t('Confirm appropriate PPE.', 'Confirmer les EPI appropriés.')]
        ], link: ['shiprxSOP', t('Shipping & Receiving SOP (01)', 'SOP Expédition & Réception (01)')] },
      { title: t('Documents & traceability', 'Documents et traçabilité'),
        verify: [
          [t('Complete, legible, signed documents', 'Documents complets, lisibles, signés'), t('Check document quality.', 'Vérifier la qualité documentaire.')],
          [t('Packing Slip present', 'Packing Slip présent'), t('On the last pallet / envelope.', 'Sur la dernière palette / enveloppe.')],
          [t('LOT traceability', 'Traçabilité LOT'), t('LOT numbers can be traced.', 'Les numéros LOT sont traçables.')]
        ] },
      { title: t('Safety & housekeeping', 'Sécurité et propreté'),
        verify: [
          [t('Dock clean and clear', 'Quai propre et dégagé'), t('No immediate hazards.', 'Aucun risque immédiat.')],
          [t('Equipment in good condition', 'Équipement en bon état'), t('Verify equipment condition.', 'Vérifier l’état des équipements.')]
        ] },
      { title: t('Corrective action', 'Action corrective'),
        verify: [
          [t('Non-conformities documented', 'Non-conformités documentées'), t('Record what was observed.', 'Consigner les observations.')],
          [t('Corrective action identified', 'Action corrective identifiée'), t('Define what must change.', 'Définir ce qui doit changer.')],
          [t('Owner + follow-up date', 'Responsable + date de suivi'), t('Assign accountability.', 'Attribuer la responsabilité.')]
        ] }
    ]
  },
  {
    id: 'operationalTraining', num: '07', role: 'expedition', group: 'audit', kind: 'ref',
    title: t('Operational Analysis & Training', 'Analyse opérationnelle et formation'),
    purpose: t('Why shipping and receiving are being standardized, the risks identified, and the training objectives.', 'Pourquoi l’expédition et la réception sont standardisées, les risques identifiés et les objectifs de formation.'),
    blocks: [
      { type: 'cards', items: [
        { title: t('Current operating complexity', 'Complexité actuelle'), list: [t('15–20 shipments per week', '15–20 expéditions par semaine'), t('5–6 container receptions in some weeks', '5–6 réceptions de conteneurs certaines semaines'), t('BOL, PO, COA and customs documentation', 'Documentation BOL, BC, COA et douanes'), t('Carrier, customer and production coordination', 'Coordination transporteurs, clients et production')] },
        { title: t('Risks identified', 'Risques identifiés'), warn: true, list: [t('Wrong LOT / incorrect COA', 'Mauvais LOT / COA incorrect'), t('Customer non-conformities', 'Non-conformités clients'), t('Delays and hidden costs', 'Retards et coûts cachés'), t('Lack of standardized validation', 'Manque de validation standardisée'), t('Dependence on verbal knowledge', 'Dépendance aux connaissances verbales')] },
        { title: t('Training objective', 'Objectif de formation'), list: [t('Understand shipping / receiving procedures', 'Comprendre les procédures d’expédition / réception'), t('Reduce errors', 'Réduire les erreurs'), t('Ensure traceability', 'Assurer la traçabilité'), t('Respect quality standards', 'Respecter les standards qualité')] }
      ] },
      { type: 'note', title: t('Standardization philosophy', 'Philosophie de standardisation'), text: t('The objective is not to add unnecessary work, but to turn complex operations into simple, repeatable and safe processes: less guesswork, fewer errors and less dependence on individual knowledge, with easier training and smoother operations.', 'L’objectif n’est pas d’ajouter du travail inutile, mais de transformer des opérations complexes en processus simples, répétables et sécuritaires : moins de suppositions, moins d’erreurs et moins de dépendance aux connaissances individuelles, avec une formation facilitée et des opérations plus fluides.') }
    ]
  },
  {
    id: 'implementationPlan', num: '08', role: 'expedition', group: 'audit', kind: 'ref',
    title: t('Implementation Plan — 0 / 30 / 60 / 90', 'Plan d’implantation — 0 / 30 / 60 / 90'),
    purpose: t('The 90-day roadmap from Implementation Plan 4.0 and the operational analysis.', 'La feuille de route de 90 jours tirée du Plan d’implantation 4.0 et de l’analyse opérationnelle.'),
    blocks: [
      { type: 'phases', items: [
        [t('Phase 1 · 0–30 days', 'Phase 1 · 0–30 jours'), t('Immediate setup', 'Mise en place immédiate'), [t('Designate a hybrid shipping / receiving floor supervisor.', 'Désigner un superviseur hybride expédition / réception.'), t('Train on Sales Order / BOL / commercial invoice concordance.', 'Former sur la concordance commande / BOL / facture commerciale.'), t('Train on multiple PO / multi-drop, TL / LTL and LOT controls.', 'Former sur multi-PO / multi-drop, TL / LTL et contrôles LOT.'), t('Communicate escalation to Tim when there is doubt or non-conformity.', 'Communiquer l’escalade vers Tim en cas de doute ou de non-conformité.')]],
        [t('Phase 2 · 30–60 days', 'Phase 2 · 30–60 jours'), t('Structure the operation', 'Structurer les opérations'), [t('Officially appoint the hybrid supervisor.', 'Nommer officiellement le superviseur hybride.'), t('Standardize trailer validation, LOT sheet and seal register.', 'Standardiser la validation remorque, la fiche LOT et le registre des scellés.'), t('Deploy SOPs and field checklists.', 'Déployer les SOP et checklists terrain.'), t('Formalize dock coverage windows.', 'Formaliser les plages de couverture du quai.')]],
        [t('Phase 3 · 60–90 days', 'Phase 3 · 60–90 jours'), t('Stabilize & build autonomy', 'Stabiliser et développer l’autonomie'), [t('Reduce unplanned interventions.', 'Réduire les interventions non planifiées.'), t('Enable autonomous daily floor operations.', 'Permettre l’autonomie des opérations quotidiennes.'), t('Maintain random audits and targeted logistics interventions.', 'Maintenir les audits aléatoires et interventions ciblées.'), t('Adjust procedures based on field results.', 'Ajuster les procédures selon les résultats terrain.')]]
      ] },
      { type: 'rule', kind: 'ok', title: t('Expected end state', 'Résultat final attendu'), text: t('The coordinator acts as a validation and escalation point without executing daily floor work; risks are identified, controlled and documented; the General Manager retains final decision authority.', 'Le coordonnateur agit comme point de validation et d’escalade sans exécuter les opérations quotidiennes du plancher; les risques sont identifiés, contrôlés et documentés; le Directeur Général conserve l’autorité décisionnelle finale.') }
    ]
  }
);
