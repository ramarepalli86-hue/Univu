'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const TEAL   = '#1A6B6B';
const AMBER  = '#D4880A';
const TEAL_L = '#2A8A8A';

const SAMVATSARAS = [
  'ప్రభవ (Prabhava)','విభవ (Vibhava)','శుక్ల (Shukla)','ప్రమోదూత (Pramoduta)','ప్రజోత్పత్తి (Prajotpatti)',
  'ఆంగీరస (Angirasa)','శ్రీముఖ (Srimukha)','భావ (Bhava)','యువ (Yuva)','ధాత (Dhata)',
  'ఈశ్వర (Ishwara)','బహుధాన్య (Bahudhanya)','ప్రమాది (Pramadi)','విక్రమ (Vikrama)','వృష (Vrisha)',
  'చిత్రభాను (Chitrabhanu)','సుభాను (Subhanu)','తారణ (Tarana)','పార్థివ (Parthiva)','వ్యయ (Vyaya)',
  'సర్వజిత్ (Sarvajit)','సర్వధారి (Sarvadharin)','విరోధి (Virodhí)','వికృతి (Vikruti)','ఖర (Khara)',
  'నందన (Nandana)','విజయ (Vijaya)','జయ (Jaya)','మన్మథ (Manmatha)','దుర్ముఖి (Durmukhi)',
  'హేవిళంబి (Hevilambi)','విళంబి (Vilambi)','వికారి (Vikari)','శార్వరి (Sharvari)','ప్లవ (Plava)',
  'శుభకృత్ (Shubhakrut)','శోభకృత్ (Shobhakrut)','క్రోధి (Krodhi)','విశ్వావసు (Vishwavasu)','పరాభవ (Parabhava)',
  'ప్లవంగ (Plavanga)','కీలక (Keelaka)','సౌమ్య (Saumya)','సాధారణ (Sadharan)','విరోధికృత్ (Virodhikrut)',
  'పరిధావి (Paridhavi)','ప్రమాదీచ (Pramadeecha)','ఆనంద (Ananda)','రాక్షస (Rakshasa)','నల (Nala)',
  'పింగళ (Pingala)','కాళయుక్తి (Kalayukthi)','సిద్ధార్థి (Siddharthi)','రౌద్ర (Raudra)','దుర్మతి (Durmathi)',
  'దుందుభి (Dundubhi)','రుధిరోద్గారి (Rudhirodhgari)','రక్తాక్షి (Raktakshi)','క్రోధన (Krodhana)','అక్షయ (Akshaya)',
];

const TELUGU_MASAS = [
  'చైత్రం (Chaitra)','వైశాఖం (Vaishakha)','జ్యేష్ఠం (Jyeshtha)','ఆషాఢం (Ashadha)',
  'శ్రావణం (Shravana)','భాద్రపదం (Bhadrapada)','ఆశ్వయుజం (Ashwayuja)','కార్తీకం (Kartika)',
  'మార్గశిరం (Margashira)','పుష్యం (Pushya)','మాఘం (Magha)','ఫాల్గుణం (Phalguna)',
];

const TITHIS = [
  'పాడ్యమి (Prathama)','విదియ (Dvitiya)','తదియ (Tritiya)','చవితి (Chaturthi)','పంచమి (Panchami)',
  'షష్ఠి (Shashthi)','సప్తమి (Saptami)','అష్టమి (Ashtami)','నవమి (Navami)','దశమి (Dashami)',
  'ఏకాదశి (Ekadashi)','ద్వాదశి (Dwadashi)','త్రయోదశి (Trayodashi)','చతుర్దశి (Chaturdashi)','పూర్ణిమ (Poornima)',
  'పాడ్యమి (Prathama)','విదియ (Dvitiya)','తదియ (Tritiya)','చవితి (Chaturthi)','పంచమి (Panchami)',
  'షష్ఠి (Shashthi)','సప్తమి (Saptami)','అష్టమి (Ashtami)','నవమి (Navami)','దశమి (Dashami)',
  'ఏకాదశి (Ekadashi)','ద్వాదశి (Dwadashi)','త్రయోదశి (Trayodashi)','చతుర్దశి (Chaturdashi)','అమావాస్య (Amavasya)',
];

const YOGAS = [
  'విష్కంభ (Vishkambha)','ప్రీతి (Preeti)','ఆయుష్మాన్ (Ayushman)','సౌభాగ్య (Saubhagya)','శోభన (Shobhana)',
  'అతిగండ (Atiganda)','సుకర్మ (Sukarma)','ధృతి (Dhriti)','శూల (Shoola)','గండ (Ganda)',
  'వృద్ధి (Vriddhi)','ధ్రువ (Dhruva)','వ్యాఘాత (Vyaghata)','హర్షణ (Harshana)','వజ్ర (Vajra)',
  'సిద్ధి (Siddhi)','వ్యతీపాత (Vyatipata)','వరీయాన్ (Variyan)','పరిఘ (Parigha)','శివ (Shiva)',
  'సిద్ధ (Siddha)','సాధ్య (Sadhya)','శుభ (Shubha)','శుక్ల (Shukla)','బ్రహ్మ (Brahma)',
  'ఇంద్ర (Indra)','వైధృతి (Vaidhruthi)',
];

const KARANAS = [
  'బవ (Bava)','బాలవ (Balava)','కౌలవ (Kaulava)','తైతిల (Taitila)','గర (Gara)','వణిజ (Vanija)','విష్టి (Vishti)',
];

const VARAS       = ['ఆదివారం (Adivaram)','సోమవారం (Somavaram)','మంగళవారం (Mangalavaram)','బుధవారం (Budhavaram)','గురువారం (Guruvaram)','శుక్రవారం (Shukravaram)','శనివారం (Shanivaram)'];
const VARA_LORDS  = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
const VARA_TELUGU = ['ఆది (Sun)','సోమ (Moon)','మంగళ (Mars)','బుధ (Mercury)','గురు (Jupiter)','శుక్ర (Venus)','శని (Saturn)'];

const NAKSHATRA_SYMBOL: Record<string, string> = {
  Ashwini:'🐴', Bharani:'🌺', Krittika:'🔥', Rohini:'🌹', Mrigashira:'🦌', Ardra:'💎',
  Punarvasu:'🌟', Pushya:'🌸', Ashlesha:'🐍', Magha:'👑', 'Purva Phalguni':'❤️', 'Uttara Phalguni':'🌞',
  Hasta:'🙌', Chitra:'💫', Swati:'🌬️', Vishakha:'⚡', Anuradha:'🪷', Jyeshtha:'⚔️',
  Mula:'🌿', 'Purva Ashadha':'🌊', 'Uttara Ashadha':'🦅', Shravana:'👂', Dhanishta:'🥁',
  Shatabhisha:'💊', 'Purva Bhadrapada':'⚡', 'Uttara Bhadrapada':'🐉', Revati:'🐟',
};

const MUHURTHAMS = [
  { name: 'అభిజిత్ ముహూర్తం', english: 'Abhijit Muhurtham', time: '11:48 AM – 12:36 PM', stars: 5,
    description: 'The most universally auspicious muhurtham of each day. Named after the star Abhijit (Vega), this midday window is powerful for any new beginning — starting a business, important meetings, signing contracts, travel, or any major decision.',
    telugu: 'ప్రతి రోజూ మధ్యాహ్నం 11:48 – 12:36 మధ్య. అన్ని శుభకార్యాలకు అనువైన సమయం.' },
  { name: 'విజయ ముహూర్తం', english: 'Vijaya Muhurtham', time: '2:24 PM – 3:12 PM', stars: 5,
    description: 'The "Victory" muhurtham — ideal for exams, interviews, legal proceedings, or anything where you need to emerge victorious. Strongly favored in South Indian tradition for important departures and court appearances.',
    telugu: 'పోటీ పరీక్షలు, ఇంటర్వ్యూలు, న్యాయపోరాటాలకు అత్యుత్తమ సమయం.' },
  { name: 'బ్రహ్మ ముహూర్తం', english: 'Brahma Muhurtham', time: '4:24 AM – 5:12 AM', stars: 5,
    description: 'The "Creator\'s Hour" — 1.5 hours before sunrise. The most auspicious time for spiritual practice, meditation, yoga, and deep study. The mind is at its clearest and the atmosphere is charged with sattvic (pure) energy.',
    telugu: 'సూర్యోదయానికి ముందు 4:24 – 5:12. ధ్యానం, యోగా, అధ్యయనానికి అత్యుత్తమం.' },
  { name: 'అమృత సిద్ధి యోగం', english: 'Amrita Siddhi Yoga', time: 'Varies by weekday & nakshatra', stars: 4,
    description: 'Forms when specific nakshatras align with specific weekdays: Sunday+Hasta, Monday+Mrigashira/Pushya, Tuesday+Ashwini, Wednesday+Anuradha, Thursday+Pushya/Revati, Friday+Ashwini, Saturday+Rohini. Activities started here yield lasting, immortal results.',
    telugu: 'వారం మరియు నక్షత్రం కలిసినప్పుడు ఏర్పడే అమృత సిద్ధి యోగం — ఆ రోజంతా శుభప్రదం.' },
  { name: 'సర్వార్థ సిద్ధి యోగం', english: 'Sarvaartha Siddhi Yoga', time: 'Varies by weekday & nakshatra', stars: 4,
    description: 'All desires are said to be fulfilled when an auspicious activity is started in this yoga. Particularly favored for business launches and important purchases.',
    telugu: 'అన్ని కోరికలు నెరవేరే యోగం — వ్యాపారం, కొనుగోళ్ళకు అనువైనది.' },
  { name: 'ద్విపుష్కర యోగం', english: 'Dwipushkara Yoga', time: 'Specific tithis + days + nakshatras', stars: 3,
    description: 'The "Double Gain" yoga — things begun here double in their result. Starting construction, investments, or sowing seeds during this yoga yields doubled returns.',
    telugu: 'మొదలుపెట్టిన పనులు రెండింతలయ్యే యోగం — నిర్మాణం, పెట్టుబడులకు మంచిది.' },
  { name: 'త్రిపుష్కర యోగం', english: 'Tripushkara Yoga', time: 'Rarer — specific tithi+vara+nakshatra', stars: 4,
    description: 'The "Triple Gain" yoga — even rarer and more potent than Dwipushkara. What is started here grows threefold. A very auspicious time for crops, businesses, or major projects.',
    telugu: 'మూడింతలు ఫలితాలిచ్చే యోగం — చాలా అరుదు మరియు చాలా శుభప్రదం.' },
  { name: 'రవి యోగం', english: 'Ravi Yoga', time: 'Sun + specific nakshatra combination', stars: 3,
    description: 'Excellent for government dealings, seeking positions of authority, medical treatments, and any action requiring clarity and leadership.',
    telugu: 'ప్రభుత్వ పనులు, వైద్యం, నాయకత్వ పాత్రలకు రవి యోగం శుభప్రదం.' },
];

const ACTIVITY_GUIDE = [
  { activity: 'Marriage (వివాహం)',           icon: '💍', good: ['Wednesday','Thursday','Friday'],         avoid: ['Tuesday','Saturday'],    nakshatras: 'Rohini, Mrigashira, Magha, Uttara Phalguni, Hasta, Swati, Anuradha, Uttara Ashadha, Uttara Bhadrapada, Revati', tithi: 'Avoid 4,8,9,12,14,Amavasya' },
  { activity: 'House Entry (గృహప్రవేశం)',    icon: '🏠', good: ['Wednesday','Thursday','Friday','Monday'], avoid: ['Tuesday','Saturday'],    nakshatras: 'Rohini, Mrigashira, Pushya, Uttara Phalguni, Hasta, Uttara Ashadha, Uttara Bhadrapada, Revati', tithi: 'Shukla Paksha preferred' },
  { activity: 'Business Start (వ్యాపారం)',   icon: '🏪', good: ['Wednesday','Thursday','Friday','Monday'], avoid: ['Saturday'],              nakshatras: 'Ashwini, Rohini, Mrigashira, Pushya, Hasta, Chitra, Anuradha, Shravana, Revati', tithi: 'Any except 8,14,30' },
  { activity: 'Travel (ప్రయాణం)',            icon: '✈️', good: ['Wednesday','Thursday','Friday'],         avoid: ['Tuesday','Saturday'],    nakshatras: 'Ashwini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, Anuradha, Shravana, Revati', tithi: 'Shukla 2,3,5,7,10,11,12,13' },
  { activity: 'Education (విద్యారంభం)',      icon: '📚', good: ['Wednesday','Thursday','Monday'],         avoid: ['Tuesday','Saturday'],    nakshatras: 'Ashwini, Rohini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, Shravana, Revati', tithi: 'Shukla 2,5,7,10,13 or Poornima' },
  { activity: 'Surgery (శస్త్రచికిత్స)',     icon: '🏥', good: ['Tuesday','Saturday'],                    avoid: ['Monday','Poornima'],     nakshatras: 'Ashwini, Hasta, Pushya, Anuradha, Mula', tithi: 'Krishna Paksha preferred; avoid Poornima' },
  { activity: 'Vehicle Purchase (వాహనం)',    icon: '🚗', good: ['Wednesday','Thursday','Friday'],         avoid: ['Tuesday','Saturday'],    nakshatras: 'Rohini, Mrigashira, Hasta, Anuradha, Shravana, Revati', tithi: 'Shukla 2,3,5,7,10,11' },
  { activity: 'Property/Land (స్థలం)',       icon: '🏡', good: ['Wednesday','Thursday','Monday'],         avoid: ['Tuesday'],               nakshatras: 'Rohini, Mrigashira, Pushya, Hasta, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada', tithi: 'Shukla Paksha' },
];

function computeTodayPanchang() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const weekday = now.getDay();

  const afterUgadi = month > 2 || (month === 2 && day >= 25);
  const shakaYear = year - 78 - (afterUgadi ? 0 : 1);
  const samvatsaraIdx = ((shakaYear - 1) % 60 + 60) % 60;
  const samvatsara = SAMVATSARAS[samvatsaraIdx];

  const monthOffsets = [9,10,11,0,1,2,3,4,5,6,7,8];
  const teluguMasaIdx = afterUgadi && month === 2 ? 0 : monthOffsets[month];
  const teluguMasa = TELUGU_MASAS[teluguMasaIdx];

  const JDN = (y: number, m: number, d: number) => {
    const a = Math.floor((14 - m) / 12);
    const yr = y + 4800 - a;
    const mo = m + 12 * a - 3;
    return d + Math.floor((153 * mo + 2) / 5) + 365 * yr + Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
  };
  const refNM = JDN(2025, 1, 29);
  const todayJD = JDN(year, month + 1, day);
  const daysSinceNM = ((todayJD - refNM) % 29.53059 + 29.53059) % 29.53059;
  const tithiIdx = Math.floor(daysSinceNM / 29.53059 * 30) % 30;
  const tithi = TITHIS[tithiIdx];
  const paksha = tithiIdx < 15 ? 'శుక్ల పక్షం (Shukla Paksha — Waxing Moon)' : 'కృష్ణ పక్షం (Krishna Paksha — Waning Moon)';

  const refMoonNK = 3;
  const moonNKIdx = Math.floor(((todayJD - refNM) * 27 / 27.32 + refMoonNK) % 27 + 27) % 27;
  const moonNakToday = Object.keys(NAKSHATRA_SYMBOL)[moonNKIdx] || 'Rohini';

  const yogaIdx = Math.floor((daysSinceNM * 27 / 29.53059 + moonNKIdx) % 27);
  const yoga = YOGAS[yogaIdx] || YOGAS[0];

  const karanaIdx = (tithiIdx * 2) % 7;
  const karana = KARANAS[karanaIdx];

  const vara = VARAS[weekday];
  const varaLord = VARA_LORDS[weekday];
  const varaTelugu = VARA_TELUGU[weekday];

  const RAHU_KALAM   = ['4:30–6:00 PM','7:30–9:00 AM','3:00–4:30 PM','12:00–1:30 PM','1:30–3:00 PM','10:30 AM–12:00 PM','9:00–10:30 AM'];
  const GULIKA_KALAM = ['6:00–7:30 AM','3:00–4:30 PM','4:30–6:00 PM','3:00–4:30 PM','9:00–10:30 AM','7:30–9:00 AM','6:00–7:30 AM'];
  const YAMAGANDAM   = ['10:30 AM–12:00 PM','4:30–6:00 PM','9:00–10:30 AM','1:30–3:00 PM','12:00–1:30 PM','6:00–7:30 AM','12:00–1:30 PM'];

  const specialDays: string[] = [];
  if (tithiIdx === 10) specialDays.push('🌟 ఏకాదశి (Ekadashi) — fast day, Vishnu worship');
  if (tithiIdx === 14) specialDays.push('🌕 పూర్ణిమ (Poornima) — Full Moon, very auspicious');
  if (tithiIdx === 29) specialDays.push('🌑 అమావాస్య (Amavasya) — New Moon, ancestor worship');
  if (tithiIdx === 3)  specialDays.push('🐘 వినాయక చవితి (Vinayaka Chaturthi) — Ganesh worship');
  if (tithiIdx === 5 && weekday === 5) specialDays.push('💚 లక్ష్మీ వారం + షష్ఠి — Lakshmi worship, very auspicious');
  if (weekday === 1) specialDays.push('🕉️ సోమవారం — Shiva worship day');
  if (weekday === 5) specialDays.push('🌺 శుక్రవారం — Lakshmi / Venus worship day');
  if (weekday === 4) specialDays.push('📿 గురువారం — Vishnu / Guru worship day');

  return {
    samvatsara, teluguMasa, paksha, tithi, moonNakToday, yoga, karana, vara, varaLord, varaTelugu,
    rahuKalam: RAHU_KALAM[weekday], gulikaKalam: GULIKA_KALAM[weekday], yamaDandam: YAMAGANDAM[weekday],
    specialDays,
    date: now.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' }),
  };
}

export default function Panchangam() {
  const p = computeTodayPanchang();
  const [section, setSection] = useState<'today'|'muhurthams'|'guide'>('today');

  const tab = (id: typeof section, label: string) => (
    <button onClick={() => setSection(id)}
      className="px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap"
      style={section === id
        ? { background:`linear-gradient(135deg,${TEAL},${TEAL_L})`, color:'#fff', boxShadow:'0 2px 8px rgba(26,107,107,0.25)' }
        : { color:'#6B7280' }
      }>{label}</button>
  );

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
      className="max-w-4xl mx-auto space-y-5">

      {/* ── Hero header ── */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor:'rgba(26,107,107,0.25)', background:'linear-gradient(135deg,rgba(26,107,107,0.1),rgba(212,136,10,0.07))' }}>
        <div className="px-5 py-5 flex items-start gap-4">
          <span className="text-5xl flex-shrink-0">🪔</span>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color:AMBER }}>తెలుగు పంచాంగం</p>
            <h2 className="text-2xl font-bold" style={{ color:'#1F2937' }}>Telugu Panchangam</h2>
            <p className="text-sm mt-0.5 font-medium" style={{ color:TEAL }}>{p.date}</p>
            <p className="text-xs mt-1" style={{ color:'#6B7280' }}>{p.samvatsara} · {p.teluguMasa}</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color:'#6B7280' }}>{p.paksha}</p>
          </div>
        </div>
        {p.specialDays.length > 0 && (
          <div className="px-5 pb-4 flex flex-wrap gap-1.5">
            {p.specialDays.map(s => (
              <span key={s} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background:'rgba(212,136,10,0.15)', color:'#92400E' }}>{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── Sub-nav ── */}
      <div className="flex gap-1 rounded-2xl p-1 overflow-x-auto" style={{ background:'rgba(26,107,107,0.06)' }}>
        {tab('today',      '📅 Today\'s Panchang')}
        {tab('muhurthams', '⭐ Muhurthams')}
        {tab('guide',      '📋 Activity Guide')}
      </div>

      {/* ── Today's Panchang ── */}
      {section === 'today' && (
        <div className="space-y-4">
          {/* Five elements */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label:'తిథి (Tithi)',          value:p.tithi,        icon:'🌙',  desc:'Lunar day — governs the quality of the day' },
              { label:'నక్షత్రం (Nakshatra)',  value:p.moonNakToday, icon:NAKSHATRA_SYMBOL[p.moonNakToday]||'⭐', desc:"Moon's star — affects mood & nature of day" },
              { label:'యోగం (Yoga)',            value:p.yoga,         icon:'🔱',  desc:'Sun+Moon combination — auspiciousness level' },
              { label:'కరణం (Karana)',          value:p.karana,       icon:'⚖️',  desc:'Half tithi — 2 per day, affects activity quality' },
              { label:'వారం (Vara)',             value:p.vara,         icon:'☀️',  desc:`${p.varaTelugu} — ${p.varaLord} rules today` },
              { label:'సంవత్సరం (Samvatsara)', value:p.samvatsara,   icon:'🏺',  desc:'Current Telugu year in the 60-year cycle' },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-3.5 border" style={{ background:'#FFFDF8', borderColor:'#E5E7EB' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-[10px] font-bold uppercase tracking-wide leading-tight" style={{ color:AMBER }}>{item.label}</p>
                </div>
                <p className="text-sm font-bold leading-snug mb-1" style={{ color:TEAL }}>{item.value}</p>
                <p className="text-[10px] leading-snug" style={{ color:'#9CA3AF' }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Inauspicious times */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor:'#FCA5A5' }}>
            <div className="px-4 py-2.5" style={{ background:'rgba(220,38,38,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'#DC2626' }}>⚠️ Avoid These Times Today — అశుభ సమయాలు</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {[
                { label:'రాహు కాలం',  time:p.rahuKalam,   who:'Rahu' },
                { label:'గుళిక కాలం', time:p.gulikaKalam, who:"Gulika (Saturn's son)" },
                { label:'యమగండం',     time:p.yamaDandam,  who:'Yama (Death deity)' },
              ].map(t => (
                <div key={t.label} className="px-3 py-3">
                  <p className="text-[10px] font-bold mb-0.5" style={{ color:'#DC2626' }}>{t.label}</p>
                  <p className="text-sm font-semibold" style={{ color:'#374151' }}>{t.time}</p>
                  <p className="text-[9px] mt-0.5" style={{ color:'#9CA3AF' }}>Ruled by {t.who}</p>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-gray-100" style={{ background:'rgba(254,243,199,0.5)' }}>
              <p className="text-[10px]" style={{ color:'#92400E' }}>Avoid starting important work, travel, or auspicious ceremonies during these windows. Times are approximate for IST.</p>
            </div>
          </div>

          {/* Vara lord */}
          <div className="rounded-xl p-4 border" style={{ background:'rgba(26,107,107,0.05)', borderColor:'rgba(26,107,107,0.2)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color:TEAL }}>Today&apos;s Ruling Planet — {p.varaLord}</p>
            <p className="text-sm leading-relaxed" style={{ color:'#374151' }}>
              {p.varaLord === 'Sun'     && 'Sunday (Adivaram) is governed by Surya. Best for government matters, authority, health treatments, seeking recognition. Worship Surya Narayana at sunrise. Sun days favour solo leadership.'}
              {p.varaLord === 'Moon'    && "Monday (Somavaram) is Shiva's day, governed by Chandra. Best for emotional matters, home, travel, beginning anything requiring public warmth. Worship Shiva with milk and Bilva leaves."}
              {p.varaLord === 'Mars'    && 'Tuesday (Mangalavaram) is governed by Mangala and Hanuman. Best for physical effort, competitive endeavors, surgery, legal battles, property matters. Worship Hanuman or Subramanya.'}
              {p.varaLord === 'Mercury' && 'Wednesday (Budhavaram) is governed by Budha. Best for business, education, writing, communication, contracts. Worship Vishnu/Krishna. One of the most favourable days in Telugu tradition.'}
              {p.varaLord === 'Jupiter' && 'Thursday (Guruvaram) is governed by Brihaspati. Best for education, spiritual practice, elders, gold purchases, auspicious ceremonies. Worship Vishnu with yellow flowers and Tulasi.'}
              {p.varaLord === 'Venus'   && 'Friday (Shukravaram) is Lakshmi Devi\'s day, governed by Shukra. Best for romance, art, beauty, luxury, social events. Worship Lakshmi Devi with lotus and honey.'}
              {p.varaLord === 'Saturn'  && 'Saturday (Shanivaram) is governed by Shani. Best for discipline, long-term planning, service, medical treatments. Worship Shani with sesame oil lamps and Hanuman. Traditionally avoided for auspicious ceremonies.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Muhurthams ── */}
      {section === 'muhurthams' && (
        <div className="space-y-3">
          <div className="rounded-xl p-4 border" style={{ background:'rgba(26,107,107,0.05)', borderColor:'rgba(26,107,107,0.2)' }}>
            <p className="text-sm leading-relaxed" style={{ color:'#374151' }}>
              <strong style={{ color:TEAL }}>What is a Muhurtham? (ముహూర్తం)</strong><br/>
              An auspicious time window selected from the Panchangam. Starting important activities within a good muhurtham significantly increases the chances of success. In Telugu tradition, no major event — wedding, housewarming, business launch — begins without consulting the Panchangam.
            </p>
          </div>
          {MUHURTHAMS.map(m => (
            <div key={m.name} className="rounded-xl border overflow-hidden" style={{ borderColor:'#E5E7EB' }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ background:'rgba(26,107,107,0.06)' }}>
                <div>
                  <p className="text-sm font-bold" style={{ color:TEAL }}>{m.name}</p>
                  <p className="text-xs mt-0.5" style={{ color:'#6B7280' }}>{m.english} · {m.time}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length:5 }).map((_,i) => (
                    <span key={i} className="text-sm" style={{ opacity:i < m.stars ? 1 : 0.18 }}>⭐</span>
                  ))}
                </div>
              </div>
              <div className="px-4 py-3 space-y-2">
                <p className="text-sm leading-relaxed" style={{ color:'#374151' }}>{m.description}</p>
                <p className="text-xs p-2.5 rounded-lg leading-relaxed" style={{ background:'rgba(212,136,10,0.08)', color:'#92400E' }}>
                  <strong>తెలుగులో:</strong> {m.telugu}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Activity Guide ── */}
      {section === 'guide' && (
        <div className="space-y-3">
          <div className="rounded-xl p-4 border" style={{ background:'rgba(212,136,10,0.05)', borderColor:'rgba(212,136,10,0.2)' }}>
            <p className="text-sm leading-relaxed" style={{ color:'#374151' }}>
              <strong style={{ color:AMBER }}>శుభ కార్యక్రమ మార్గదర్శి</strong> — Classical Telugu Panchangam recommendations for different life events, as prescribed in the Dharmasindhu and Muhurthamartanda texts.
            </p>
          </div>
          {ACTIVITY_GUIDE.map(item => (
            <div key={item.activity} className="rounded-xl border overflow-hidden" style={{ borderColor:'#E5E7EB' }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ background:'linear-gradient(135deg,rgba(26,107,107,0.07),rgba(212,136,10,0.04))' }}>
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm font-bold" style={{ color:'#1F2937' }}>{item.activity}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <div className="px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color:TEAL }}>✅ Auspicious Days</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.good.map(d => <span key={d} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:'rgba(26,107,107,0.12)', color:TEAL }}>{d}</span>)}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color:'#DC2626' }}>❌ Avoid</p>
                  <div className="flex flex-wrap gap-1">
                    {item.avoid.map(d => <span key={d} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:'rgba(220,38,38,0.08)', color:'#DC2626' }}>{d}</span>)}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color:AMBER }}>⭐ Best Nakshatras</p>
                  <p className="text-xs leading-relaxed mb-2" style={{ color:'#4B5563' }}>{item.nakshatras}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color:'#9CA3AF' }}>🌙 Tithi Notes</p>
                  <p className="text-xs" style={{ color:'#9CA3AF' }}>{item.tithi}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-xl p-3.5 border" style={{ borderColor:'#E5E7EB' }}>
            <p className="text-xs leading-relaxed" style={{ color:'#9CA3AF' }}>
              📜 These are general guidelines from traditional Telugu Panchangam texts. For exact muhurtham selection for major life events consult a qualified Telugu Panchangam Brahmin or Jyotisha expert who will factor in your specific birth chart and current transits.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
