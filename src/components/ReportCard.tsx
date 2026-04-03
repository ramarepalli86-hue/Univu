'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VedicChart from './VedicChart';
import WesternChart from './WesternChart';
import StoryAnimator from './StoryAnimator';
import type { FullReading } from '@/lib/astrology';
import type { ReadingContext } from '@/app/api/personal-reading/route';

export type ReadingResult = FullReading;

interface ReportCardProps {
  t: Record<string, string>;
  reading: FullReading;
}

const TEAL   = '#1A6B6B';
const AMBER  = '#D4880A';
const TEAL_L = '#2A8A8A';

const TABS = [
  { id: 'overview',   label: '✨ Overview'   },
  { id: 'love',       label: '💞 Love'       },
  { id: 'career',     label: '🏆 Career'     },
  { id: 'health',     label: '🌿 Health'     },
  { id: 'timeline',   label: '🗓 Timeline'   },
  { id: 'spiritual',  label: '🔮 Purpose'    },
  { id: 'panchangam', label: '🪔 Panchangam' },
  { id: 'charts',     label: '🪐 Charts'     },
  { id: 'story',      label: '🎬 Story'      },
] as const;
type TabId = typeof TABS[number]['id'];

function PersonalText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
          return <h3 key={i} className="text-base font-bold mt-5 mb-1" style={{ color: TEAL }}>{line.replace(/\*\*/g, '')}</h3>;
        }
        if (line.trim().startsWith('⚠️')) {
          return <p key={i} className="text-xs italic mt-4 pt-3 border-t" style={{ color: '#9CA3AF', borderColor: '#E5E7EB' }}>{line}</p>;
        }
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} style={{ color: '#1F2937' }}>{part.replace(/\*\*/g, '')}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

function ReadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse py-2">
      <div className="flex items-center gap-2 mb-4">
        <motion.div className="w-2 h-2 rounded-full" style={{ background: AMBER }}
          animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 0.9, repeat: Infinity }} />
        <span className="text-xs" style={{ color: '#9CA3AF' }}>Crafting your personalized reading…</span>
      </div>
      {[88,65,80,55,72,90,60,75].map((w,i) => (
        <div key={i} className="h-3 rounded-full" style={{ width: `${w}%`, background: '#F3F4F6' }} />
      ))}
    </div>
  );
}

const VEDIC_RASHIS_LOCAL = [
  'Mesha (Aries)','Vrishabha (Taurus)','Mithuna (Gemini)',
  'Karka (Cancer)','Simha (Leo)','Kanya (Virgo)',
  'Tula (Libra)','Vrischika (Scorpio)','Dhanu (Sagittarius)',
  'Makara (Capricorn)','Kumbha (Aquarius)','Meena (Pisces)',
];
const RASHI_LORDS_LOCAL = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const NAKSHATRA_DEITIES_LOCAL = [
  'Ashwini Kumaras','Yama','Agni','Brahma','Soma','Rudra',
  'Aditi','Brihaspati','Nagas','Pitris','Bhaga','Aryaman',
  'Savitar','Tvashtar','Vayu','Indragni','Mitra','Indra',
  'Nirriti','Apas','Vishvedevas','Vishnu','Vasus','Varuna',
  'Ajaikapada','Ahir Budhnya','Pushan',
];
const BODY_MAP: Record<string,string> = {
  'Mesha (Aries)':'head & brain','Vrishabha (Taurus)':'neck & throat',
  'Mithuna (Gemini)':'arms & lungs','Karka (Cancer)':'chest & stomach',
  'Simha (Leo)':'heart & spine','Kanya (Virgo)':'intestines & digestion',
  'Tula (Libra)':'kidneys & lower back','Vrischika (Scorpio)':'reproductive system',
  'Dhanu (Sagittarius)':'thighs & hips','Makara (Capricorn)':'knees & joints',
  'Kumbha (Aquarius)':'calves & circulation','Meena (Pisces)':'feet & lymph',
};

const NAKSHATRA_SYMBOL: Record<string, string> = {
  Ashwini:'🐴', Bharani:'🌺', Krittika:'🔥', Rohini:'🌹', Mrigashira:'🦌', Ardra:'💎',
  Punarvasu:'🌟', Pushya:'🌸', Ashlesha:'🐍', Magha:'👑', 'Purva Phalguni':'❤️', 'Uttara Phalguni':'🌞',
  Hasta:'🙌', Chitra:'💫', Swati:'🌬️', Vishakha:'⚡', Anuradha:'🪷', Jyeshtha:'⚔️',
  Mula:'🌿', 'Purva Ashadha':'🌊', 'Uttara Ashadha':'🦅', Shravana:'👂', Dhanishta:'🥁',
  Shatabhisha:'💊', 'Purva Bhadrapada':'⚡', 'Uttara Bhadrapada':'🐉', Revati:'🐟',
};

const NAKSHATRA_QUALITY: Record<string, string> = {
  Ashwini:'Healing & swift beginnings', Bharani:'Transformation & fierce love',
  Krittika:'Sharp discernment & fire', Rohini:'Beauty, wealth & sensuality',
  Mrigashira:'Eternal seeking & curiosity', Ardra:'Destruction that renews',
  Punarvasu:'Return & restoration', Pushya:'Nourishment & protection',
  Ashlesha:'Serpent wisdom & intensity', Magha:'Royal lineage & authority',
  'Purva Phalguni':'Pleasure & creative joy', 'Uttara Phalguni':'Contracts & social bonds',
  Hasta:'Craft, skill & dexterity', Chitra:'Architecture of beauty',
  Swati:'Independent spirit & balance', Vishakha:'Focused ambition & duality',
  Anuradha:'Loyal devotion & friendship', Jyeshtha:'Elder authority & occult power',
  Mula:'Root destruction & liberation', 'Purva Ashadha':'Invincible fire & pride',
  'Uttara Ashadha':'Universal victory & dharma', Shravana:'Listening, learning & connection',
  Dhanishta:'Abundance & musical soul', Shatabhisha:'Healing & mysticism',
  'Purva Bhadrapada':'Two-faced intensity & fire', 'Uttara Bhadrapada':'Depth, patience & moksha',
  Revati:'Final journey, protection & compassion',
};

const NAKSHATRA_FAMOUS: Record<string, string> = {
  Ashwini:'Mahatma Gandhi · Amitabh Bachchan', Bharani:'Charlie Chaplin · Aishwarya Rai',
  Krittika:'Jack Nicholson · Indira Gandhi', Rohini:'Barack Obama · Rihanna',
  Mrigashira:'Nikola Tesla · Oprah Winfrey', Ardra:'Leonardo DiCaprio · Elon Musk',
  Punarvasu:'Steve Jobs · Lata Mangeshkar', Pushya:'Dalai Lama · Warren Buffett',
  Ashlesha:'Elvis Presley · Cardi B', Magha:'Napoleon · Madhuri Dixit',
  'Purva Phalguni':'Michael Jackson · Marilyn Monroe', 'Uttara Phalguni':'Mother Teresa · AR Rahman',
  Hasta:'Mahatma Gandhi · Princess Diana', Chitra:'Michelangelo · Shah Jahan',
  Swati:'Rabindranath Tagore · Celine Dion', Vishakha:'Bill Gates · Deepika Padukone',
  Anuradha:'Shah Rukh Khan · Taylor Swift', Jyeshtha:'Cleopatra · Amitabh Bachchan',
  Mula:'Osho · Rumi · Nostradamus', 'Purva Ashadha':'Elvis · Jim Morrison',
  'Uttara Ashadha':'Julius Caesar · APJ Abdul Kalam', Shravana:'Albert Einstein · Jawaharlal Nehru',
  Dhanishta:'Aryabhata · Ludwig van Beethoven', Shatabhisha:'Abraham Lincoln · Nietzsche',
  'Purva Bhadrapada':'Nikola Tesla · Fyodor Dostoevsky', 'Uttara Bhadrapada':'Michelangelo · Nostradamus',
  Revati:'Swami Vivekananda · Rabindranath Tagore',
};

// ─── Telugu Panchangam ──────────────────────────────────────────────────────────

// 60-year Samvatsara cycle (starts from Prabhava)
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

// Telugu months (Chaitra = 1)
const TELUGU_MASAS = [
  'చైత్రం (Chaitra)','వైశాఖం (Vaishakha)','జ్యేష్ఠం (Jyeshtha)','ఆషాఢం (Ashadha)',
  'శ్రావణం (Shravana)','భాద్రపదం (Bhadrapada)','ఆశ్వయుజం (Ashwayuja)','కార్తీకం (Kartika)',
  'మార్గశిరం (Margashira)','పుష్యం (Pushya)','మాఘం (Magha)','ఫాల్గుణం (Phalguna)',
];

// Tithis
const TITHIS = [
  'పాడ్యమి (Prathama)','విదియ (Dvitiya)','తదియ (Tritiya)','చవితి (Chaturthi)','పంచమి (Panchami)',
  'షష్ఠి (Shashthi)','సప్తమి (Saptami)','అష్టమి (Ashtami)','నవమి (Navami)','దశమి (Dashami)',
  'ఏకాదశి (Ekadashi)','ద్వాదశి (Dwadashi)','త్రయోదశి (Trayodashi)','చతుర్దశి (Chaturdashi)','పూర్ణిమ (Poornima)',
  'పాడ్యమి (Prathama)','విదియ (Dvitiya)','తదియ (Tritiya)','చవితి (Chaturthi)','పంచమి (Panchami)',
  'షష్ఠి (Shashthi)','సప్తమి (Saptami)','అష్టమి (Ashtami)','నవమి (Navami)','దశమి (Dashami)',
  'ఏకాదశి (Ekadashi)','ద్వాదశి (Dwadashi)','త్రయోదశి (Trayodashi)','చతుర్దశి (Chaturdashi)','అమావాస్య (Amavasya)',
];

// 27 Yogas
const YOGAS = [
  'విష్కంభ (Vishkambha)','ప్రీతి (Preeti)','ఆయుష్మాన్ (Ayushman)','సౌభాగ్య (Saubhagya)','శోభన (Shobhana)',
  'అతిగండ (Atiganda)','సుకర్మ (Sukarma)','ధృతి (Dhriti)','శూల (Shoola)','గండ (Ganda)',
  'వృద్ధి (Vriddhi)','ధ్రువ (Dhruva)','వ్యాఘాత (Vyaghata)','హర్షణ (Harshana)','వజ్ర (Vajra)',
  'సిద్ధి (Siddhi)','వ్యతీపాత (Vyatipata)','వరీయాన్ (Variyan)','పరిఘ (Parigha)','శివ (Shiva)',
  'సిద్ధ (Siddha)','సాధ్య (Sadhya)','శుభ (Shubha)','శుక్ల (Shukla)','బ్రహ్మ (Brahma)',
  'ఇంద్ర (Indra)','వైధృతి (Vaidhruthi)',
];

// 11 Karanas (half-tithis, first 7 repeating + 4 fixed)
const KARANAS = [
  'బవ (Bava)','బాలవ (Balava)','కౌలవ (Kaulava)','తైతిల (Taitila)','గర (Gara)','వణిజ (Vanija)','విష్టి (Vishti)',
];

// Varas (days)
const VARAS = ['ఆదివారం (Adivaram)','సోమవారం (Somavaram)','మంగళవారం (Mangalavaram)','బుధవారం (Budhavaram)','గురువారం (Guruvaram)','శుక్రవారం (Shukravaram)','శనివారం (Shanivaram)'];
const VARA_LORDS = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
const VARA_TELUGU = ['ఆది (Sun)','సోమ (Moon)','మంగళ (Mars)','బుధ (Mercury)','గురు (Jupiter)','శుక్ర (Venus)','శని (Saturn)'];

// Auspicious Muhurthams — fixed classical list with descriptions
const MUHURTHAMS = [
  { name: 'అభిజిత్ ముహూర్తం', english: 'Abhijit Muhurtham', time: '11:48 AM – 12:36 PM', quality: 'Excellent', stars: 5,
    description: 'The most universally auspicious muhurtham of each day. Named after the star Abhijit (Vega), this midday window is considered powerful for any new beginning — starting a business, important meetings, signing contracts, travel, or any major decision.', telugu: 'ప్రతి రోజూ మధ్యాహ్నం 11:48 – 12:36 మధ్య. అన్ని శుభకార్యాలకు అనువైన సమయం.' },
  { name: 'విజయ ముహూర్తం', english: 'Vijaya Muhurtham', time: '2:24 PM – 3:12 PM', quality: 'Excellent', stars: 5,
    description: 'The "Victory" muhurtham — ideal for starting competitive endeavors, exams, interviews, legal proceedings, or anything where you need to emerge victorious. Strongly favored in South Indian tradition for important departures and court appearances.', telugu: 'పోటీ పరీక్షలు, ఇంటర్వ్యూలు, న్యాయపోరాటాలకు అత్యుత్తమ సమయం.' },
  { name: 'బ్రహ్మ ముహూర్తం', english: 'Brahma Muhurtham', time: '4:24 AM – 5:12 AM', quality: 'Very Good', stars: 5,
    description: 'The "Creator\'s Hour" — 1.5 hours before sunrise. The most auspicious time for spiritual practice, meditation, yoga, and deep study. The mind is at its clearest and the atmosphere is charged with sattvic (pure) energy. Waking up during this time is considered highly meritorious in Vedic tradition.', telugu: 'ఉదయం సూర్యోదయానికి ముందు 4:24 – 5:12. ధ్యానం, యోగా, అధ్యయనానికి అత్యుత్తమం.' },
  { name: 'అమృత సిద్ధి యోగం', english: 'Amrita Siddhi Yoga', time: 'Varies by weekday & nakshatra', quality: 'Very Good', stars: 4,
    description: 'Forms when specific nakshatras align with specific weekdays: Sunday+Hasta, Monday+Mrigashira/Pushya, Tuesday+Ashwini, Wednesday+Anuradha, Thursday+Pushya/Revati, Friday+Ashwini, Saturday+Rohini. Any activity started in this window is said to yield lasting, immortal results.', telugu: 'వారం మరియు నక్షత్రం కలిసినప్పుడు ఏర్పడే అమృత సిద్ధి యోగం — ఆ రోజంతా శుభప్రదం.' },
  { name: 'సర్వార్థ సిద్ధి యోగం', english: 'Sarvaartha Siddhi Yoga', time: 'Varies by weekday & nakshatra', quality: 'Very Good', stars: 4,
    description: 'Forms when specific nakshatras fall on compatible weekdays. All desires (Sarva = all, Artha = desires, Siddhi = fulfillment) are said to be fulfilled when an auspicious activity is started in this yoga. Particularly favored for business launches and important purchases.', telugu: 'అన్ని కోరికలు నెరవేరే యోగం — వ్యాపారం, కొనుగోళ్ళకు అనువైనది.' },
  { name: 'ద్విపుష్కర యోగం', english: 'Dwipushkara Yoga', time: 'Varies (specific tithis + days + nakshatras)', quality: 'Good', stars: 3,
    description: 'The "Double Gain" yoga — things begun here double in their result. Starting construction, making investments, or sowing seeds during this yoga is said to yield doubled returns. Formed when specific tithis align with specific weekdays and nakshatras.', telugu: 'మొదలుపెట్టిన పనులు రెండింతలయ్యే యోగం — నిర్మాణం, పెట్టుబడులకు మంచిది.' },
  { name: 'త్రిపుష్కర యోగం', english: 'Tripushkara Yoga', time: 'Varies (rarer than Dwipushkara)', quality: 'Good', stars: 4,
    description: 'The "Triple Gain" yoga — even more potent than Dwipushkara. Occurs only when very specific tithi + vara + nakshatra combinations align. What is started here is said to grow threefold. A very auspicious time to plant crops, start businesses, or begin major projects.', telugu: 'మూడింతలు ఫలితాలిచ్చే యోగం — చాలా అరుదు మరియు చాలా శుభప్రదం.' },
  { name: 'రవి యోగం', english: 'Ravi Yoga', time: 'Varies (Sun+specific nakshatra)', quality: 'Good', stars: 3,
    description: 'Forms when the Sun transits specific nakshatras on compatible weekdays. Excellent for all Sun-related activities: government dealings, seeking positions of authority, medical treatments, and any action requiring clarity and leadership.', telugu: 'ప్రభుత్వ పనులు, వైద్యం, నాయకత్వ పాత్రలకు రవి యోగం శుభప్రదం.' },
];

// Shubha/Ashubha activity guide
const ACTIVITY_GUIDE = [
  { activity: 'Marriage (వివాహం)', good: ['Wednesday','Thursday','Friday'], avoid: ['Tuesday','Saturday'], nakshatras: 'Rohini, Mrigashira, Magha, Uttara Phalguni, Hasta, Swati, Anuradha, Uttara Ashadha, Uttara Bhadrapada, Revati', tithi: 'Avoid 4,8,9,12,14,Amavasya' },
  { activity: 'House Entry (గృహప్రవేశం)', good: ['Wednesday','Thursday','Friday','Monday'], avoid: ['Tuesday','Saturday'], nakshatras: 'Rohini, Mrigashira, Pushya, Uttara Phalguni, Hasta, Uttara Ashadha, Uttara Bhadrapada, Revati', tithi: 'Shukla Paksha preferred' },
  { activity: 'Business Start (వ్యాపారం)', good: ['Wednesday','Thursday','Friday','Monday'], avoid: ['Saturday'], nakshatras: 'Ashwini, Rohini, Mrigashira, Pushya, Hasta, Chitra, Anuradha, Shravana, Revati', tithi: 'Any except 8,14,30' },
  { activity: 'Travel (ప్రయాణం)', good: ['Wednesday','Thursday','Friday'], avoid: ['Tuesday','Saturday'], nakshatras: 'Ashwini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, Anuradha, Shravana, Revati', tithi: 'Shukla 2,3,5,7,10,11,12,13' },
  { activity: 'Education Start (విద్యారంభం)', good: ['Wednesday','Thursday','Monday'], avoid: ['Tuesday','Saturday'], nakshatras: 'Ashwini, Rohini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, Shravana, Revati', tithi: 'Shukla 2,5,7,10,13 or Poornima' },
  { activity: 'Medical Surgery (శస్త్రచికిత్స)', good: ['Tuesday','Saturday'], avoid: ['Monday','Poornima'], nakshatras: 'Ashwini, Hasta, Pushya, Anuradha, Mula', tithi: 'Krishna Paksha preferred; avoid Poornima' },
  { activity: 'Vehicle Purchase (వాహన కొనుగోలు)', good: ['Wednesday','Thursday','Friday'], avoid: ['Tuesday','Saturday'], nakshatras: 'Rohini, Mrigashira, Hasta, Anuradha, Shravana, Revati', tithi: 'Shukla 2,3,5,7,10,11' },
  { activity: 'Property/Land (స్థలం కొనుగోలు)', good: ['Wednesday','Thursday','Monday'], avoid: ['Tuesday'], nakshatras: 'Rohini, Mrigashira, Pushya, Hasta, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada', tithi: 'Shukla Paksha' },
];

// Compute today's panchangam purely from the Gregorian date
function computeTodayPanchang() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();
  const weekday = now.getDay(); // 0=Sun

  // ── Telugu Year (Samvatsara) ──
  // Telugu New Year starts on Ugadi (Chaitra Shukla Prathama, ~April).
  // For a fast approximation: if current date >= ~April 6 of this year, use this year's samvatsara, else previous.
  // Samvatsara index: (year - 1987) mod 60, where 1987 = Shrimukha.
  // More standard: Shaka year = Gregorian year - 78 (if after ~April).
  // Samvatsara = (Shaka year - 1) mod 60.  Index 0 = Prabhava.
  const afterUgadi = month > 2 || (month === 2 && day >= 25); // rough: after ~late March
  const shakaYear = year - 78 - (afterUgadi ? 0 : 1);
  const samvatsaraIdx = ((shakaYear - 1) % 60 + 60) % 60;
  const samvatsara = SAMVATSARAS[samvatsaraIdx];

  // ── Telugu Month ──
  // Approximate: map Gregorian month to Telugu month
  // Chaitra ≈ mid-Mar to mid-Apr (index 0). Each is ~30 days.
  const monthOffsets = [9,10,11,0,1,2,3,4,5,6,7,8]; // Jan=Pushya(9), Feb=Magha(10)... Apr=Vaishakha(1)
  const teluguMasaIdx = afterUgadi && month === 2 ? 0 : monthOffsets[month];
  const teluguMasa = TELUGU_MASAS[teluguMasaIdx];

  // ── Tithi ── (approximate using Julian Day Number difference from a known New Moon)
  // Known New Moon (Amavasya) reference: Jan 29, 2025 (Julian Day ~2460706)
  // Synodic month ≈ 29.53059 days
  const JDN = (y: number, m: number, d: number) => {
    const a = Math.floor((14 - m) / 12);
    const yr = y + 4800 - a;
    const mo = m + 12 * a - 3;
    return d + Math.floor((153 * mo + 2) / 5) + 365 * yr + Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
  };
  const refNM = JDN(2025, 1, 29); // Reference New Moon
  const todayJD = JDN(year, month + 1, day);
  const daysSinceNM = ((todayJD - refNM) % 29.53059 + 29.53059) % 29.53059;
  const tithiIdx = Math.floor(daysSinceNM / 29.53059 * 30) % 30;
  const tithi = TITHIS[tithiIdx];
  const paksha = tithiIdx < 15 ? 'శుక్ల పక్షం (Shukla Paksha — Waxing Moon)' : 'కృష్ణ పక్షం (Krishna Paksha — Waning Moon)';

  // ── Nakshatra of the day ── (Moon's nakshatra, approximate)
  // Moon moves ~13.17° per day, covers 27 nakshatras in ~27.32 days
  const refMoonNK = 3; // Rohini on Jan 29, 2025 approx
  const moonNKIdx = Math.floor(((todayJD - refNM) * 27 / 27.32 + refMoonNK) % 27 + 27) % 27;
  const moonNakToday = Object.keys(NAKSHATRA_SYMBOL)[moonNKIdx] || 'Rohini';

  // ── Yoga ──
  const yogaIdx = Math.floor((daysSinceNM * 27 / 29.53059 + moonNKIdx) % 27);
  const yoga = YOGAS[yogaIdx] || YOGAS[0];

  // ── Karana ──
  const karanaIdx = (tithiIdx * 2) % 7;
  const karana = KARANAS[karanaIdx];

  // ── Vara ──
  const vara = VARAS[weekday];
  const varaLord = VARA_LORDS[weekday];
  const varaTelugu = VARA_TELUGU[weekday];

  // ── Inauspicious times ──
  // Rahu Kalam: each weekday has a fixed 90-min slot (approximate, IST 6am baseline)
  const RAHU_KALAM = ['4:30–6:00 PM','7:30–9:00 AM','3:00–4:30 PM','12:00–1:30 PM','1:30–3:00 PM','10:30 AM–12:00 PM','9:00–10:30 AM'];
  const GULIKA_KALAM = ['6:00–7:30 AM','3:00–4:30 PM','4:30–6:00 PM','3:00–4:30 PM (before sunrise)','9:00–10:30 AM (varies)','7:30–9:00 AM','6:00–7:30 AM'];
  const YAMAGANDAM = ['10:30 AM–12:00 PM','4:30–6:00 PM','9:00–10:30 AM','1:30–3:00 PM','12:00–1:30 PM (varies)','6:00–7:30 AM','12:00–1:30 PM (varies)'];

  const rahuKalam = RAHU_KALAM[weekday];
  const gulikaKalam = GULIKA_KALAM[weekday];
  const yamaDandam = YAMAGANDAM[weekday];

  // ── Special days ──
  const specialDays: string[] = [];
  if (tithiIdx === 10) specialDays.push('🌟 ఏకాదశి (Ekadashi) — fast day, Vishnu worship');
  if (tithiIdx === 14) specialDays.push('🌕 పూర్ణిమ (Poornima) — Full Moon, very auspicious');
  if (tithiIdx === 29) specialDays.push('🌑 అమావాస్య (Amavasya) — New Moon, ancestor worship (Pitru Tarpanam)');
  if (tithiIdx === 3) specialDays.push('🐘 వినాయక చవితి (Vinayaka Chaturthi) — Ganesh worship');
  if (tithiIdx === 5 && weekday === 5) specialDays.push('💚 లక్ష్మీ వారం + షష్ఠి — Lakshmi worship, very auspicious');
  if (weekday === 1) specialDays.push('🕉️ సోమవారం — Shiva worship day');
  if (weekday === 5) specialDays.push('🌺 శుక్రవారం — Lakshmi/Venus worship day');
  if (weekday === 4) specialDays.push('📿 గురువారం — Vishnu/Guru worship day');

  return {
    samvatsara, teluguMasa, paksha, tithi, moonNakToday, yoga, karana, vara, varaLord, varaTelugu,
    rahuKalam, gulikaKalam, yamaDandam, specialDays,
    date: now.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' }),
  };
}

function PanchangamTab({ reading }: { reading: FullReading }) {
  const p = computeTodayPanchang();
  const [activeSection, setActiveSection] = useState<'today'|'muhurthams'|'guide'>('today');

  const sectionBtn = (id: typeof activeSection, label: string) => (
    <button onClick={() => setActiveSection(id)}
      className="px-4 py-2 text-xs font-semibold rounded-xl transition-all"
      style={activeSection === id
        ? { background: `linear-gradient(135deg,${TEAL},${TEAL_L})`, color:'#fff' }
        : { color:'#6B7280', background:'transparent' }
      }>{label}</button>
  );

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor:'rgba(26,107,107,0.25)', background:'linear-gradient(135deg,rgba(26,107,107,0.1),rgba(212,136,10,0.07))' }}>
        <div className="px-5 py-4 flex items-start gap-4">
          <span className="text-4xl flex-shrink-0">🪔</span>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color:AMBER }}>Telugu Panchangam · తెలుగు పంచాంగం</p>
            <p className="text-lg font-bold" style={{ color:'#1F2937' }}>{p.date}</p>
            <p className="text-sm mt-0.5" style={{ color:TEAL }}>{p.samvatsara}</p>
            <p className="text-xs mt-0.5" style={{ color:'#6B7280' }}>{p.teluguMasa} · {p.paksha}</p>
          </div>
        </div>
        {p.specialDays.length > 0 && (
          <div className="px-5 pb-4 flex flex-wrap gap-1.5">
            {p.specialDays.map(s => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background:'rgba(212,136,10,0.15)', color:'#92400E' }}>{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background:'rgba(26,107,107,0.06)' }}>
        {sectionBtn('today',      '📅 Today\'s Panchang')}
        {sectionBtn('muhurthams', '⭐ Muhurthams')}
        {sectionBtn('guide',      '📋 Activity Guide')}
      </div>

      {/* ── Today's Panchang ── */}
      {activeSection === 'today' && (
        <div className="space-y-4">
          {/* Five elements grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { label:'తిథి (Tithi)', value: p.tithi, icon:'🌙', desc:'Lunar day — governs the quality of the day' },
              { label:'నక్షత్రం (Nakshatra)', value: p.moonNakToday, icon: NAKSHATRA_SYMBOL[p.moonNakToday]||'⭐', desc:'Moon\'s star — affects mood & nature of day' },
              { label:'యోగం (Yoga)', value: p.yoga, icon:'🔱', desc:'Sun+Moon combination — auspiciousness level' },
              { label:'కరణం (Karana)', value: p.karana, icon:'⚖️', desc:'Half tithi — 2 per day, affects activity quality' },
              { label:'వారం (Vara)', value: p.vara, icon:'☀️', desc:`${p.varaTelugu} — ${p.varaLord} rules today` },
              { label:'సంవత్సరం (Samvatsara)', value: p.samvatsara, icon:'🏺', desc:'Current Telugu year in 60-year cycle' },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-3 border" style={{ background:'#FFFDF8', borderColor:'#E5E7EB' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color:AMBER }}>{item.label}</p>
                </div>
                <p className="text-sm font-bold leading-tight mb-1" style={{ color:TEAL }}>{item.value}</p>
                <p className="text-[10px]" style={{ color:'#9CA3AF' }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Inauspicious times */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor:'#FDE68A' }}>
            <div className="px-4 py-2.5" style={{ background:'rgba(220,38,38,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'#DC2626' }}>⚠️ Avoid These Times Today (అశుభ సమయాలు)</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {[
                { label:'రాహు కాలం', time: p.rahuKalam, who:'Rahu' },
                { label:'గుళిక కాలం', time: p.gulikaKalam, who:'Gulika (Saturn\'s son)' },
                { label:'యమగండం', time: p.yamaDandam, who:'Yama (Death deity)' },
              ].map(t => (
                <div key={t.label} className="px-3 py-2.5">
                  <p className="text-[10px] font-bold" style={{ color:'#DC2626' }}>{t.label}</p>
                  <p className="text-xs font-semibold" style={{ color:'#374151' }}>{t.time}</p>
                  <p className="text-[9px] mt-0.5" style={{ color:'#9CA3AF' }}>Ruled by {t.who}</p>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 border-t" style={{ borderColor:'#F3F4F6', background:'rgba(254,243,199,0.4)' }}>
              <p className="text-[10px]" style={{ color:'#92400E' }}>These times are traditionally considered inauspicious in Telugu/South Indian tradition. Avoid starting important work, travel, or auspicious ceremonies during these windows. Times shown are approximate for IST.</p>
            </div>
          </div>

          {/* Vara lord explanation */}
          <div className="rounded-xl p-4 border" style={{ background:'rgba(26,107,107,0.05)', borderColor:'rgba(26,107,107,0.2)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color:TEAL }}>Today&apos;s Ruling Planet — {p.varaLord}</p>
            <p className="text-sm leading-relaxed" style={{ color:'#374151' }}>
              {p.varaLord === 'Sun' ? 'Sunday (Adivaram) is governed by the Sun (Surya). Best for: government matters, authority, health treatments, seeking recognition. Worship Surya Narayana at sunrise. Avoid starting projects that require humility or partnership — Sun days favour solo leadership.' :
               p.varaLord === 'Moon' ? 'Monday (Somavaram) is governed by the Moon (Chandra) and is Shiva\'s day. Best for: emotional matters, home, travel by water, beginning anything requiring public warmth. Worship Shiva with milk and Bilva leaves. Highly auspicious for new beginnings.' :
               p.varaLord === 'Mars' ? 'Tuesday (Mangalavaram) is governed by Mars (Mangala) and Hanuman. Best for: physical effort, competitive endeavors, surgery, legal battles, property matters. Worship Hanuman or Subramanya. A traditionally challenging day for new ventures or marriage.' :
               p.varaLord === 'Mercury' ? 'Wednesday (Budhavaram) is governed by Mercury (Budha). Best for: business, education, writing, communication, contracts, intellectual work. Worship Vishnu/Krishna. One of the most favourable days in Telugu tradition for starting new work.' :
               p.varaLord === 'Jupiter' ? 'Thursday (Guruvaram) is governed by Jupiter (Brihaspati/Guru). Best for: education, spiritual practice, seeking blessings from elders, gold purchases, auspicious ceremonies. Worship Vishnu with yellow flowers and Tulasi. Highly auspicious in Telugu tradition — most weddings prefer Thursday.' :
               p.varaLord === 'Venus' ? 'Friday (Shukravaram) is governed by Venus (Shukra) and Goddess Lakshmi. Best for: romance, art, beauty, luxury purchases, feminine endeavors, social events. Worship Lakshmi Devi with lotus and honey. Excellent for weddings and all Lakshmi-related prayers.' :
               'Saturday (Shanivaram) is governed by Saturn (Shani). Best for: discipline, long-term planning, service work, medical treatments, beginning difficult tasks that require endurance. Worship Shani with sesame oil lamps and Hanuman. Traditionally avoided for auspicious ceremonies, though excellent for hard disciplined work.'}
            </p>
          </div>

          {/* Personal connection */}
          <div className="rounded-xl p-4 border" style={{ background:'rgba(212,136,10,0.05)', borderColor:'rgba(212,136,10,0.2)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color:AMBER }}>🪷 Today & Your Chart — {reading.name}</p>
            <p className="text-sm leading-relaxed" style={{ color:'#374151' }}>
              Your natal Moon is in <strong>{reading.moonNakshatraName}</strong> and today&apos;s Moon nakshatra is <strong>{p.moonNakToday}</strong>.{' '}
              {reading.moonNakshatraName === p.moonNakToday
                ? 'Today is your Janma Nakshatra day (జన్మ నక్షత్ర దినం) — your birth star returns! This is considered both auspicious and sensitive. Good for inner reflection, worship of your nakshatra deity, and spiritual practice. Avoid major new decisions today.'
                : 'Your current Mahadasha lord is ' + reading.currentDasha + `. Today's ruling planet is ${p.varaLord}. ${reading.currentDasha === p.varaLord ? 'Your dasha lord rules today — an especially empowered day for ' + reading.currentDasha + '-related matters.' : 'Look for alignment between your dasha themes and today\'s energy to find the most productive focus.'}`
              }
            </p>
          </div>
        </div>
      )}

      {/* ── Muhurthams ── */}
      {activeSection === 'muhurthams' && (
        <div className="space-y-3">
          <div className="rounded-xl p-3 border" style={{ background:'rgba(26,107,107,0.05)', borderColor:'rgba(26,107,107,0.2)' }}>
            <p className="text-xs leading-relaxed" style={{ color:'#374151' }}>
              <strong style={{ color:TEAL }}>What is a Muhurtham?</strong> A muhurtham (ముహూర్తం) is an auspicious time window selected according to the five elements of the Panchangam. Starting important activities within a good muhurtham is believed to significantly increase the chances of success and minimize obstacles. In Telugu tradition, no major event — wedding, housewarming, business launch, or travel — begins without consulting the Panchangam for an auspicious muhurtham.
            </p>
          </div>
          {MUHURTHAMS.map(m => (
            <div key={m.name} className="rounded-xl border overflow-hidden" style={{ borderColor:'#E5E7EB' }}>
              <div className="flex items-center justify-between px-4 py-2.5" style={{ background:'rgba(26,107,107,0.06)' }}>
                <div>
                  <p className="text-sm font-bold" style={{ color:TEAL }}>{m.name}</p>
                  <p className="text-xs" style={{ color:'#6B7280' }}>{m.english} · {m.time}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-sm" style={{ opacity: i < m.stars ? 1 : 0.2 }}>⭐</span>
                  ))}
                </div>
              </div>
              <div className="px-4 py-3 space-y-2">
                <p className="text-sm leading-relaxed" style={{ color:'#374151' }}>{m.description}</p>
                <p className="text-xs leading-relaxed p-2 rounded-lg" style={{ background:'rgba(212,136,10,0.07)', color:'#92400E' }}>
                  <strong>తెలుగులో:</strong> {m.telugu}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Activity Guide ── */}
      {activeSection === 'guide' && (
        <div className="space-y-3">
          <div className="rounded-xl p-3 border" style={{ background:'rgba(212,136,10,0.05)', borderColor:'rgba(212,136,10,0.2)' }}>
            <p className="text-xs leading-relaxed" style={{ color:'#374151' }}>
              <strong style={{ color:AMBER }}>శుభ కార్యక్రమ మార్గదర్శి (Auspicious Activity Guide)</strong> — Classical Telugu Panchangam recommendations for different life events. The best days, nakshatras, and tithis for each activity, as prescribed in the Dharmasindhu and Muhurthamartanda texts.
            </p>
          </div>
          {ACTIVITY_GUIDE.map(item => (
            <div key={item.activity} className="rounded-xl border overflow-hidden" style={{ borderColor:'#E5E7EB' }}>
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ background:'linear-gradient(135deg,rgba(26,107,107,0.07),rgba(212,136,10,0.04))' }}>
                <p className="text-sm font-bold" style={{ color:'#1F2937' }}>{item.activity}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <div className="px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color:TEAL }}>✅ Auspicious Days (శుభ వారాలు)</p>
                  <div className="flex flex-wrap gap-1">
                    {item.good.map(d => <span key={d} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:'rgba(26,107,107,0.12)', color:TEAL }}>{d}</span>)}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mt-2 mb-1" style={{ color:'#DC2626' }}>❌ Avoid Days</p>
                  <div className="flex flex-wrap gap-1">
                    {item.avoid.map(d => <span key={d} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:'rgba(220,38,38,0.08)', color:'#DC2626' }}>{d}</span>)}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color:AMBER }}>⭐ Best Nakshatras</p>
                  <p className="text-xs leading-relaxed" style={{ color:'#4B5563' }}>{item.nakshatras}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide mt-2 mb-0.5" style={{ color:'#6B7280' }}>🌙 Tithi Notes</p>
                  <p className="text-xs" style={{ color:'#9CA3AF' }}>{item.tithi}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Footer note */}
          <div className="rounded-xl p-3 border" style={{ borderColor:'#E5E7EB' }}>
            <p className="text-xs leading-relaxed" style={{ color:'#9CA3AF' }}>
              📜 <strong>Note:</strong> These are general classical guidelines from traditional Telugu Panchangam texts (Dharmasindhu, Muhurthamartanda, and local Andhra/Telangana almanac traditions). For exact muhurtham selection for major life events like marriage or housewarming, consult a qualified Telugu Panchangam Brahmin or Jyotisha expert who will factor in your specific birth chart, current transits, and the exact location.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Nakshatra Banner ────────────────────────────────────────────────────────────

function NakshatraBanner({ reading }: { reading: FullReading }) {
  const nk = reading.moonNakshatraName;
  const sym = NAKSHATRA_SYMBOL[nk] || '✦';
  const quality = NAKSHATRA_QUALITY[nk] || 'Ancient cosmic wisdom';
  const famous = NAKSHATRA_FAMOUS[nk] || '';
  const pada = reading.moonNakshatraPada;
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(26,107,107,0.2)', background: 'linear-gradient(135deg,rgba(26,107,107,0.07),rgba(212,136,10,0.05))' }}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: 'rgba(26,107,107,0.1)', border: '1px solid rgba(26,107,107,0.2)' }}>
          {sym}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-0" style={{ color: AMBER }}>Your Birth Star</p>
          <h2 className="text-base sm:text-lg font-bold leading-tight" style={{ color: TEAL }}>{nk} <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Pada {pada}</span></h2>
          <p className="text-[10px] font-medium" style={{ color: '#6B7280' }}>{quality}</p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-0.5 text-right flex-shrink-0">
          <p className="text-[9px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Shares with</p>
          {famous.split(' · ').slice(0, 2).map(f => (
            <p key={f} className="text-[10px] font-semibold" style={{ color: '#374151' }}>{f}</p>
          ))}
        </div>
      </div>
      {/* Nakshatra strip — show all 27 nakshatras, highlight current */}
      <div className="flex overflow-x-auto px-2 pb-1.5 gap-0.5" style={{ scrollbarWidth: 'none' }}>
        {Object.keys(NAKSHATRA_SYMBOL).map((n) => {
          const isCurrent = n === nk;
          return (
            <div key={n} className="flex-shrink-0 text-center" style={{ opacity: isCurrent ? 1 : 0.28 }}>
              <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] mb-0"
                style={{ background: isCurrent ? `linear-gradient(135deg,${TEAL},${TEAL_L})` : 'rgba(26,107,107,0.06)', border: isCurrent ? `1px solid ${TEAL}` : '1px solid transparent' }}>
                {NAKSHATRA_SYMBOL[n]}
              </div>
              {isCurrent && <div className="w-0.5 h-0.5 rounded-full mx-auto mt-0.5" style={{ background: AMBER }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildContext(reading: FullReading): ReadingContext {
  const birthYear = parseInt(reading.dob?.split('-')[0] || '1990', 10);
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear;
  const venus   = reading.planets.find(p => p.name === 'Venus');
  const mars    = reading.planets.find(p => p.name === 'Mars');
  const saturn  = reading.planets.find(p => p.name === 'Saturn');
  const jupiter = reading.planets.find(p => p.name === 'Jupiter');
  const rahu    = reading.planets.find(p => p.name === 'Rahu');
  const ketu    = reading.planets.find(p => p.name === 'Ketu');
  const li = reading.lagnaRashi;
  const dashaTimeline = reading.dashaTimeline || [];
  let currentDashaYears = '', nextDasha = '', nextDashaYear = '';
  // Match by the dasha period whose year bracket contains today — not just planet name
  // (each planet appears twice in the 120-yr cycle; name-only match picks the wrong one)
  for (let i = 0; i < dashaTimeline.length; i++) {
    const d = dashaTimeline[i];
    if (d.planet === reading.currentDasha && currentYear >= d.startYear && currentYear <= d.endYear) {
      currentDashaYears = `${d.startYear}–${d.endYear}`;
      if (dashaTimeline[i+1]) { nextDasha = dashaTimeline[i+1].planet; nextDashaYear = String(dashaTimeline[i+1].startYear); }
      break;
    }
  }
  return {
    name: reading.name, dob: reading.dob, birthCity: reading.birthCity,
    gender: reading.gender, maritalStatus: (reading as FullReading & { maritalStatus?: string }).maritalStatus ?? 'single',
    employment: (reading as FullReading & { employment?: string }).employment ?? 'employed',
    concern: (reading as FullReading & { concern?: string }).concern ?? '',
    lagnaSign: reading.lagnaSign, moonSign: reading.moonSign, sunSign: reading.sunSign,
    moonNakshatraName: reading.moonNakshatraName, moonNakshatraPada: reading.moonNakshatraPada,
    nakshatraDeity: NAKSHATRA_DEITIES_LOCAL[reading.moonNakshatra] || 'the divine',
    currentDasha: reading.currentDasha || 'Unknown', currentAntardasha: reading.currentAntardasha || 'Unknown',
    currentDashaYears, nextDasha, nextDashaYear, currentAge,
    isManglik: reading.manglik?.isManglik ?? false,
    marsHouse: mars?.house ?? 0, marsSign: mars?.rashi ?? '',
    venusSign: venus?.rashi ?? '', venusHouse: venus?.house ?? 0,
    saturnSign: saturn?.rashi ?? '', saturnHouse: saturn?.house ?? 0,
    jupiterSign: jupiter?.rashi ?? '', jupiterHouse: jupiter?.house ?? 0,
    rahuSign: rahu?.rashi ?? '', rahuHouse: rahu?.house ?? 0,
    ketuSign: ketu?.rashi ?? '', ketuHouse: ketu?.house ?? 0,
    seventhHouseSign: VEDIC_RASHIS_LOCAL[(li+6)%12], seventhHouseLord: RASHI_LORDS_LOCAL[(li+6)%12],
    tenthHouseSign: VEDIC_RASHIS_LOCAL[(li+9)%12], tenthHouseLord: RASHI_LORDS_LOCAL[(li+9)%12],
    sixthHouseSign: VEDIC_RASHIS_LOCAL[(li+5)%12], eighthHouseSign: VEDIC_RASHIS_LOCAL[(li+7)%12],
    ninthHouseSign: VEDIC_RASHIS_LOCAL[(li+8)%12], twelfthHouseSign: VEDIC_RASHIS_LOCAL[(li+11)%12],
    lagnaBodyPart: BODY_MAP[reading.lagnaSign] || 'general vitality',
    planetsIn7: reading.planets.filter(p=>p.house===7).map(p=>p.name).join(', ') || 'None',
    planetsIn6: reading.planets.filter(p=>p.house===6).map(p=>p.name).join(', ') || 'None',
    atmakaraka: reading.atmakaraka?.planet ?? 'Sun',
    sadeSatiActive: reading.sadeSati?.isActive ?? false,
  };
}

function ConcernBanner({ concern }: { concern: string }) {
  if (!concern?.trim()) return null;
  return (
    <div className="mb-5 rounded-xl p-4 border" style={{ background: 'rgba(212,136,10,0.07)', borderColor: 'rgba(212,136,10,0.3)' }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: AMBER }}>📌 Your Question</p>
      <p className="text-sm font-medium italic" style={{ color: '#374151' }}>&ldquo;{concern}&rdquo;</p>
      <p className="text-[11px] mt-1.5" style={{ color: '#9CA3AF' }}>The AI reading below addresses this directly.</p>
    </div>
  );
}

function AISection({ sectionId, reading }: { sectionId: string; reading: FullReading }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const fetch_ = useCallback(async () => {
    if (fetched || loading) return;
    setLoading(true);
    try {
      const ctx = buildContext(reading);
      const res = await fetch('/api/personal-reading', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionId, context: ctx }),
      });
      if (res.ok) { const d = await res.json(); if (d.text) setText(d.text); }
    } catch { /* silent */ } finally { setLoading(false); setFetched(true); }
  }, [sectionId, reading, fetched, loading]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const concern = (reading as FullReading & { concern?: string }).concern ?? '';

  if (loading) return (
    <div>
      {sectionId === 'overview' && <ConcernBanner concern={concern} />}
      <ReadingSkeleton />
    </div>
  );
  if (text) return (
    <div>
      {sectionId === 'overview' && <ConcernBanner concern={concern} />}
      <PersonalText text={text} />
    </div>
  );
  if (fetched) return (
    <div className="text-center py-10 space-y-3">
      <p className="text-sm" style={{ color: '#6B7280' }}>Could not load reading right now.</p>
      <button onClick={() => setFetched(false)} className="text-xs px-4 py-2 rounded-full font-medium text-white" style={{ background: TEAL }}>Try Again</button>
    </div>
  );
  return (
    <div>
      {sectionId === 'overview' && <ConcernBanner concern={concern} />}
      <ReadingSkeleton />
    </div>
  );
}

function StatBadge({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl p-3 border" style={{ background: accent ? 'rgba(26,107,107,0.06)' : '#FAFAF8', borderColor: accent ? 'rgba(26,107,107,0.2)' : '#E5E7EB' }}>
      <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: '#9CA3AF' }}>{label}</p>
      <p className="text-sm font-semibold leading-tight" style={{ color: accent ? TEAL : '#1F2937' }}>{value}</p>
    </div>
  );
}

const P_SYMBOLS: Record<string,string> = { Sun:'☀️',Moon:'🌙',Mars:'♂',Mercury:'☿',Jupiter:'♃',Venus:'♀',Saturn:'♄',Rahu:'☊',Ketu:'☋' };

export default function ReportCard({ t: _t, reading }: ReportCardProps) {
  const [tab, setTab] = useState<TabId>('overview');
  const birthYear = parseInt(reading.dob?.split('-')[0] || '1990', 10);
  const AI_TABS: TabId[] = ['overview','love','career','health','timeline','spiritual'];

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="text-center pb-1">
        <h1 className="text-2xl sm:text-3xl font-display font-bold" style={{ color:'#1F2937' }}>
          {reading.name}&apos;s Cosmic Blueprint
        </h1>
        <p className="text-sm mt-1" style={{ color:'#6B7280' }}>Born {reading.dob} · {reading.birthCity}</p>
      </div>

      <NakshatraBanner reading={reading} />

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBadge label="Ascendant (Lagna)" value={reading.lagnaSign} accent />
        <StatBadge label="Moon Sign" value={reading.moonSign} accent />
        <StatBadge label="Birth Star (Nakshatra)" value={`${reading.moonNakshatraName} Pada ${reading.moonNakshatraPada}`} />
        <StatBadge label="Active Dasha Period" value={`${reading.currentDasha} › ${reading.currentAntardasha}`} />
        <StatBadge label="Western Sun Sign" value={reading.westernSunSign} />
        <StatBadge label="Vedic Sun" value={reading.sunSign} />
        <StatBadge label="Manglik Dosha" value={reading.manglik?.isManglik ? '🔴 Yes' : '🟢 No'} />
        <StatBadge label="Sade Sati" value={reading.sadeSati?.isActive ? '⚠️ Active now' : '✓ Not active'} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl p-1 overflow-x-auto" style={{ background:'rgba(26,107,107,0.06)' }}>
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all"
            style={tab === id
              ? { background:`linear-gradient(135deg,${TEAL},${TEAL_L})`, color:'#fff', boxShadow:'0 2px 8px rgba(26,107,107,0.25)' }
              : { color:'#6B7280' }
            }>{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.22 }}
          className="rounded-2xl p-5 sm:p-6 border" style={{ background:'#FFFDF8', borderColor:'#E5E7EB', minHeight:'320px' }}>

          {AI_TABS.includes(tab) && <AISection sectionId={tab} reading={reading} />}

          {tab === 'panchangam' && <PanchangamTab reading={reading} />}

          {tab === 'charts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold mb-3" style={{ color:TEAL }}>🪐 Your Planetary Positions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs border-b" style={{ color:'#9CA3AF', borderColor:'#E5E7EB' }}>
                        {['Planet','Rashi','House','Nakshatra','Pada'].map(h => <th key={h} className="pb-2 font-medium pr-4">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {reading.planets.map(p => (
                        <tr key={p.name} className="border-b" style={{ borderColor:'#F3F4F6' }}>
                          <td className="py-2 pr-4 font-medium" style={{ color:'#1F2937' }}>{P_SYMBOLS[p.name] || '•'} {p.name}{p.retrograde ? ' ℞' : ''}</td>
                          <td className="py-2 pr-4" style={{ color:'#4B5563' }}>{p.rashi}</td>
                          <td className="py-2 pr-4" style={{ color:'#4B5563' }}>{p.house}</td>
                          <td className="py-2 pr-4" style={{ color:'#4B5563' }}>{p.nakshatra}</td>
                          <td className="py-2" style={{ color:'#4B5563' }}>{p.nakshatraPada}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Personal planet-in-house meanings */}
              <div>
                <h3 className="text-base font-bold mb-1" style={{ color:TEAL }}>💡 Your Planets — Personal Impact</h3>
                <p className="text-xs mb-3" style={{ color: '#9CA3AF' }}>Each planet's nature, what it gives you, and what your specific placement means for your life right now.</p>
                <div className="space-y-3">
                  {reading.planets.map(p => {
                    // Nature of planet (benefic/malefic/neutral)
                    const NATURE: Record<string,string> = {
                      Sun: 'natural malefic — burns and purifies whatever it touches, but gives authority and soul strength',
                      Moon: 'natural benefic when waxing, mild malefic when waning — governs your emotional body and mind',
                      Mars: 'natural malefic — warrior energy that cuts, separates, and ignites courage',
                      Mercury: 'neutral — takes on the nature of planets around it; intellect and communication',
                      Jupiter: 'natural benefic — the great teacher and expander, gives wisdom and grace',
                      Venus: 'natural benefic — pleasure, beauty, desire, creative abundance',
                      Saturn: 'natural malefic — the strict taskmaster who delays but never denies; gives endurance',
                      Rahu: 'shadowy malefic — amplifies worldly desire, creates illusion and sudden gains',
                      Ketu: 'shadowy malefic — detaches from material, gives spiritual insight and past-life wisdom',
                    };
                    // What the planet gives (gifts it bestows)
                    const GIFTS: Record<string,string> = {
                      Sun: 'leadership ability, father blessings, government recognition, confidence, vitality',
                      Moon: 'emotional intelligence, intuition, public popularity, nurturing relationships, imagination',
                      Mars: 'physical courage, initiative, property gains, ability to fight and win, executive power',
                      Mercury: 'sharp intellect, communication skill, business acumen, analytical precision, adaptability',
                      Jupiter: 'wisdom, children, spiritual merit, wealth through dharma, long-term fortune',
                      Venus: 'beauty, romantic happiness, luxury, artistic talent, harmonious relationships',
                      Saturn: 'disciplined mastery, late-blooming career success, longevity, deep resilience',
                      Rahu: 'unconventional gains, foreign connections, technological edge, fame through disruption',
                      Ketu: 'spiritual liberation, past-life talents, healing gifts, psychic perception',
                    };
                    // House-specific personal meaning — full person-first language
                    const PERSONAL: Record<string,Record<number,string>> = {
                      Sun: {
                        1:'Your Sun sits in your own Lagna — you radiate authority that others notice immediately. You were born to lead, not follow. The challenge: ego can make you domineering. The gift: when you align your identity with your soul\'s dharma, doors open that stay closed for others.',
                        2:'Your Sun illuminates the house of wealth and speech. You earn through positions of authority and your voice carries weight. Family pride drives you — sometimes too hard. Watch: ego conflicts with close family. Gift: you accumulate steadily once you find work that gives you recognition.',
                        3:'Sun in your 3rd makes you bold in communication — a natural writer, speaker, or initiator. You charge ahead when others hesitate. Siblings may be rivals or absent. Your courage is real, not performed — use it in creative or media fields.',
                        4:'Sun in the 4th brings brightness to your home life but also conflict with the father or authority figures in early life. You may have changed homes or felt unsettled. Gift: in later years, you create a home that others look up to. Property and real estate favor you.',
                        5:'An excellent Sun placement — your intelligence is sharp and your firstborn carries special significance. You are creative, speculative, and drawn to leadership in education or the arts. Your confidence in self-expression is one of your greatest assets.',
                        6:'Sun in the 6th: you win battles others give up on. Government, legal, or health fields suit you. You may have faced health challenges early, but your constitution strengthens over time. Enemies underestimate you — and regret it.',
                        7:'Sun in the 7th burns the house of partnership. Your relationships are intense and power dynamics are frequent. You attract strong, sometimes domineering, partners. The lesson: true partnership requires you to let someone else lead sometimes. Late marriage or a strong, public-facing spouse is common.',
                        8:'Sun in the 8th gives you interest in the hidden — psychology, occult, legacy, insurance, research. Sudden transformations mark your life. There may be disruptions to father or the paternal lineage. Gift: you emerge from crisis stronger each time.',
                        9:'Sun in the 9th — a blessed placement for dharma, higher education, and fortune. Your father and teachers shape you profoundly. Philosophy and law may draw you. Fortune comes through honest, principled action. Travel to distant places opens key doors.',
                        10:'Sun in the 10th is a royal placement for career. Authority, recognition, and leadership define your professional life. Government, management, or any field requiring visibility suits you. Your reputation matters greatly — guard it carefully.',
                        11:'Sun in the 11th brings gains through powerful networks. Your elder siblings or influential friends open doors. Income grows in Sun dasha and transits. Your goals are big — and many of them materialize.',
                        12:'Sun in the 12th: you operate best behind the scenes or in foreign lands. Spiritual life or working in hospitals, ashrams, or overseas brings fulfillment. The ego must dissolve to access the gifts here — surrender is the path forward.',
                      },
                      Moon: {
                        1:'Moon in your Ascendant makes you emotionally expressive and highly sensitive to your environment — you absorb the mood of any room you enter. People feel comfortable around you. The challenge: moods fluctuate with lunar cycles and you can absorb others\' emotions like a sponge. Ground yourself daily.',
                        2:'Your Moon sits in the house of wealth and family. You have deep attachment to your family lineage and an instinctive ability to accumulate resources — though finances fluctuate. Your voice is naturally soothing. Food, home, and early childhood security are emotionally central to your life.',
                        3:'Moon in the 3rd makes you a natural communicator with an intuitive understanding of what people need to hear. Writing, counseling, or creative expression channels your emotional depth productively. Sibling relationships carry strong emotional weight in your life.',
                        4:'Moon in the 4th — one of the strongest placements. You have deep roots, a rich interior emotional world, and a powerful bond with your mother and homeland. Domestic happiness is central to your wellbeing. Real estate and land dealings are often favorable.',
                        5:'Moon in the 5th gives you an imaginative, emotionally intelligent mind. Children bring you deep joy. You may have a gift for teaching, creative arts, or speculation. Your intuition in romantic matters is strong — though emotional mood swings can complicate love life.',
                        6:'Moon in the 6th creates emotional sensitivity around health, work, and conflict. You may struggle with anxiety or digestive issues tied to stress. The gift: you are a natural healer and problem-solver who understands other people\'s pain acutely.',
                        7:'Moon in the 7th — you seek emotional security through partnerships. Your spouse may be nurturing, popular, or emotionally demonstrative. You attract many relationship opportunities. The caution: emotional dependency in relationships needs conscious management.',
                        8:'Moon in the 8th gives you an intense emotional interior — psychic flashes, vivid dreams, and an almost instinctual understanding of what people hide. Life brings sudden emotional upheavals, especially around mother or family. Over time, you become a repository of deep wisdom.',
                        9:'Moon in the 9th blesses you with devotion, fortune, and a deep inner connection to higher knowledge. Your mother may be philosophical or spiritually inclined. Long journeys — outer and inner — bring you emotional peace.',
                        10:'Moon in the 10th gives career through the public eye. You are emotionally invested in your reputation and professional standing. Popularity with the masses is possible. Careers in hospitality, real estate, public service, or media suit you well.',
                        11:'Moon in the 11th brings emotional fulfillment through community, friendships, and achieving personal goals. You have many connections. Income from diverse sources is likely. Elder sisters or maternal figures play a strong role in your network.',
                        12:'Moon in the 12th is the placement of rich dream life, emotional sensitivity to the unseen, and a deep need for solitude to recharge. Overseas living may bring peace. Spirituality and the inner life nourish you more than social validation.',
                      },
                      Mars: {
                        1:'Mars in your Ascendant makes you physically vital, assertive, and sometimes combative. You were born a warrior — quick to act, direct in speech, and hard to stop once committed. This is a Manglik placement. The gift: extraordinary initiative and courage that others admire. The challenge: impulsiveness and a tendency to create conflict where none is needed.',
                        2:'Mars in the 2nd house (Manglik placement): your speech can be sharp or harsh without realizing it. You build wealth through aggressive effort and may have financial ups and downs. Family disputes over money are possible. The gift: you can generate income in fields requiring boldness and risk.',
                        3:'Mars in the 3rd is an outstanding placement for courage, initiative, and media work. You charge at challenges headfirst. Writing, sports, military, or entrepreneurship suit you perfectly. Siblings may be competitive or physically active.',
                        4:'Mars in the 4th (Manglik): tensions at home, possible conflicts with the mother, and property disputes are themes. You may move residences multiple times. The gift: you build something lasting in real estate or create a home through sheer will.',
                        5:'Mars in the 5th gives competitive intelligence and drive for achievement. You excel in sports, debate, or technical fields. There may be delays or intensity around children. Your romantic nature is passionate — sometimes too intense for partners who want calm.',
                        6:'Mars in the 6th — an excellent placement. You destroy enemies, overcome illness, and thrive in competitive environments. Law, medicine, military, or sports are natural fits. You perform best under pressure.',
                        7:'Mars in the 7th (Manglik): the most discussed Manglik placement. Marriage carries intensity — passionate, driven, sometimes combative. You attract equally strong partners. The lesson is learning to channel Mars energy into shared goals rather than power struggles. Compatibility with another Manglik is traditional wisdom.',
                        8:'Mars in the 8th (Manglik): sudden events, transformations, and awareness of mortality are recurring themes. Surgery, accidents, or unexpected crises mark life chapters. The gift: enormous capacity for regeneration and interest in the hidden — research, occult, or transformational work.',
                        9:'Mars in the 9th creates a warrior dharma — you fight for your philosophy and beliefs. Sometimes aggressive with gurus or authority figures. You may travel to distant places in pursuit of truth. Courage in higher learning.',
                        10:'Mars in the 10th — an excellent career placement. You thrive in leadership, engineering, real estate, military, surgery, or competitive business. Recognition comes through bold action. Authority suits you; working under others chafes.',
                        11:'Mars in the 11th brings gains through bold action and powerful friendships. You have an intense, loyal friend circle. Gains through real estate, land, or leadership within groups are favored.',
                        12:'Mars in the 12th (Manglik): energy spent in hidden ways — foreign lands, private battles, spiritual intensity. There may be excessive expenditure or physical drain. The gift: deep inner strength, interest in the occult, and the capacity to fight invisible battles.',
                      },
                      Mercury: {
                        1:'Mercury in your Ascendant gives you a quick, restless, youthful energy. You think fast, communicate well, and adapt to any situation. People may underestimate your depth because of your light touch. Writing, teaching, or business are natural domains.',
                        2:'Mercury in the 2nd gives you persuasive, eloquent speech — a natural salesperson, teacher, or writer. Financial acumen is strong. You earn through your intellect and words. Family environment encouraged reading or debate.',
                        3:'Mercury in the 3rd is its natural home — exceptional communication, writing, and technical ability. Media, journalism, IT, or any field requiring precise expression suits you. Your mind works like a precision instrument.',
                        4:'Mercury in the 4th: intellectually stimulating home environment growing up. You think analytically about home, family, and emotional matters — sometimes too analytically. Real estate analysis or intellectual property connected to your homeland favors you.',
                        5:'Mercury in the 5th — sharp analytical and mathematical intelligence. Excellent for stock trading, education, creative writing, or children\'s fields. You express your mind creatively and inspire others intellectually.',
                        6:'Mercury in the 6th: you are a meticulous problem-solver who defeats challenges through analysis. Law, accounting, healthcare administration, or consulting suit you. You can be a fierce debater when the situation demands.',
                        7:'Mercury in the 7th: you attract intelligent, communicative partners and thrive in business partnerships. Legal contracts and agreements need careful attention. Your best relationships have strong intellectual chemistry.',
                        8:'Mercury in the 8th draws you to research, psychology, hidden knowledge, and transformation. You think deeply about death, inheritance, and the unseen. Excellent placement for investigators, researchers, or occult scholars.',
                        9:'Mercury in the 9th: your philosophy is intellectually grounded and your communication around higher knowledge is exceptional. Teaching, law, or philosophical writing suits you. Long-distance communication and travel support your growth.',
                        10:'Mercury in the 10th — strong career through intellect, communication, and writing. IT, media, education, consulting, or accounting: any field where the mind is the tool. Your reputation is tied to your intelligence.',
                        11:'Mercury in the 11th: gains through intellectual networks, writing, or media. Your friend circle is diverse and mentally stimulating. Multiple income streams through different intellectual pursuits.',
                        12:'Mercury in the 12th: you think deeply in private, often keeping your best insights to yourself. Foreign language ability, spiritual study, or working behind the scenes suits you. Dreams carry informational content for you.',
                      },
                      Jupiter: {
                        1:'Jupiter in your Ascendant is one of the most auspicious placements in Jyotish. You naturally radiate wisdom, optimism, and ethical energy. People trust you. Your body tends toward fullness. You are a natural teacher, advisor, or guide — often consulted even before you qualify.',
                        2:'Jupiter in the 2nd is a classical wealth yoga. Your family is learned or spiritually inclined. Your speech carries natural authority. You accumulate wealth, though the form it takes depends on the sign. Multiple income streams grow over time.',
                        3:'Jupiter in the 3rd: wisdom expressed through communication, writing, and teaching. Your siblings may be philosophical or successful. Courage in the service of dharma. Long-form writing, higher education communication, or advisory roles suit you.',
                        4:'Jupiter in the 4th — domestic happiness, a wise mother, property fortune, and a spiritually rich home environment. You may inherit land or build property wealth. Your home tends to be a gathering place for wise, good people.',
                        5:'Jupiter in the 5th — extremely auspicious. Exceptional intelligence, blessed children, strong spiritual merit from past lives, and creative talent. This placement can produce scholars, teachers, or deeply successful creative professionals. Your firstborn often brings great joy.',
                        6:'Jupiter in the 6th: wisdom in overcoming enemies, legal battles, and health challenges. Charitable work in service sectors. You defeat obstacles through grace rather than force. Healing, law, or social service is indicated.',
                        7:'Jupiter in the 7th — a blessed partnership house. Your spouse is likely wise, learned, or spiritually inclined. Marriages tends toward lasting and dharmic. Business partnerships also carry luck. Travel and foreign connections through partners.',
                        8:'Jupiter in the 8th: longevity is a classical result. Deep interest in philosophy of death, transformation, inheritance, and hidden wisdom. You may receive unexpected windfalls. Research and occult sciences are areas of mastery.',
                        9:'Jupiter in the 9th — the best placement for this planet. Supreme fortune, dharmic life, guru blessings, higher education, foreign travel for wisdom, philosophical clarity. Your father may be deeply influential. Luck flows through honest, righteous action.',
                        10:'Jupiter in the 10th — career in law, education, finance, counseling, or spiritual guidance. Recognition comes through wisdom and ethical conduct. Authority and public respect accumulate over time.',
                        11:'Jupiter in the 11th is one of the strongest wealth placements in classical Jyotish. All desires fulfilled over time. Gains through elder siblings, networks, and large organizations. Your friend circle is influential.',
                        12:'Jupiter in the 12th: moksha placement. Foreign residence or ashram life may bring peace. Charitable giving and spiritual practice bring the greatest fulfillment. Material wealth may be modest but inner richness is profound.',
                      },
                      Venus: {
                        1:'Venus in your Ascendant gives you natural charm, physical attractiveness, and artistic sensibility. Others are drawn to you. You have a refined taste in beauty, comfort, and social elegance. Relationships come easily — the deeper challenge is ensuring they have substance beneath the surface.',
                        2:'Venus in the 2nd blesses your family life and finances. Beautiful speaking voice, love of good food and luxury. Wealth through artistic, beauty-related, or feminine-associated fields. Family harmony is important to your wellbeing.',
                        3:'Venus in the 3rd: charm in communication, artistic expression, and creative media. Your writing or speaking carries beauty and persuasion. Younger siblings may be artistically gifted. Short journeys for pleasure are frequent.',
                        4:'Venus in the 4th: luxury in the home environment — beautiful residences, fine vehicles, and domestic happiness. Deep comfort in life. Your mother is likely beautiful or artistically inclined. Property dealings favor you.',
                        5:'Venus in the 5th — exceptional placement for romance, creativity, and artistic children. You have a natural talent for the arts. Romantic life is rich and pleasurable. Speculative ventures may yield gains. Creative expression is a core part of your identity.',
                        6:'Venus in the 6th: success in beauty industries, health, or service. Relationships can carry friction due to high standards or opposition from enemies. The gift: you turn obstacles into aesthetic experiences. Healing through beauty and art.',
                        7:'Venus in the 7th — its natural house. A charming, beautiful, or artistically talented spouse. Marriage is harmonious and pleasure-filled. Business partnerships in creative or luxury fields are favored. Social life is rich.',
                        8:'Venus in the 8th: intense, transformative romantic experiences. Possible inheritance through partnership. Deep sexual and creative energy. Interest in tantra, hidden arts, or transformational beauty. Life partnerships carry depth.',
                        9:'Venus in the 9th: fortune through art, beauty, and meaningful travel. A spiritual or philosophical quality to your aesthetic sense. Your dharma is expressed through beauty. Foreign cultures and travel enrich your creative life.',
                        10:'Venus in the 10th — career in arts, fashion, entertainment, diplomacy, or beauty-related fields. Social recognition comes naturally. Your professional image is refined and appealing. Female mentors or colleagues play a key role.',
                        11:'Venus in the 11th: love and luxury flow to you through social networks and fulfilled desires. Your friend circle is beautiful, artistic, and socially connected. Gains through creative or feminine-associated businesses.',
                        12:'Venus in the 12th: pleasures are private and spiritual. Foreign lands bring romantic or artistic fulfillment. Deep spiritual devotion through beauty and ritual. The inner life is rich with aesthetic pleasure.',
                      },
                      Saturn: {
                        1:'Saturn in your Ascendant has given you a serious, disciplined, sometimes heavy demeanor from birth. Others may have found you "old for your age." Life\'s early lessons came through the body — health or physical limitations. The gift: extraordinary endurance, self-discipline, and a capacity for sustained effort that outlasts everyone around you.',
                        2:'Saturn in the 2nd: wealth accumulates slowly but surely — this is the placement of late-blooming financial stability. Family may carry hardships or restrictions. Speech is careful and measured. Savings and steady investment outperform speculation for you.',
                        3:'Saturn in the 3rd: courage is earned through persistence, not naturally given. Communication may feel effortful, but once mastered becomes precise and powerful. Siblings may carry burden. Endurance in media, engineering, or technical fields pays off.',
                        4:'Saturn in the 4th: property delays, emotional restrictions in childhood, or a difficult relationship with the mother or homeland. You may have felt isolated growing up. Gift: eventual domestic stability that you build through sheer effort — and property that becomes a lasting legacy.',
                        5:'Saturn in the 5th: children may come late or after difficulty. Education requires more effort than peers, but your intellect — once built — is unusually disciplined and thorough. Speculative ventures are risky; avoid them. Your intelligence is slow to ignite but lasting.',
                        6:'Saturn in the 6th — one of its best placements. You outlast enemies through sheer endurance. Chronic health issues can be managed through discipline. Service, law, healthcare administration, or technical labor suits you. You defeat obstacles through patience.',
                        7:'Saturn in the 7th: marriage typically comes late or to a significantly older/younger partner. Your spouse may be serious, reserved, or carry responsibility. The marriage works better as a partnership of shared duty than passionate romance. Commitment deepens over decades.',
                        8:'Saturn in the 8th: longevity is strongly indicated — you are built to endure. Life brings chronic challenges but also slow, steady accumulation of hidden knowledge. Interest in ancient wisdom, psychology of death, and long-cycle transformation. Inheritance may be delayed.',
                        9:'Saturn in the 9th: your philosophy is hard-won through lived experience, not theory. Your relationship with your father or guru may carry difficulty or distance. Fortune comes through disciplined, patient adherence to dharma — not luck.',
                        10:'Saturn in the 10th — the classic career ascendancy placement. Slow start, late bloom, but eventual authority and lasting professional recognition. Government, law, administration, architecture, or engineering suit you. Your career peaks in the second half of life.',
                        11:'Saturn in the 11th: income is steady but not flashy. Elder friends and senior colleagues are reliable allies. Goals are achieved through sustained, methodical effort. Large networks support you quietly but powerfully over decades.',
                        12:'Saturn in the 12th: spiritual discipline, solitude, and service in hidden settings (hospitals, ashrams, overseas) bring the most fulfillment. Expenditure on charitable causes is favored. Liberation through renunciation and inner work.',
                      },
                      Rahu: {
                        1:'Rahu in your Ascendant creates an unusual, intense personality that defies easy categorization. You can be perceived as unconventional, foreign, or ahead of your time. There is often a quality of reinvention — you are not who you were ten years ago, and you won\'t be who you are now in another decade. The drive for worldly achievement is immense.',
                        2:'Rahu in the 2nd: unusual speech patterns, hypnotic communication, and unconventional approaches to wealth. Income may come through foreign, tech, or non-traditional sources. Family situations may be complex or unusual. Food habits or tastes may be foreign or unconventional.',
                        3:'Rahu in the 3rd: bold, boundary-pushing communication — media, technology, viral content, or unconventional creative work. You break conventions in writing or speech. Siblings may be unusual or foreign-connected. Short-distance travel and media fame are indicated.',
                        4:'Rahu in the 4th: restlessness at home, possible foreign property, or an unusual domestic situation. You may feel you never fully belong anywhere. The blessing: worldly ambition is great, and real estate dealings — especially overseas — can bring gains.',
                        5:'Rahu in the 5th: unconventional intelligence, interest in speculative or technological fields, and unusual romantic experiences. Children may come through unconventional means or be highly individual. Your creative output is edgy, original, and disruptive.',
                        6:'Rahu in the 6th — powerful for defeating enemies and competitors through unconventional means. Foreign service, technology, or non-traditional healthcare suits you. You often win through strategies no one expected.',
                        7:'Rahu in the 7th: karmic, intense partnerships. Your spouse may be from a different background, culture, or unusual circumstance. Foreign connection in marriage is common. The relationship carries strong karma — destined encounters that change you.',
                        8:'Rahu in the 8th: occult mastery, sudden transformations, and intense interest in hidden knowledge. Unexpected windfalls are possible. Life is marked by sudden, dramatic changes in direction. Research into the esoteric or underground is indicated.',
                        9:'Rahu in the 9th: unconventional spirituality, foreign guru, or non-traditional philosophy. You may reject established religion and create your own framework. Fortune through foreign connections or cutting-edge philosophical work.',
                        10:'Rahu in the 10th — worldly fame through technology, media, or unconventional career paths. You may rise to prominence in ways traditional people find surprising or disruptive. Foreign clients or international reach is common.',
                        11:'Rahu in the 11th: large gains, powerful international networks, and fulfilled worldly desires — though satisfaction is elusive because Rahu always wants more. Technology, foreign business, or media-related income streams are favored.',
                        12:'Rahu in the 12th: foreign residence, vivid dream life, spiritual confusion, and fascination with the hidden are hallmarks. Overseas living brings both liberation and restlessness. Healing through surrender to the unseen.',
                      },
                      Ketu: {
                        1:'Ketu in your Ascendant brings a spiritual, otherworldly quality to your personality — others may find you detached, mysterious, or difficult to read. You carry past-life wisdom that surfaces as unexplained knowing. The body may carry unusual or recurring symptoms. Spiritual practice grounds you like nothing else can.',
                        2:'Ketu in the 2nd: detachment from material accumulation, unusual speech (sometimes blunt or spiritually flavored), and possible family karmas to resolve. Wealth comes and goes without being held tightly. Past-life connection to the family of origin.',
                        3:'Ketu in the 3rd: psychic courage — you act on intuition rather than analysis. Past-life communication mastery resurfaces as writing or creative ability. Sibling connections carry karmic overtones.',
                        4:'Ketu in the 4th: emotional detachment from homeland or mother; a feeling of not quite belonging to your family of origin. This is often a past-life indicator of deep spiritual work. Home is found within, not in a physical place.',
                        5:'Ketu in the 5th: past-life spiritual merit manifests as unusual intelligence or intuitive genius. Children may be spiritually special or unusual. Detachment from ego-driven creativity opens the door to truly inspired work.',
                        6:'Ketu in the 6th: victory through spiritual means, alternative healing gifts, and the ability to overcome enemies by withdrawing rather than fighting. Karma from past service returns as practical support in this life.',
                        7:'Ketu in the 7th: karmic, spiritually charged relationships. Partnerships from past lives resurface. You may experience separation or dissolution in key relationships as Ketu completes old karma. The spiritual partner is more important than the conventional one.',
                        8:'Ketu in the 8th — past-life occult mastery, deep transformation, and direct experience of impermanence. You have lived through death-like experiences before (in this or previous lives) and carry profound, unshakeable equanimity.',
                        9:'Ketu in the 9th: an unconventional dharma path, detachment from established religion, and direct access to spiritual wisdom without formal structure. Your own experience is your most reliable guru.',
                        10:'Ketu in the 10th: detachment from worldly career ambition, often culminating in a pivot toward research, spirituality, or quiet expertise. The outer career may shift dramatically at some point — and the inner calling becomes louder.',
                        11:'Ketu in the 11th: spiritual gains, eventual detachment from desire fulfillment, and recognition that what you thought you wanted was never what you truly needed. Gains come through past-life karma rather than effort.',
                        12:'Ketu in the 12th — one of the best placements for liberation. Deep meditation, past-life attainment in spiritual practice, and a natural aptitude for moksha. Foreign or ashram environments bring peace. The veil between worlds is thin for you.',
                      },
                    };
                    const personalMeaning = PERSONAL[p.name]?.[p.house] || `${p.name} in House ${p.house} — this placement brings ${p.name}\'s energy to the themes of house ${p.house} in your personal life.`;
                    const nature = NATURE[p.name] || '';
                    const gifts = GIFTS[p.name] || '';
                    return (
                      <div key={p.name} className="rounded-xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
                        {/* Planet header */}
                        <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(26,107,107,0.06)' }}>
                          <span className="text-lg">{P_SYMBOLS[p.name]}</span>
                          <div className="flex-1">
                            <p className="text-xs font-bold" style={{ color: TEAL }}>
                              {p.name}{p.retrograde ? ' ℞' : ''} in {p.rashi} · House {p.house}
                              {p.retrograde && <span className="ml-1 text-[10px] font-normal" style={{ color: AMBER }}>(retrograde — internalized energy)</span>}
                            </p>
                          </div>
                        </div>
                        {/* Nature pill */}
                        <div className="px-3 pt-2">
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(212,136,10,0.1)', color: AMBER }}>
                            {p.name} is a {nature}
                          </span>
                        </div>
                        {/* Gifts row */}
                        <div className="px-3 pt-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#9CA3AF' }}>What {p.name} gives you</p>
                          <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>{gifts}</p>
                        </div>
                        {/* Personal meaning */}
                        <div className="px-3 pt-1.5 pb-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: TEAL }}>What this means for you personally</p>
                          <p className="text-sm leading-relaxed" style={{ color: '#1F2937' }}>{personalMeaning}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold mb-3" style={{ color:TEAL }}>🪷 Panchanga at Birth</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[['Tithi',reading.panchanga.tithi.name],['Nakshatra',reading.panchanga.nakshatra],['Yoga',reading.panchanga.yoga],
                    ['Karana',reading.panchanga.karana],['Day (Vara)',reading.panchanga.vara],['Atmakaraka',reading.atmakaraka.planet]
                  ].map(([k,v]) => <StatBadge key={k} label={k} value={v} />)}
                </div>
              </div>

              {/* Charts — constrained size */}
              <div>
                <h3 className="text-base font-bold mb-3" style={{ color:TEAL }}>📐 Vedic Chart</h3>
                <div className="max-w-sm mx-auto">
                  <VedicChart
                    planets={reading.planets.map(p=>({ name:p.name, rashi:p.rashi.split(' (')[1]?.replace(')','') || p.rashi, house:p.house, retrograde:p.retrograde }))}
                    ascendant={reading.lagnaSign.split(' (')[1]?.replace(')','') || reading.lagnaSign}
                    chartType={reading.chartType}
                  />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold mb-3" style={{ color:TEAL }}>⭕ Western Chart</h3>
                <div className="max-w-sm mx-auto">
                  <WesternChart
                    sunSign={reading.westernSunSign}
                    moonSign={reading.moonSign.split(' (')[1]?.replace(')','') || reading.moonSign}
                    risingSign={reading.lagnaSign.split(' (')[1]?.replace(')','') || reading.lagnaSign}
                    planets={reading.planets.map(p=>({ name:p.name, degree:p.siderealLongitude, sign:p.rashi.split(' (')[1]?.replace(')','') || 'Aries' }))}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === 'story' && (
            <div className="-m-5 sm:-m-6 rounded-2xl overflow-hidden">
              <StoryAnimator name={reading.name} gender={reading.gender} storyText={reading.storyNarrative} storyEvents={reading.storyEvents}
                lagnaSign={reading.lagnaSign} moonSign={reading.moonSign} sunSign={reading.sunSign}
                birthYear={birthYear} planets={reading.planets} currentDasha={reading.currentDasha} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dasha timeline bar */}
      {reading.dashaTimeline?.length > 0 && (
        <div className="rounded-2xl p-4 border space-y-3" style={{ background:'#FFFDF8', borderColor:'#E5E7EB' }}>
          <h3 className="text-sm font-bold" style={{ color:TEAL }}>📅 Your Life&apos;s Planetary Timeline</h3>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {reading.dashaTimeline.map((d) => {
              const isCurrent = d.planet === reading.currentDasha;
              const span = d.endYear - d.startYear;
              return (
                <div key={d.planet + d.startYear}
                  className="flex-shrink-0 rounded-lg px-2 py-1.5 text-center border"
                  style={{ minWidth:`${Math.max(span*3,48)}px`,
                    background: isCurrent ? `linear-gradient(135deg,${TEAL},${TEAL_L})` : 'rgba(26,107,107,0.05)',
                    borderColor: isCurrent ? TEAL : 'rgba(26,107,107,0.15)',
                    boxShadow: isCurrent ? '0 2px 8px rgba(26,107,107,0.25)' : 'none',
                  }}>
                  <p className="text-[10px] font-bold" style={{ color:isCurrent?'#fff':TEAL }}>{d.planet}</p>
                  <p className="text-[9px]" style={{ color:isCurrent?'rgba(255,255,255,0.7)':'#9CA3AF' }}>{d.startYear}–{d.endYear}</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs" style={{ color:'#6B7280' }}>
            Currently in <strong style={{ color:TEAL }}>{reading.currentDasha} Mahadasha</strong>
            {reading.currentAntardasha ? ` · ${reading.currentAntardasha} Antardasha` : ''}.
          </p>
        </div>
      )}

      {/* Tradition deep-dive cards */}
      <div className="space-y-3">

        {/* ── Egyptian Decan ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#FFFDF8', borderColor: '#E5E7EB' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(135deg, rgba(212,136,10,0.1), rgba(26,107,107,0.06))' }}>
            <span className="text-3xl">𓂀</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: AMBER }}>Egyptian Decan Reading</p>
              <p className="text-lg font-bold" style={{ color: '#1F2937' }}>{reading.egyptianDecan?.sign} · Decan {reading.egyptianDecan?.decanNumber}</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>Ruler: {reading.egyptianDecan?.ruler} · Deity: {reading.egyptianDecan?.deity}</p>
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Section 1 — Your Decan */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: TEAL }}>📜 Your Birth Decan — What the Temple Scribes Would Record</p>
              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                The ancient Egyptian sky was divided into 36 decans — 10-degree star segments that rose on the horizon every 40 minutes throughout the night. You were born under the <strong>{reading.egyptianDecan?.decanNumber === 1 ? 'first' : reading.egyptianDecan?.decanNumber === 2 ? 'second' : 'third'} decan of {reading.egyptianDecan?.sign}</strong>. The temple at Dendera records this decan as belonging to <strong>{reading.egyptianDecan?.ruler}</strong> and presided over by <strong>{reading.egyptianDecan?.deity}</strong>. In the Nut ceiling texts of the New Kingdom, those born under your decan were marked as carrying {reading.egyptianDecan?.ruler === 'Sun' ? 'the solar fire of Ra — authority, creative power, and the divine right to lead' : reading.egyptianDecan?.ruler === 'Moon' ? 'the Lunar wisdom of Thoth — intuition, cycles, and the keeper of sacred memory' : reading.egyptianDecan?.ruler === 'Mars' ? 'the warrior fire of Sekhmet — courage, battle instinct, and the destroyer of what is no longer needed' : reading.egyptianDecan?.ruler === 'Mercury' ? 'the scribal intelligence of Thoth — precision of mind, sacred language, and the ability to move between worlds' : reading.egyptianDecan?.ruler === 'Venus' ? 'the beauty of Hathor — artistic magnetism, pleasure, fertility, and the transformative power of love' : reading.egyptianDecan?.ruler === 'Saturn' ? 'the enduring stone of Ptah — builder of creation, keeper of structure, architect of what lasts across centuries' : 'the expansive wisdom of Amun — the hidden one whose breath animates all creation'}.
              </p>
            </div>

            {/* Section 2 — Your Ruler's impact on you */}
            <div className="rounded-xl p-3 border-l-4" style={{ background: 'rgba(212,136,10,0.05)', borderLeftColor: AMBER }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: AMBER }}>⚖️ How {reading.egyptianDecan?.ruler} Shapes Your Life</p>
              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                Your decan ruler <strong>{reading.egyptianDecan?.ruler}</strong> governs the core energies that animate you. In Egyptian cosmology, this planet-deity does not merely "influence" you — it <em>is</em> the divine principle that was active at your birth moment. Because {reading.egyptianDecan?.ruler} rules your decan, you carry{' '}
                {reading.egyptianDecan?.ruler === 'Sun' ? 'an inherent need for visibility and recognition. You cannot thrive in obscurity — your soul requires an audience. The challenge the Egyptians named for solar decan people: pride without purpose leads to the "second death," the death of the soul. When you place your authority in service of something greater than yourself, you become Ra incarnate — life-giving, illuminating, unstoppable.' :
                reading.egyptianDecan?.ruler === 'Moon' ? 'deep cyclical wisdom — you rise and fall with the moon\'s rhythms whether you acknowledge it or not. Your emotions are not a weakness; they are your oracle. The Egyptians taught lunar decan people to track their own cycles as a spiritual practice. Your intuition is more accurate than your analysis.' :
                reading.egyptianDecan?.ruler === 'Mars' ? 'the warrior principle: action, decisiveness, and the courage to cut what is diseased from your life. Mars decan people in Egypt were trained as soldiers or surgeons of the soul — those who remove what others fear to touch. Your impatience is a signal: you were built for movement, not waiting.' :
                reading.egyptianDecan?.ruler === 'Mercury' ? 'the sacred scribe\'s inheritance — a mind built to bridge worlds, decode symbols, and transmit meaning. Thoth-influenced people were Egypt\'s keepers of knowledge and the dead\'s guides through the underworld. You carry a version of this: the ability to make the complex understandable.' :
                reading.egyptianDecan?.ruler === 'Venus' ? 'Hathor\'s gift of magnetic beauty and creative fertility. This is not mere physical appearance — it is the ability to bring pleasure, harmony, and artistic order to whatever you touch. The challenge Hathor teaches: attachment to beauty and comfort can become the very trap that keeps you from evolving.' :
                reading.egyptianDecan?.ruler === 'Saturn' ? 'Ptah\'s energy — the divine craftsman who thought creation into existence and built the world through precision and structure. Saturn decan people move slowly but permanently. What you build lasts. The Egyptian understanding: Ptah people must create or they wither. Find your craft.' :
                'Jupiter-Amun\'s hidden, expansive grace — the power that moves mountains quietly. Jupiter decan people in Egypt were initiates in the mystery temples, those trusted to hold the deeper teaching. Your wisdom emerges in unexpected moments.'}
              </p>
            </div>

            {/* Section 3 — Your planets in Egyptian context */}
            <div className="rounded-xl p-3 border-l-4" style={{ background: 'rgba(26,107,107,0.05)', borderLeftColor: TEAL }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: TEAL }}>🌟 Your Chart Through Egyptian Eyes</p>
              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                The Egyptians read planetary positions through the lens of divine balance (Ma&apos;at). Your Ascendant in <strong>{reading.lagnaSign.split(' (')[0]}</strong> and Moon in <strong>{reading.moonSign.split(' (')[0]}</strong> speak to a soul whose core personality ({reading.lagnaSign.split(' (')[0]}) and emotional nature ({reading.moonSign.split(' (')[0]}) were shaped by the decan rulers of these signs. Your current dasha lord <strong>{reading.currentDasha}</strong> corresponds to the Egyptian deity{' '}
                {reading.currentDasha === 'Sun' ? 'Ra — the solar disk. You are in a period of Ra\'s direct influence: authority, visibility, and the burning away of all that is not authentically you. The Egyptians considered Ra dasha a crucible — uncomfortable but transformative.' :
                reading.currentDasha === 'Moon' ? 'Thoth and Isis — the lunar deities of wisdom and magic. This is a period of inner development, psychic opening, and emotional healing. The Egyptians saw lunar periods as sacred retreats — necessary before the next solar emergence.' :
                reading.currentDasha === 'Mars' ? 'Sekhmet and Horus the warrior — the lion-headed goddess of war and healing combined. Your Mars period demands decisive action and the courage to fight for what is rightfully yours.' :
                reading.currentDasha === 'Mercury' ? 'Thoth the scribe — the period of the mind, communication, and sacred knowledge. Egyptian priests used Mercury periods for advanced study, writing sacred texts, and learning divine languages.' :
                reading.currentDasha === 'Jupiter' ? 'Amun and Osiris — the great teachers. This is a period of expansion, wisdom, and dharmic growth. The Egyptians treated Jupiter periods as initiations into higher mysteries.' :
                reading.currentDasha === 'Venus' ? 'Hathor and Isis in her beautiful form — the period of love, beauty, and creative power. Enjoy this period fully, as it is one of the most pleasure-giving in the Egyptian cycle.' :
                'Anubis and Set — Saturn\'s Egyptian equivalents. This is the great test, the desert crossing. The Egyptians knew that Set\'s trials were the most demanding but produced the most enduring transformation. You are being tested and refined.'}
              </p>
            </div>

            {/* Traits strip */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#9CA3AF' }}>Your Egyptian Soul Traits</p>
              <div className="flex flex-wrap gap-1.5">
                {(reading.egyptianDecan?.traits || '').split(/[,.]/).filter(t => t.trim()).map(trait => (
                  <span key={trait} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(212,136,10,0.1)', color: '#92400E' }}>{trait.trim()}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Mayan Tzolkin ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#FFFDF8', borderColor: '#E5E7EB' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(135deg, rgba(26,107,107,0.08), rgba(212,136,10,0.05))' }}>
            <span className="text-3xl">☀️</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: AMBER }}>Mayan Tzolkin Calendar</p>
              <p className="text-lg font-bold" style={{ color: '#1F2937' }}>{reading.mayanTzolkin?.daySign}</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>Galactic Tone {reading.mayanTzolkin?.tone} of 13 · 260-day sacred cycle</p>
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Section 1 — Your Day Sign */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: TEAL }}>🌀 Your Day Sign — The Tzolkin Blueprint</p>
              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                The Mayan Tzolkin is a 260-day sacred calendar, the oldest continuously used calendar on Earth — still read by Daykeepers (Ajq'ij) in the Guatemalan highlands today. Your Day Sign is <strong>{reading.mayanTzolkin?.daySign}</strong>. This is not a sun sign or a moon sign — it is the vibrational quality of the day your soul chose to enter the world. The Daykeepers teach that you do not merely <em>have</em> this sign; you <em>are</em> this frequency. {reading.mayanTzolkin?.meaning}
              </p>
            </div>

            {/* Section 2 — Your Galactic Tone */}
            <div className="rounded-xl p-3 border-l-4" style={{ background: 'rgba(26,107,107,0.05)', borderLeftColor: TEAL }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: TEAL }}>🔢 Galactic Tone {reading.mayanTzolkin?.tone} — How Your Energy Operates</p>
              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                The 13 Galactic Tones define <em>how</em> your Day Sign energy moves through the world. Your Tone is <strong>{reading.mayanTzolkin?.tone}</strong> —{' '}
                {reading.mayanTzolkin?.tone === 1 ? 'the Tone of Unity and Magnetic Attraction. You draw toward you exactly what your soul needs — people, situations, and resources arrive unbidden. Your challenge: learning to receive what arrives rather than chasing what does not. In Mayan teaching, Tone 1 people are portals of new beginnings for their entire lineage.' :
                reading.mayanTzolkin?.tone === 2 ? 'the Tone of Duality and Polarization. You hold opposites in tension — this is your gift and your burden. You feel the pull of seemingly irreconcilable choices more acutely than most. The Daykeepers teach Tone 2 people that the tension is the teaching: both sides are true, and wisdom lives in holding both.' :
                reading.mayanTzolkin?.tone === 3 ? 'the Tone of Rhythm and Activation. You catalyze movement in others. Your presence accelerates what is already beginning to happen. The challenge: you generate so much activation that you sometimes outrun your own readiness. The Mayan teaching for Tone 3: pace yourself — the rhythm you create outlives the moment.' :
                reading.mayanTzolkin?.tone === 4 ? 'the Tone of Form and Definition. You give shape to abstract ideas and build structures that others can inhabit. The Daykeepers say Tone 4 people are the foundation stones of their communities — solid, reliable, load-bearing. The challenge: rigidity. When your structures no longer serve, your attachment to them can slow evolution.' :
                reading.mayanTzolkin?.tone === 5 ? 'the Tone of Empowerment and Radiance. You are a natural center of authority whose very presence empowers those around you. Tone 5 in the Tzolkin sits at the center of the first trecena (13-day wave) — the point of greatest power. The Daykeepers say Tone 5 people carry responsibility they did not ask for but cannot escape.' :
                reading.mayanTzolkin?.tone === 6 ? 'the Tone of Flow and Balance. You bring organic equilibrium to everything you touch — relationships, systems, and environments rebalance around you. The challenge: over-accommodation. The Mayan teaching: real balance sometimes requires disruptive honesty.' :
                reading.mayanTzolkin?.tone === 7 ? 'the Tone of Resonance and Mystical Power. The sacred number in Mayan cosmology. Tone 7 sits at the heart of the 13-day trecena — the most mystically potent position. You resonate at frequencies others can only dimly perceive. The Daykeepers treat Tone 7 people as sacred calibration instruments.' :
                reading.mayanTzolkin?.tone === 8 ? 'the Tone of Harmony and Integrity. You lead through example — your personal integrity, or lack of it, is disproportionately influential on those around you. The Mayan teaching for Tone 8: you cannot afford to live differently than you teach. The harmony you bring is only as deep as your own alignment.' :
                reading.mayanTzolkin?.tone === 9 ? 'the Tone of Intention and Completion. What you intend, you complete — though often much later than expected. The 9th position in the trecena is the first point of full manifestation. Daykeepers say Tone 9 people carry the weight of completion karma: things that others leave unfinished accumulate toward you.' :
                reading.mayanTzolkin?.tone === 10 ? 'the Tone of Manifestation. You take vision and make it real — production, materialization, and tangible creation are your domain. The Mayan teaching: Tone 10 people are the builders of the new world, but only if they overcome the fear of actually showing what they made.' :
                reading.mayanTzolkin?.tone === 11 ? 'the Tone of Liberation and Dissolution. You are the force that dissolves outdated structures so new life can emerge. This is uncomfortable energy — both for you and for those attached to the structures you dissolve. Daykeepers teach Tone 11 people to trust the destruction; it is always in service of something more alive.' :
                reading.mayanTzolkin?.tone === 12 ? 'the Tone of Understanding and Cooperation. You build bridges between seemingly incompatible worlds — people, ideas, and systems that could not connect without you. The challenge: spending yourself in service of others\' understanding at the expense of your own clarity.' :
                'Tone 13 — the Tone of Transcendence and Cosmic Presence. The final tone of the trecena. You carry the complete wave, all 13 energies, simultaneously. Daykeepers teach that Tone 13 people are living transmissions of the entire cosmic cycle — this is both an immense gift and an immense responsibility. You are here to complete what was begun long before you arrived.'}
              </p>
            </div>

            {/* Section 3 — Current planetary energy through Mayan lens */}
            <div className="rounded-xl p-3 border-l-4" style={{ background: 'rgba(212,136,10,0.05)', borderLeftColor: AMBER }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: AMBER }}>🌽 Your Current Life Cycle — The Mayan Perspective</p>
              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                In the Mayan Long Count calendar, you are living through a specific 52-year Calendar Round cycle that determines the broad texture of your life chapter. Your birth sign <strong>{reading.mayanTzolkin?.daySign}</strong> combined with Tone <strong>{reading.mayanTzolkin?.tone}</strong> creates a specific destiny energy the Daykeepers call your <em>kin</em>. Your current Vedic dasha lord <strong>{reading.currentDasha}</strong> maps to Mayan consciousness in this way: {reading.currentDasha === 'Sun' ? 'the Sun corresponds to Ahau — the Lord, Ancestor, and Light. You are in a period the Mayans called a "flowering" — your true self emerges fully now.' : reading.currentDasha === 'Moon' ? 'the Moon corresponds to Ix — the Jaguar Shaman, keeper of earth magic and feminine mysteries. This is a period of deep inner development and psychic emergence.' : reading.currentDasha === 'Mars' ? 'Mars maps to Kan — the Serpent of life force and kundalini power. This is a period of intense activation, physical vitality, and the rising of creative-sexual energy.' : reading.currentDasha === 'Mercury' ? 'Mercury maps to Eb — the Road and human journey, the accumulation of wisdom through experience. You are in a period of important learning and path clarification.' : reading.currentDasha === 'Jupiter' ? 'Jupiter corresponds to Men — the Eagle, the visionary who sees from high above. This period opens broad vision, philosophical expansion, and the ability to see your life from a higher perspective.' : reading.currentDasha === 'Venus' ? 'Venus maps to Lamat — the Star/Rabbit, abundance and the harmonics of beauty. This is a period of creative flowering, relationships, and the full expression of your gifts.' : 'Saturn maps to Muluc — the Offering and purification by water. This is the Mayan equivalent of the great testing — the period that clears karma and prepares you for the next cycle.'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Nakshatra Hall of Fame ── */}
        <div className="rounded-2xl p-5 border" style={{ background: '#FFFDF8', borderColor: '#E5E7EB' }}>
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">{NAKSHATRA_SYMBOL[reading.moonNakshatraName] || '⭐'}</span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: AMBER }}>{reading.moonNakshatraName} — Kindred Souls</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>Famous people born under your nakshatra</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {(NAKSHATRA_FAMOUS[reading.moonNakshatraName] || '').split(' · ').map(name => (
              <div key={name} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: TEAL }} />
                <p className="text-sm" style={{ color: '#374151' }}>{name}</p>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3 italic" style={{ color: '#9CA3AF' }}>
            You share the {reading.moonNakshatraName} cosmic frequency — {NAKSHATRA_QUALITY[reading.moonNakshatraName] || 'ancient wisdom and unique potential'}.
          </p>
        </div>
      </div>

      <div className="text-center pb-6">
        <p className="text-xs italic" style={{ color:'#9CA3AF' }}>
          ⚠️ For entertainment and information only. Consult a qualified astrologer for personal guidance.
        </p>
      </div>
    </motion.div>
  );
}
