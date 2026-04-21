import { formatarRotuloMedicacaoRapida } from '../utils/medicacao.js'

/**
 * Lista base de medicamentos para autocomplete.
 * ~300 medicamentos cobrindo as principais especialidades hospitalares brasileiras.
 * Nomes em minúsculo, conforme escrita em anotações de enfermagem.
 *
 * Categorias:
 *   Analgésicos / Antipiréticos
 *   Anti-inflamatórios / Corticoides
 *   Antibióticos
 *   Antifúngicos / Antivirais
 *   Anticoagulantes / Antiagregantes / Trombolíticos
 *   Cardiovasculares – Anti-hipertensivos
 *   Cardiovasculares – Antiarrítmicos
 *   Cardiovasculares – Vasoativos (UTI)
 *   Diuréticos
 *   Gastrintestinais / Antieméticos
 *   Neurológicos / Anticonvulsivantes
 *   Psiquiátricos / Sedativos
 *   Sedoanalgesia UTI / Bloqueadores neuromusculares
 *   Respiratórios / Broncodilatadores
 *   Endocrinológicos – Insulinas
 *   Endocrinológicos – Hipoglicemiantes orais / Outros
 *   Imunossupressores / Reumatológicos / Biológicos
 *   Hematológicos / Fatores de crescimento
 *   Nefrológicos
 *   Vitaminas / Minerais / Eletrólitos
 *   Miscelânea / Outros
 */

export const medicamentosBase = [

  // ── Analgésicos / Antipiréticos ─────────────────────────────────────────
  'dipirona',
  'paracetamol',
  'tramadol',
  'morfina',
  'fentanil',
  'oxicodona',
  'hidromorfona',
  'metadona',
  'buprenorfina',
  'nalbufina',
  'codeína',
  'cetorolaco',
  'cetoprofeno',
  'tapentadol',

  // ── Anti-inflamatórios / Corticoides ────────────────────────────────────
  'ibuprofeno',
  'naproxeno',
  'diclofenaco',
  'piroxicam',
  'meloxicam',
  'celecoxibe',
  'etoricoxibe',
  'indometacina',
  'nimesulida',
  'dexametasona',
  'prednisona',
  'prednisolona',
  'metilprednisolona',
  'betametasona',
  'hidrocortisona',
  'triancinolona',
  'deflazacorte',

  // ── Antibióticos ─────────────────────────────────────────────────────────
  'amoxicilina',
  'amoxicilina + clavulanato',
  'ampicilina',
  'ampicilina + sulbactam',
  'piperacilina + tazobactam',
  'oxacilina',
  'cefazolina',
  'cefalexina',
  'cefuroxima',
  'cefotaxima',
  'ceftriaxona',
  'ceftazidima',
  'cefepima',
  'cefiderocol',
  'meropeném',
  'imipeném + cilastatina',
  'ertapeném',
  'doripeném',
  'aztreonam',
  'vancomicina',
  'teicoplanina',
  'linezolida',
  'daptomicina',
  'tigeciclina',
  'colistina',
  'polimixina B',
  'ciprofloxacino',
  'levofloxacino',
  'moxifloxacino',
  'norfloxacino',
  'metronidazol',
  'clindamicina',
  'azitromicina',
  'claritromicina',
  'eritromicina',
  'doxiciclina',
  'minociclina',
  'sulfametoxazol + trimetoprima',
  'gentamicina',
  'amicacina',
  'tobramicina',
  'rifampicina',
  'isoniazida',
  'pirazinamida',
  'etambutol',
  'estreptomicina',
  'fosfomicina',
  'nitrofurantoína',

  // ── Antifúngicos ─────────────────────────────────────────────────────────
  'fluconazol',
  'voriconazol',
  'itraconazol',
  'posaconazol',
  'isavuconazol',
  'anfotericina B',
  'anfotericina B lipossomal',
  'caspofungina',
  'micafungina',
  'anidulafungina',
  'nistatina',
  'terbinafina',

  // ── Antivirais ───────────────────────────────────────────────────────────
  'aciclovir',
  'valaciclovir',
  'ganciclovir',
  'valganciclovir',
  'foscarnet',
  'oseltamivir',
  'remdesivir',
  'tenofovir',
  'lamivudina',
  'zidovudina',
  'lopinavir + ritonavir',

  // ── Anticoagulantes / Antiagregantes / Trombolíticos ─────────────────────
  'heparina',
  'enoxaparina',
  'fondaparinux',
  'warfarina',
  'rivaroxabana',
  'apixabana',
  'dabigatrana',
  'edoxabana',
  'ácido acetilsalicílico',
  'clopidogrel',
  'ticagrelor',
  'prasugrel',
  'tirofibana',
  'eptifibatida',
  'alteplase',
  'tenecteplase',
  'estreptoquinase',
  'protamina',
  'fitomenadiona',
  'vitamina K',
  'ácido tranexâmico',
  'etamsílato',

  // ── Cardiovasculares – Anti-hipertensivos ────────────────────────────────
  'captopril',
  'enalapril',
  'lisinopril',
  'ramipril',
  'perindopril',
  'losartana',
  'valsartana',
  'olmesartana',
  'irbesartana',
  'candesartana',
  'telmisartana',
  'anlodipino',
  'nifedipino',
  'lercanidipino',
  'verapamil',
  'diltiazém',
  'hidralazina',
  'nitroprussiato de sódio',
  'nitroglicerina',
  'isossorbida',
  'metoprolol',
  'atenolol',
  'carvedilol',
  'propranolol',
  'bisoprolol',
  'nebivolol',
  'labetalol',
  'clonidina',
  'doxazosina',
  'espironolactona',
  'eplerenona',
  'furosemida',
  'hidroclorotiazida',
  'indapamida',
  'clortalidona',
  'sacubitril + valsartana',
  'ivabradina',
  'ranolazina',

  // ── Cardiovasculares – Antiarrítmicos ────────────────────────────────────
  'amiodarona',
  'dronedarona',
  'lidocaína',
  'adenosina',
  'digoxina',
  'sotalol',
  'flecainida',
  'propafenona',
  'atropina',

  // ── Cardiovasculares – Vasoativos (UTI) ──────────────────────────────────
  'noradrenalina',
  'adrenalina',
  'dobutamina',
  'dopamina',
  'vasopressina',
  'terlipressina',
  'milrinona',
  'levosimendan',
  'fenilefrina',
  'efedrina',
  'nitroprussiato de sódio',

  // ── Diuréticos ───────────────────────────────────────────────────────────
  'manitol',
  'acetazolamida',
  'torasemida',
  'bumetanida',

  // ── Gastrintestinais / Antieméticos ──────────────────────────────────────
  'omeprazol',
  'pantoprazol',
  'lansoprazol',
  'esomeprazol',
  'rabeprazol',
  'ranitidina',
  'famotidina',
  'sucralfato',
  'hidróxido de alumínio',
  'metoclopramida',
  'domperidona',
  'ondansetrona',
  'granisetrona',
  'bromoprida',
  'escopolamina',
  'hioscina',
  'loperamida',
  'mesalazina',
  'sulfassalazina',
  'infliximabe',
  'vedolizumabe',
  'lactulose',
  'polietilenoglicol',
  'bisacodil',
  'óleo mineral',
  'senna',
  'neostigmina',
  'ácido ursodesoxicólico',
  'colestiramina',
  'octreotida',

  // ── Neurológicos / Anticonvulsivantes ────────────────────────────────────
  'fenitoína',
  'fenobarbital',
  'ácido valproico',
  'carbamazepina',
  'oxcarbazepina',
  'lamotrigina',
  'levetiracetam',
  'topiramato',
  'gabapentina',
  'pregabalina',
  'lacosamida',
  'perampanel',
  'clonazepam',
  'diazepam',
  'midazolam',
  'lorazepam',
  'levodopa + carbidopa',
  'pramipexol',
  'rotigotina',
  'amantadina',
  'biperideno',
  'rivastigmina',
  'donepezila',
  'galantamina',
  'memantina',
  'riluzol',
  'baclofeno',
  'tizanidina',

  // ── Psiquiátricos / Sedativos ────────────────────────────────────────────
  'haloperidol',
  'risperidona',
  'olanzapina',
  'quetiapina',
  'clozapina',
  'ziprasidona',
  'aripiprazol',
  'clorpromazina',
  'levomepromazina',
  'fluoxetina',
  'sertralina',
  'paroxetina',
  'escitalopram',
  'citalopram',
  'fluvoxamina',
  'venlafaxina',
  'duloxetina',
  'desvenlafaxina',
  'amitriptilina',
  'nortriptilina',
  'imipramina',
  'bupropiona',
  'mirtazapina',
  'trazodona',
  'lítio',
  'alprazolam',
  'bromazepam',
  'zolpidem',
  'prometazina',

  // ── Sedoanalgesia UTI / Bloqueadores neuromusculares ─────────────────────
  'propofol',
  'ketamina',
  'etomidato',
  'dexmedetomidina',
  'remifentanil',
  'sufentanil',
  'alfentanil',
  'rocurônio',
  'vecurônio',
  'cisatracúrio',
  'succinilcolina',
  'sugamadex',

  // ── Respiratórios / Broncodilatadores ────────────────────────────────────
  'salbutamol',
  'fenoterol',
  'formoterol',
  'salmeterol',
  'indacaterol',
  'ipratrópio',
  'tiotrópio',
  'aclidínio',
  'umeclidínio',
  'budesonida',
  'beclometasona',
  'fluticasona',
  'mometasona',
  'ciclesonida',
  'aminofilina',
  'teofilina',
  'acetilcisteína',
  'ambroxol',
  'bromexina',
  'dornase alfa',
  'montelucaste',
  'zafirlucaste',
  'omalizumabe',
  'benralizumabe',
  'mepolizumabe',
  'heliox',
  'surfactante pulmonar',

  // ── Insulinas ────────────────────────────────────────────────────────────
  'insulina regular',
  'insulina NPH',
  'insulina glargina',
  'insulina detemir',
  'insulina degludeca',
  'insulina lispro',
  'insulina asparte',
  'insulina glulisina',

  // ── Hipoglicemiantes orais / Outros endocrinológicos ─────────────────────
  'metformina',
  'glibenclamida',
  'gliclazida',
  'glipizida',
  'glimepirida',
  'sitagliptina',
  'vildagliptina',
  'saxagliptina',
  'alogliptina',
  'empagliflozina',
  'dapagliflozina',
  'canagliflozina',
  'liraglutida',
  'semaglutida',
  'exenatida',
  'levotiroxina',
  'propiltiouracil',
  'metimazol',
  'desmopressina',
  'somatropina',
  'bromocriptina',
  'cabergolina',
  'fludrocortisona',
  'mitotano',
  'testosterona',
  'progesterona',
  'estradiol',

  // ── Imunossupressores / Reumatológicos / Biológicos ──────────────────────
  'metotrexato',
  'azatioprina',
  'micofenolato de mofetila',
  'ciclosporina',
  'tacrolimo',
  'sirolimo',
  'everolimo',
  'ciclofosfamida',
  'clorambucil',
  'rituximabe',
  'ácido zoledrônico',
  'ácido zoledrônico 5mg/100ml',
  'adalimumabe',
  'etanercepte',
  'infliximabe',
  'tocilizumabe',
  'sarilumabe',
  'abatacepte',
  'belimumabe',
  'secuquinumabe',
  'ixequizumabe',
  'ustekinumabe',
  'baricitinibe',
  'tofacitinibe',
  'upadacitinibe',
  'hidroxicloroquina',
  'cloroquina',
  'leflunomida',
  'colchicina',
  'alopurinol',
  'febuxostate',
  'rasburicase',
  'penicilamina',
  'sulfassalazina',

  // ── Hematológicos / Fatores de crescimento ───────────────────────────────
  'eritropoetina',
  'darbepoetina alfa',
  'filgrastim',
  'pegfilgrastim',
  'lenograstim',
  'ferro sacarato',
  'ferro dextran',
  'ferumoxitol',
  'sulfato ferroso',
  'ácido fólico',
  'vitamina B12',
  'cianocobalamina',
  'hidroxiureia',
  'albumina humana',
  'imunoglobulina humana',
  'imunoglobulina humana 5g/50ml',
  'anti-D imunoglobulina',

  // ── Nefrológicos ─────────────────────────────────────────────────────────
  'carbonato de cálcio',
  'sevelâmer',
  'bicarbonato de sódio',
  'calcitriol',
  'paricalcitol',
  'cinacalcete',
  'doxercalciferol',
  'patiromer',
  'poliestireno sulfonato de cálcio',

  // ── Soluções / Glicose ───────────────────────────────────────────────────
  'glicose 50%',
  'glicose 25%',
  'glicose 10%',
  'glicose 5%',
  'glicose hipertônica',

  // ── Vitaminas / Minerais / Eletrólitos ───────────────────────────────────
  'vitamina C',
  'vitamina D',
  'vitamina E',
  'tiamina',
  'piridoxina',
  'complexo B',
  'cloreto de potássio',
  'cloreto de sódio',
  'gluconato de cálcio',
  'sulfato de magnésio',
  'fosfato de potássio',
  'zinco',
  'selênio',
  'carnitina',
  'ácido fólico',

  // ── Dermatológicos / Tópicos (pomadas, cremes, géis, soluções) ──────────
  // Antifúngicos tópicos
  'cetoconazol creme',
  'cetoconazol shampoo',
  'miconazol creme',
  'clotrimazol creme',
  'clotrimazol solução',
  'terbinafina creme',
  'econazol creme',
  'bifonazol creme',
  'ciclopirox olamina creme',
  'nistatina creme',
  'nistatina pomada',
  'fluconazol creme',
  'isoconazol creme',
  'oxiconazol creme',
  'sertaconazol creme',
  // Antibióticos tópicos
  'mupirocina pomada',
  'mupirocina creme',
  'ácido fusídico creme',
  'ácido fusídico pomada',
  'neomicina pomada',
  'bacitracina pomada',
  'gentamicina creme',
  'gentamicina pomada',
  'tetraciclina pomada',
  'eritromicina gel',
  'clindamicina gel',
  'clindamicina solução',
  'metronidazol gel',
  'metronidazol creme',
  'rifampicina pomada',
  'sulfadiazina de prata creme',
  // Corticoides tópicos
  'hidrocortisona creme',
  'hidrocortisona pomada',
  'betametasona creme',
  'betametasona pomada',
  'betametasona loção',
  'betametasona + gentamicina creme',
  'betametasona + clotrimazol creme',
  'dexametasona creme',
  'prednisolona creme',
  'triamcinolona creme',
  'triamcinolona pomada',
  'mometasona creme',
  'mometasona pomada',
  'fluticasona creme',
  'desonida creme',
  'desonida loção',
  'clobetasol creme',
  'clobetasol pomada',
  'clobetasol solução capilar',
  'dipropionato de betametasona creme',
  // Emolientes / Barreira
  'óxido de zinco pasta',
  'óxido de zinco creme',
  'vaselina pomada',
  'lanolina pomada',
  'dexpantenol creme',
  'dexpantenol pomada',
  'dexpantenol spray',
  'ureia 10% creme',
  'ureia 20% creme',
  'ureia 40% creme',
  'ácido hialurônico gel',
  'colágeno gel',
  'alginato de sódio curativo',
  'carboximetilcelulose gel',
  'hidrocoloide curativo',
  // Antivirais tópicos
  'aciclovir creme',
  'aciclovir pomada',
  'penciclovir creme',
  'docosanol creme',
  // Anti-inflamatórios / Analgésicos tópicos
  'diclofenaco gel',
  'diclofenaco solução',
  'cetoprofeno gel',
  'ibuprofeno gel',
  'piroxicam gel',
  'indometacina gel',
  'nimesulida gel',
  'capsaicina creme',
  'lidocaína gel',
  'lidocaína creme',
  'prilocaína + lidocaína creme',
  'benzocaína gel',
  // Antipruriginosos / Outros
  'calaminа loção',
  'fenergan creme',
  'prometazina creme',
  'doxepina creme',
  'mentol + cânfora loção',
  // Queratolíticos / Acne / Outros
  'ácido salicílico solução',
  'ácido salicílico creme',
  'peróxido de benzoíla gel',
  'tretinoína creme',
  'tretinoína gel',
  'adapaleno gel',
  'ácido azelaico creme',
  'ácido azelaico gel',
  'isotretinoína gel',
  // Cicatrizantes
  'calêndula pomada',
  'alantoína creme',
  'colagenase pomada',
  'papainase gel',
  'fibrinolisina + desoxirribonuclease pomada',
  'polihexanida gel',
  'iodopovidona pomada',
  'iodopovidona solução tópica',

  // ── Miscelânea / Outros ──────────────────────────────────────────────────
  'N-acetilcisteína',
  'deferoxamina',
  'dimercaprol',
  'flumazenil',
  'naloxona',
  'naltrexona',
  'carvão ativado',
  'glucagon',
  'somatostatina',
  'vasopressina',
  'fitoterapia - não especificado',
  'omalizumabe',
  'benralizumabe',
  'dupilumabe',
  'mepolizumabe',
  'ômega 3',
  'coenzima Q10',
  'rosuvastatina',
  'atorvastatina',
  'sinvastatina',
  'pravastatina',
  'ezetimiba',
  'fenofibrato',
  'bezafibrato',
  'evolocumabe',
  'alirocumabe',
  'sildenafila',
  'tadalafila',
  'bosentana',
  'ambrisentana',
  'riociguate',
  'iloprost',
  'epoprostenol',
  'palivizumabe',
  'bevacizumabe',
  'cetuximabe',
  'trastuzumabe',
  'pembrolizumabe',
  'nivolumabe',

]
  .filter((m, i, arr) => arr.indexOf(m) === i)   // remove duplicatas
  .sort((a, b) => a.localeCompare(b, 'pt-BR'))

export const medicamentosCatalogo = [
  { nome: 'dipirona', presets: [
    { dose: '500', unidade: 'mg', via: 'VO' },
    { dose: '1', unidade: 'g', via: 'VO' },
    { dose: '1', unidade: 'g', via: 'EV' },
  ]},
  { nome: 'paracetamol', presets: [
    { dose: '500', unidade: 'mg', via: 'VO' },
    { dose: '750', unidade: 'mg', via: 'VO' },
    { dose: '1', unidade: 'g', via: 'EV' },
  ]},
  { nome: 'omeprazol', presets: [
    { dose: '20', unidade: 'mg', via: 'VO' },
    { dose: '40', unidade: 'mg', via: 'VO' },
    { dose: '40', unidade: 'mg', via: 'EV', evDiluicao: true, evVolume: '10', evSolucao: 'agua' },
  ]},
  { nome: 'furosemida', presets: [
    { dose: '20', unidade: 'mg', via: 'EV' },
    { dose: '40', unidade: 'mg', via: 'EV' },
    { dose: '40', unidade: 'mg', via: 'VO' },
  ]},
  { nome: 'enoxaparina', presets: [
    { dose: '40', unidade: 'mg', via: 'SC' },
    { dose: '60', unidade: 'mg', via: 'SC' },
  ]},
  { nome: 'heparina', presets: [
    { dose: '5000', unidade: 'UI', via: 'SC' },
    { dose: '5000', unidade: 'UI', via: 'EV' },
  ]},
  { nome: 'metoclopramida', presets: [
    { dose: '10', unidade: 'mg', via: 'EV' },
    { dose: '10', unidade: 'mg', via: 'VO' },
  ]},
  { nome: 'bromoprida', presets: [
    { dose: '10', unidade: 'mg', via: 'EV' },
    { dose: '10', unidade: 'mg', via: 'VO' },
  ]},
  { nome: 'ondansetrona', presets: [
    { dose: '4', unidade: 'mg', via: 'EV' },
    { dose: '8', unidade: 'mg', via: 'EV' },
  ]},
  { nome: 'ceftriaxona', presets: [
    { dose: '1', unidade: 'g', via: 'EV', evDiluicao: true, evVolume: '100', evSolucao: 'SF' },
    { dose: '2', unidade: 'g', via: 'EV', evDiluicao: true, evVolume: '100', evSolucao: 'SF' },
  ]},
  { nome: 'cefepima', presets: [
    { dose: '1', unidade: 'g', via: 'EV', evDiluicao: true, evVolume: '100', evSolucao: 'SF' },
    { dose: '2', unidade: 'g', via: 'EV', evDiluicao: true, evVolume: '100', evSolucao: 'SF' },
  ]},
  { nome: 'meropeném', presets: [
    { dose: '1', unidade: 'g', via: 'EV', evDiluicao: true, evVolume: '100', evSolucao: 'SF' },
  ]},
  { nome: 'vancomicina', presets: [
    { dose: '500', unidade: 'mg', via: 'EV', evDiluicao: true, evVolume: '100', evSolucao: 'SF' },
    { dose: '1', unidade: 'g', via: 'EV', evDiluicao: true, evVolume: '250', evSolucao: 'SF' },
  ]},
  { nome: 'hidrocortisona', presets: [
    { dose: '100', unidade: 'mg', via: 'EV' },
    { dose: '500', unidade: 'mg', via: 'EV' },
  ]},
  { nome: 'dexametasona', presets: [
    { dose: '4', unidade: 'mg', via: 'EV' },
    { dose: '10', unidade: 'mg', via: 'EV' },
    { dose: '4', unidade: 'mg', via: 'VO' },
  ]},
  { nome: 'losartana', presets: [
    { dose: '25', unidade: 'mg', via: 'VO' },
    { dose: '50', unidade: 'mg', via: 'VO' },
  ]},
  { nome: 'captopril', presets: [
    { dose: '25', unidade: 'mg', via: 'VO' },
  ]},
  { nome: 'anlodipino', presets: [
    { dose: '5', unidade: 'mg', via: 'VO' },
    { dose: '10', unidade: 'mg', via: 'VO' },
  ]},
  { nome: 'metronidazol', presets: [
    { dose: '500', unidade: 'mg', via: 'EV', evDiluicao: true, evVolume: '100', evSolucao: 'SF' },
  ]},
  { nome: 'clindamicina', presets: [
    { dose: '600', unidade: 'mg', via: 'EV', evDiluicao: true, evVolume: '100', evSolucao: 'SF' },
  ]},
]

const catalogoPorNome = new Map(
  medicamentosCatalogo.map((item) => [item.nome.toLowerCase(), item])
)

function normalizarNome(texto) {
  return String(texto || '').trim().toLowerCase()
}

export function obterCatalogoMedicacao(nome) {
  return catalogoPorNome.get(normalizarNome(nome)) || null
}

export function listarPresetsCatalogo(nome) {
  const catalogo = obterCatalogoMedicacao(nome)
  if (!catalogo) return []

  return catalogo.presets.map((preset) => ({
    tipo: 'catalogo',
    nome: catalogo.nome,
    med: { nome: catalogo.nome, ...preset },
    rotulo: formatarRotuloMedicacaoRapida({ nome: catalogo.nome, ...preset }),
  }))
}

/**
 * Retorna sugestões filtradas por texto digitado.
 * Busca no início do nome (maior prioridade) e depois no meio.
 * @param {string} texto - texto digitado pelo usuário
 * @param {string[]} historico - meds já usados pelo usuário (aparecem primeiro)
 * @param {number} limite - máximo de resultados (default 7)
 */
export function sugerirMedicamentos(texto, historico = [], limite = 7) {
  if (!texto || texto.trim().length < 2) return []

  const q = texto.trim().toLowerCase()

  // Histórico do usuário que bate com a busca
  const doHistorico = historico
    .filter(m => m.toLowerCase().includes(q))
    .slice(0, 3)

  // Lista base: começa com q (prioridade) depois contém q
  const comecam  = medicamentosBase.filter(m => m.startsWith(q) && !doHistorico.includes(m))
  const contem   = medicamentosBase.filter(m => !m.startsWith(q) && m.includes(q) && !doHistorico.includes(m))

  return [...doHistorico, ...comecam, ...contem].slice(0, limite)
}

export function sugerirMedicamentosDetalhados(texto, historico = [], limite = 8) {
  if (!texto || texto.trim().length < 2) return []

  const q = normalizarNome(texto)
  const usados = new Set()
  const resultados = []

  historico
    .filter((item) => normalizarNome(item.nome).includes(q))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .forEach((item) => {
      const chave = `hist:${item.nome}:${item.dose}:${item.via}:${item.unidade}:${item.oftOlho || ''}`
      if (usados.has(chave) || resultados.length >= limite) return
      usados.add(chave)
      resultados.push({
        tipo: 'hist',
        nome: item.nome,
        med: item,
        rotulo: formatarRotuloMedicacaoRapida(item),
      })
    })

  medicamentosCatalogo
    .filter((item) => normalizarNome(item.nome).includes(q))
    .forEach((item) => {
      item.presets.forEach((preset) => {
        if (resultados.length >= limite) return
        const med = { nome: item.nome, ...preset }
        const chave = `catalogo:${item.nome}:${preset.dose}:${preset.via}:${preset.unidade}`
        if (usados.has(chave)) return
        usados.add(chave)
        resultados.push({
          tipo: 'catalogo',
          nome: item.nome,
          med,
          rotulo: formatarRotuloMedicacaoRapida(med),
        })
      })
    })

  const nomesSimples = sugerirMedicamentos(texto, historico.map((item) => item.nome), limite)
  nomesSimples.forEach((nome) => {
    if (resultados.length >= limite) return
    const chave = `base:${nome}`
    if (usados.has(chave)) return
    usados.add(chave)
    resultados.push({
      tipo: 'base',
      nome,
      med: { nome },
      rotulo: nome,
    })
  })

  return resultados.slice(0, limite)
}
