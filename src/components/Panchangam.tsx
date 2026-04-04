'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const TEAL   = '#1A6B6B';
const AMBER  = '#D4880A';
const TEAL_L = '#2A8A8A';

// ─── Per-locale UI labels ─────────────────────────────────────────────────────
const LOCALE_LABELS: Record<string, {
  title: string; subtitle: string;
  tithi: string; nakshatra: string; yoga: string; karana: string;
  vara: string; samvatsara: string; masa: string;
  paksha: string; shukla: string; krishna: string;
  rahuKalam: string; gulikaKalam: string; yamaDandam: string;
  avoidTitle: string; rulingPlanet: string;
  muhurthamTitle: string; activityTitle: string;
  todayTab: string; muhurthamTab: string; guideTab: string;
  tithiDesc: string; nakshatraDesc: string; yogaDesc: string;
  karanaDesc: string; varaDesc: string; samvatsaraDesc: string;
  footerNote: string;
}> = {
  te: {
    title: 'Telugu Panchangam', subtitle: 'తెలుగు పంచాంగం',
    tithi: 'తిథి', nakshatra: 'నక్షత్రం', yoga: 'యోగం',
    karana: 'కరణం', vara: 'వారం', samvatsara: 'సంవత్సరం', masa: 'మాసం',
    paksha: 'పక్షం', shukla: 'శుక్ల పక్షం (Waxing Moon)', krishna: 'కృష్ణ పక్షం (Waning Moon)',
    rahuKalam: 'రాహు కాలం', gulikaKalam: 'గుళిక కాలం', yamaDandam: 'యమగండం',
    avoidTitle: '⚠️ అశుభ సమయాలు — Avoid These Times Today',
    rulingPlanet: "Today's Ruling Planet",
    muhurthamTitle: 'ముహూర్తం అంటే ఏమిటి?',
    activityTitle: 'శుభ కార్యక్రమ మార్గదర్శి',
    todayTab: '📅 నేటి పంచాంగం', muhurthamTab: '⭐ ముహూర్తాలు', guideTab: '📋 కార్యదర్శి',
    tithiDesc: 'చాంద్రమాన దినం — రోజు నాణ్యతను నిర్ణయిస్తుంది',
    nakshatraDesc: 'చంద్రుని నక్షత్రం — మనస్సు మరియు రోజు స్వభావం',
    yogaDesc: 'సూర్య+చంద్ర సంయోగం — శుభాశుభ నిర్ణయం',
    karanaDesc: 'అర్ధ తిథి — రోజుకు 2 కరణాలు',
    varaDesc: 'వారం — ప్రతి రోజు ఒక గ్రహం పాలిస్తుంది',
    samvatsaraDesc: '60 సంవత్సరాల చక్రంలో ప్రస్తుత సంవత్సరం',
    footerNote: '📜 సాధారణ మార్గదర్శకాలు. ముఖ్యమైన కార్యాలకు జ్యోతిష్య నిపుణుని సంప్రదించండి.',
  },
  ta: {
    title: 'Tamil Panchangam', subtitle: 'தமிழ் பஞ்சாங்கம்',
    tithi: 'திதி', nakshatra: 'நட்சத்திரம்', yoga: 'யோகம்',
    karana: 'கரணம்', vara: 'வாரம்', samvatsara: 'வருஷம்', masa: 'மாதம்',
    paksha: 'பக்ஷம்', shukla: 'சுக்ல பக்ஷம் (Waxing Moon)', krishna: 'கிருஷ்ண பக்ஷம் (Waning Moon)',
    rahuKalam: 'ராகு காலம்', gulikaKalam: 'குளிகை காலம்', yamaDandam: 'யமகண்டம்',
    avoidTitle: '⚠️ இன்று தவிர்க்க வேண்டிய நேரம்',
    rulingPlanet: 'இன்றைய கிரக அதிபதி',
    muhurthamTitle: 'முகூர்த்தம் என்றால் என்ன?',
    activityTitle: 'நல்ல நேர வழிகாட்டி',
    todayTab: '📅 இன்றைய பஞ்சாங்கம்', muhurthamTab: '⭐ முகூர்த்தம்', guideTab: '📋 செயல் வழிகாட்டி',
    tithiDesc: 'சந்திர தினம் — நாளின் தரத்தை நிர்ணயிக்கிறது',
    nakshatraDesc: 'சந்திரனின் நட்சத்திரம் — மனநிலையை பாதிக்கிறது',
    yogaDesc: 'சூரிய+சந்திர சேர்க்கை — நல்லது / கெட்டது',
    karanaDesc: 'அரை திதி — ஒரு நாளில் 2 கரணங்கள்',
    varaDesc: 'கிழமை — ஒவ்வொரு நாளும் ஒரு கிரகம் ஆளுகிறது',
    samvatsaraDesc: '60 ஆண்டு சுழற்சியில் தற்போதைய ஆண்டு',
    footerNote: '📜 பொது வழிகாட்டுதல்கள். முக்கிய நிகழ்வுகளுக்கு ஜோதிட நிபுணரை ஆலோசிக்கவும்.',
  },
  kn: {
    title: 'Kannada Panchanga', subtitle: 'ಕನ್ನಡ ಪಂಚಾಂಗ',
    tithi: 'ತಿಥಿ', nakshatra: 'ನಕ್ಷತ್ರ', yoga: 'ಯೋಗ',
    karana: 'ಕರಣ', vara: 'ವಾರ', samvatsara: 'ಸಂವತ್ಸರ', masa: 'ಮಾಸ',
    paksha: 'ಪಕ್ಷ', shukla: 'ಶುಕ್ಲ ಪಕ್ಷ (Waxing Moon)', krishna: 'ಕೃಷ್ಣ ಪಕ್ಷ (Waning Moon)',
    rahuKalam: 'ರಾಹು ಕಾಲ', gulikaKalam: 'ಗುಳಿಕ ಕಾಲ', yamaDandam: 'ಯಮಗಂಡ',
    avoidTitle: '⚠️ ಇಂದು ತಪ್ಪಿಸಬೇಕಾದ ಸಮಯಗಳು',
    rulingPlanet: 'ಇಂದಿನ ಆಳ್ವಿಕೆ ಗ್ರಹ',
    muhurthamTitle: 'ಮುಹೂರ್ತ ಎಂದರೇನು?',
    activityTitle: 'ಶುಭ ಕಾರ್ಯ ಮಾರ್ಗದರ್ಶಿ',
    todayTab: '📅 ಇಂದಿನ ಪಂಚಾಂಗ', muhurthamTab: '⭐ ಮುಹೂರ್ತ', guideTab: '📋 ಕಾರ್ಯ ಮಾರ್ಗದರ್ಶಿ',
    tithiDesc: 'ಚಂದ್ರ ದಿನ — ದಿನದ ಗುಣಮಟ್ಟವನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ',
    nakshatraDesc: 'ಚಂದ್ರನ ನಕ್ಷತ್ರ — ಮನಸ್ಥಿತಿ ಮತ್ತು ದಿನದ ಸ್ವಭಾವ',
    yogaDesc: 'ಸೂರ್ಯ+ಚಂದ್ರ ಸಂಯೋಜನೆ — ಮಂಗಳ/ಅಮಂಗಳ',
    karanaDesc: 'ಅರ್ಧ ತಿಥಿ — ಒಂದು ದಿನದಲ್ಲಿ 2 ಕರಣಗಳು',
    varaDesc: 'ವಾರ — ಪ್ರತಿ ದಿನ ಒಂದು ಗ್ರಹದ ಆಳ್ವಿಕೆ',
    samvatsaraDesc: '60 ವರ್ಷ ಚಕ್ರದಲ್ಲಿ ಪ್ರಸ್ತುತ ವರ್ಷ',
    footerNote: '📜 ಸಾಮಾನ್ಯ ಮಾರ್ಗದರ್ಶಿ. ಮುಖ್ಯ ಕಾರ್ಯಗಳಿಗೆ ಜ್ಯೋತಿಷ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
  },
  ml: {
    title: 'Malayalam Panchangam', subtitle: 'മലയാളം പഞ്ചാംഗം',
    tithi: 'തിഥി', nakshatra: 'നക്ഷത്രം', yoga: 'യോഗം',
    karana: 'കരണം', vara: 'വാരം', samvatsara: 'സംവത്സരം', masa: 'മാസം',
    paksha: 'പക്ഷം', shukla: 'ശുക്ല പക്ഷം (Waxing Moon)', krishna: 'കൃഷ്ണ പക്ഷം (Waning Moon)',
    rahuKalam: 'രാഹു കാലം', gulikaKalam: 'ഗുളിക കാലം', yamaDandam: 'യമഗണ്ഡം',
    avoidTitle: '⚠️ ഇന്ന് ഒഴിവാക്കേണ്ട സമയങ്ങൾ',
    rulingPlanet: 'ഇന്നത്തെ ഗ്രഹം',
    muhurthamTitle: 'മുഹൂർത്തം എന്നാൽ എന്ത്?',
    activityTitle: 'ശുഭ കർമ്മ മാർഗദർശി',
    todayTab: '📅 ഇന്നത്തെ പഞ്ചാംഗം', muhurthamTab: '⭐ മുഹൂർത്തം', guideTab: '📋 കർമ്മ മാർഗദർശി',
    tithiDesc: 'ചാന്ദ്ര ദിനം — ദിവസത്തിന്റെ ഗുണനിലവാരം നിർണ്ണയിക്കുന്നു',
    nakshatraDesc: 'ചന്ദ്രന്റെ നക്ഷത്രം — മനോഭാവത്തെ ബാധിക്കുന്നു',
    yogaDesc: 'സൂര്യ+ചന്ദ്ര സംയോഗം — ശുഭ/അശുഭ നിർണ്ണയം',
    karanaDesc: 'അർദ്ധ തിഥി — ഒരു ദിവസത്തിൽ 2 കരണങ്ങൾ',
    varaDesc: 'ആഴ്ചദിവസം — ഓരോ ദിവസവും ഒരു ഗ്രഹം ഭരിക്കുന്നു',
    samvatsaraDesc: '60 വർഷ ചക്രത്തിലെ ഇപ്പോഴത്തെ വർഷം',
    footerNote: '📜 പൊതു മാർഗനിർദ്ദേശങ്ങൾ. പ്രധാന കാര്യങ്ങൾക്ക് ജ്യോതിഷ വിദഗ്ധനെ സമീപിക്കുക.',
  },
  hi: {
    title: 'Hindi Panchang', subtitle: 'हिन्दी पंचांग',
    tithi: 'तिथि', nakshatra: 'नक्षत्र', yoga: 'योग',
    karana: 'करण', vara: 'वार', samvatsara: 'संवत्सर', masa: 'मास',
    paksha: 'पक्ष', shukla: 'शुक्ल पक्ष (Waxing Moon)', krishna: 'कृष्ण पक्ष (Waning Moon)',
    rahuKalam: 'राहु काल', gulikaKalam: 'गुलिका काल', yamaDandam: 'यमगण्ड',
    avoidTitle: '⚠️ आज इन समयों से बचें',
    rulingPlanet: 'आज का स्वामी ग्रह',
    muhurthamTitle: 'मुहूर्त क्या है?',
    activityTitle: 'शुभ कार्य मार्गदर्शिका',
    todayTab: '📅 आज का पंचांग', muhurthamTab: '⭐ मुहूर्त', guideTab: '📋 कार्य मार्गदर्शिका',
    tithiDesc: 'चंद्र दिन — दिन की गुणवत्ता तय करता है',
    nakshatraDesc: 'चंद्रमा का नक्षत्र — मनोदशा को प्रभावित करता है',
    yogaDesc: 'सूर्य+चंद्र संयोग — शुभ/अशुभ निर्धारण',
    karanaDesc: 'अर्ध तिथि — एक दिन में 2 करण',
    varaDesc: 'वार — हर दिन एक ग्रह का शासन',
    samvatsaraDesc: '60 वर्ष चक्र में वर्तमान वर्ष',
    footerNote: '📜 सामान्य मार्गदर्शिका। महत्वपूर्ण कार्यों के लिए ज्योतिष विशेषज्ञ से परामर्श करें।',
  },
  mr: {
    title: 'Marathi Panchang', subtitle: 'मराठी पंचांग',
    tithi: 'तिथी', nakshatra: 'नक्षत्र', yoga: 'योग',
    karana: 'करण', vara: 'वार', samvatsara: 'संवत्सर', masa: 'मास',
    paksha: 'पक्ष', shukla: 'शुक्ल पक्ष (Waxing Moon)', krishna: 'कृष्ण पक्ष (Waning Moon)',
    rahuKalam: 'राहू काळ', gulikaKalam: 'गुलिक काळ', yamaDandam: 'यमगंड',
    avoidTitle: '⚠️ आज हे वेळ टाळा',
    rulingPlanet: 'आजचा स्वामी ग्रह',
    muhurthamTitle: 'मुहूर्त म्हणजे काय?',
    activityTitle: 'शुभ कार्य मार्गदर्शक',
    todayTab: '📅 आजचे पंचांग', muhurthamTab: '⭐ मुहूर्त', guideTab: '📋 कार्य मार्गदर्शक',
    tithiDesc: 'चंद्र दिन — दिवसाचा दर्जा ठरवतो',
    nakshatraDesc: 'चंद्राचे नक्षत्र — मनःस्थितीवर परिणाम करते',
    yogaDesc: 'सूर्य+चंद्र संयोग — शुभ/अशुभ निर्धारण',
    karanaDesc: 'अर्ध तिथी — एका दिवसात 2 करण',
    varaDesc: 'वार — प्रत्येक दिवस एका ग्रहाच्या अधीन',
    samvatsaraDesc: '60 वर्षांच्या चक्रातील सध्याचे वर्ष',
    footerNote: '📜 सामान्य मार्गदर्शक. महत्त्वाच्या कार्यांसाठी ज्योतिष तज्ज्ञांशी सल्लामसलत करा.',
  },
  bn: {
    title: 'Bengali Panjika', subtitle: 'বাংলা পঞ্জিকা',
    tithi: 'তিথি', nakshatra: 'নক্ষত্র', yoga: 'যোগ',
    karana: 'করণ', vara: 'বার', samvatsara: 'সংবৎসর', masa: 'মাস',
    paksha: 'পক্ষ', shukla: 'শুক্লপক্ষ (Waxing Moon)', krishna: 'কৃষ্ণপক্ষ (Waning Moon)',
    rahuKalam: 'রাহুকাল', gulikaKalam: 'গুলিক কাল', yamaDandam: 'যমগণ্ড',
    avoidTitle: '⚠️ আজ এই সময়গুলি এড়িয়ে চলুন',
    rulingPlanet: 'আজকের শাসক গ্রহ',
    muhurthamTitle: 'মুহূর্ত কী?',
    activityTitle: 'শুভ কাজের নির্দেশিকা',
    todayTab: '📅 আজকের পঞ্জিকা', muhurthamTab: '⭐ মুহূর্ত', guideTab: '📋 কার্য নির্দেশিকা',
    tithiDesc: 'চান্দ্র দিন — দিনের গুণমান নির্ধারণ করে',
    nakshatraDesc: 'চন্দ্রের নক্ষত্র — মেজাজ ও দিনের প্রকৃতিকে প্রভাবিত করে',
    yogaDesc: 'সূর্য+চন্দ্র সংযোগ — শুভ/অশুভ নির্ধারণ',
    karanaDesc: 'অর্ধ তিথি — প্রতিদিন ২টি করণ',
    varaDesc: 'বার — প্রতিদিন একটি গ্রহ শাসন করে',
    samvatsaraDesc: '৬০ বছরের চক্রে বর্তমান বছর',
    footerNote: '📜 সাধারণ নির্দেশিকা। গুরুত্বপূর্ণ কাজের জন্য জ্যোতিষ বিশেষজ্ঞের পরামর্শ নিন।',
  },
  pa: {
    title: 'Punjabi Panchang', subtitle: 'ਪੰਜਾਬੀ ਪੰਚਾਂਗ',
    tithi: 'ਤਿਥਿ', nakshatra: 'ਨਕਸ਼ਤਰ', yoga: 'ਯੋਗ',
    karana: 'ਕਰਣ', vara: 'ਵਾਰ', samvatsara: 'ਸੰਵਤਸਰ', masa: 'ਮਹੀਨਾ',
    paksha: 'ਪੱਖ', shukla: 'ਸ਼ੁਕਲ ਪੱਖ (Waxing Moon)', krishna: 'ਕ੍ਰਿਸ਼ਨ ਪੱਖ (Waning Moon)',
    rahuKalam: 'ਰਾਹੂ ਕਾਲ', gulikaKalam: 'ਗੁਲਿਕ ਕਾਲ', yamaDandam: 'ਯਮਗੰਡ',
    avoidTitle: '⚠️ ਅੱਜ ਇਹ ਸਮੇਂ ਤੋਂ ਬਚੋ',
    rulingPlanet: 'ਅੱਜ ਦਾ ਸ਼ਾਸਕ ਗ੍ਰਹਿ',
    muhurthamTitle: 'ਮੁਹੂਰਤ ਕੀ ਹੈ?',
    activityTitle: 'ਸ਼ੁਭ ਕਾਰਜ ਮਾਰਗਦਰਸ਼ਕ',
    todayTab: '📅 ਅੱਜ ਦਾ ਪੰਚਾਂਗ', muhurthamTab: '⭐ ਮੁਹੂਰਤ', guideTab: '📋 ਕਾਰਜ ਮਾਰਗਦਰਸ਼ਕ',
    tithiDesc: 'ਚੰਦਰ ਦਿਨ — ਦਿਨ ਦੀ ਗੁਣਵੱਤਾ ਨਿਰਧਾਰਿਤ ਕਰਦਾ ਹੈ',
    nakshatraDesc: 'ਚੰਦਰਮਾ ਦਾ ਨਕਸ਼ਤਰ — ਮਨੋਦਸ਼ਾ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕਰਦਾ ਹੈ',
    yogaDesc: 'ਸੂਰਜ+ਚੰਦਰ ਸੰਯੋਗ — ਸ਼ੁਭ/ਅਸ਼ੁਭ ਨਿਰਧਾਰਣ',
    karanaDesc: 'ਅਰਧ ਤਿਥਿ — ਇੱਕ ਦਿਨ ਵਿੱਚ 2 ਕਰਣ',
    varaDesc: 'ਵਾਰ — ਹਰ ਦਿਨ ਇੱਕ ਗ੍ਰਹਿ ਦਾ ਸ਼ਾਸਨ',
    samvatsaraDesc: '60 ਸਾਲਾਂ ਦੇ ਚੱਕਰ ਵਿੱਚ ਮੌਜੂਦਾ ਸਾਲ',
    footerNote: '📜 ਸਾਮਾਨਿਕ ਮਾਰਗਦਰਸ਼ਕ। ਮਹੱਤਵਪੂਰਨ ਕਾਰਜਾਂ ਲਈ ਜੋਤਿਸ਼ ਮਾਹਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।',
  },
  gu: {
    title: 'Gujarati Panchang', subtitle: 'ગુજરાતી પંચાંગ',
    tithi: 'તિથિ', nakshatra: 'નક્ષત્ર', yoga: 'યોગ',
    karana: 'કરણ', vara: 'વાર', samvatsara: 'સંવત્સર', masa: 'મહિનો',
    paksha: 'પક્ષ', shukla: 'શુક્લ પક્ષ (Waxing Moon)', krishna: 'કૃષ્ણ પક્ષ (Waning Moon)',
    rahuKalam: 'રાહુ કાળ', gulikaKalam: 'ગુળિક કાળ', yamaDandam: 'યમઘંટ',
    avoidTitle: '⚠️ આજે આ સમય ટાળો',
    rulingPlanet: 'આજનો સ્વામી ગ્રહ',
    muhurthamTitle: 'મુહૂર્ત એટલે શું?',
    activityTitle: 'શુભ કાર્ય માર્ગદર્શિકા',
    todayTab: '📅 આજનું પંચાંગ', muhurthamTab: '⭐ મુહૂર્ત', guideTab: '📋 કાર્ય માર્ગદર્શિકા',
    tithiDesc: 'ચાંદ્ર દિવસ — દિવસની ગુણવત્તા નક્કી કરે',
    nakshatraDesc: 'ચંદ્રનું નક્ષત્ર — મનોદશા અને દિવસના સ્વભાવ',
    yogaDesc: 'સૂર્ય+ચંદ્ર સંયોગ — શુભ/અશુભ નિર્ધારણ',
    karanaDesc: 'અર્ધ તિથિ — એક દિવસમાં 2 કરણ',
    varaDesc: 'વાર — દરેક દિવસ એક ગ્રહ ચલાવે',
    samvatsaraDesc: '60 વર્ષના ચક્રમાં વર્તમાન વર્ષ',
    footerNote: '📜 સામાન્ય માર્ગદર્શિકા. મહત્ત્વના કાર્ય માટે જ્યોતિષ નિષ્ણાતની સલાહ લો.',
  },
};

const EN_LABELS = {
  title: 'Panchangam', subtitle: '🪔 Daily Vedic Calendar',
  tithi: 'Tithi', nakshatra: 'Nakshatra', yoga: 'Yoga',
  karana: 'Karana', vara: 'Vara (Weekday)', samvatsara: 'Samvatsara', masa: 'Month',
  paksha: 'Paksha', shukla: 'Shukla Paksha (Waxing Moon)', krishna: 'Krishna Paksha (Waning Moon)',
  rahuKalam: 'Rahu Kalam', gulikaKalam: 'Gulika Kalam', yamaDandam: 'Yama Gandam',
  avoidTitle: '⚠️ Avoid These Times Today',
  rulingPlanet: "Today's Ruling Planet",
  muhurthamTitle: 'What is a Muhurtham?',
  activityTitle: 'Auspicious Activity Guide',
  todayTab: "📅 Today's Panchang", muhurthamTab: '⭐ Muhurthams', guideTab: '📋 Activity Guide',
  tithiDesc: 'Lunar day — governs the quality of the day',
  nakshatraDesc: "Moon's star — affects mood & nature of day",
  yogaDesc: 'Sun+Moon combination — auspiciousness level',
  karanaDesc: 'Half tithi — 2 per day, affects activity quality',
  varaDesc: 'Weekday — each day ruled by a planet',
  samvatsaraDesc: 'Current year in the 60-year cycle',
  footerNote: '📜 General guidelines from classical Panchangam texts. For major life events consult a qualified Jyotisha expert.',
};

// ─── Calendar data — locale variants ─────────────────────────────────────────
const SAMVATSARAS_BY_LOCALE: Record<string, string[]> = {
  te: ['ప్రభవ','విభవ','శుక్ల','ప్రమోదూత','ప్రజోత్పత్తి','ఆంగీరస','శ్రీముఖ','భావ','యువ','ధాత','ఈశ్వర','బహుధాన్య','ప్రమాది','విక్రమ','వృష','చిత్రభాను','సుభాను','తారణ','పార్థివ','వ్యయ','సర్వజిత్','సర్వధారి','విరోధి','వికృతి','ఖర','నందన','విజయ','జయ','మన్మథ','దుర్ముఖి','హేవిళంబి','విళంబి','వికారి','శార్వరి','ప్లవ','శుభకృత్','శోభకృత్','క్రోధి','విశ్వావసు','పరాభవ','ప్లవంగ','కీలక','సౌమ్య','సాధారణ','విరోధికృత్','పరిధావి','ప్రమాదీచ','ఆనంద','రాక్షస','నల','పింగళ','కాళయుక్తి','సిద్ధార్థి','రౌద్ర','దుర్మతి','దుందుభి','రుధిరోద్గారి','రక్తాక్షి','క్రోధన','అక్షయ'],
  ta: ['பிரபவ','விபவ','சுக்ல','பிரமோதூத','பிரஜோத்பத்தி','ஆங்கீரஸ','ஸ்ரீமுக','பாவ','யுவ','தாத','ஈஸ்வர','பஹுதான்ய','பிரமாதி','விக்ரம','விருஷ','சித்திரபாணு','சுபாணு','தாரண','பார்த்திவ','வியய','சர்வஜித்','சர்வதாரி','விரோதி','விக்ருதி','கர','நந்தன','விஜய','ஜய','மன்மத','துர்முகி','ஹேவிளம்பி','விளம்பி','விகாரி','சார்வரி','பிலவ','சுபக்ருத்','சோபக்ருத்','க்ரோதி','விஸ்வாவஸு','பராபவ','பிலவங்க','கீலக','சௌம்ய','சாதாரண','விரோதிக்ருத்','பரிதாவி','பிரமாதீச','ஆனந்த','ராக்ஷஸ','நள','பிங்கள','காளயுக்தி','சித்தார்த்தி','ரௌத்ர','துர்மதி','துந்துபி','ருதிரோத்காரி','ரக்தாக்ஷி','க்ரோதன','அக்ஷய'],
  kn: ['ಪ್ರಭವ','ವಿಭವ','ಶುಕ್ಲ','ಪ್ರಮೋದೂತ','ಪ್ರಜೋತ್ಪತ್ತಿ','ಆಂಗೀರಸ','ಶ್ರೀಮುಖ','ಭಾವ','ಯುವ','ಧಾತ','ಈಶ್ವರ','ಬಹುಧಾನ್ಯ','ಪ್ರಮಾದಿ','ವಿಕ್ರಮ','ವೃಷ','ಚಿತ್ರಭಾನು','ಸುಭಾನು','ತಾರಣ','ಪಾರ್ಥಿವ','ವ್ಯಯ','ಸರ್ವಜಿತ್','ಸರ್ವಧಾರಿ','ವಿರೋಧಿ','ವಿಕೃತಿ','ಖರ','ನಂದನ','ವಿಜಯ','ಜಯ','ಮನ್ಮಥ','ದುರ್ಮುಖಿ','ಹೇವಿಳಂಬಿ','ವಿಳಂಬಿ','ವಿಕಾರಿ','ಶಾರ್ವರಿ','ಪ್ಲವ','ಶುಭಕೃತ್','ಶೋಭಕೃತ್','ಕ್ರೋಧಿ','ವಿಶ್ವಾವಸು','ಪರಾಭವ','ಪ್ಲವಂಗ','ಕೀಲಕ','ಸೌಮ್ಯ','ಸಾಧಾರಣ','ವಿರೋಧಿಕೃತ್','ಪರಿಧಾವಿ','ಪ್ರಮಾದೀಚ','ಆನಂದ','ರಾಕ್ಷಸ','ನಳ','ಪಿಂಗಳ','ಕಾಳಯುಕ್ತಿ','ಸಿದ್ಧಾರ್ಥಿ','ರೌದ್ರ','ದುರ್ಮತಿ','ದುಂದುಭಿ','ರುಧಿರೋದ್ಗಾರಿ','ರಕ್ತಾಕ್ಷಿ','ಕ್ರೋಧನ','ಅಕ್ಷಯ'],
  ml: ['പ്രഭവ','വിഭവ','ശുക്ല','പ്രമോദൂത','പ്രജോത്പത്തി','ആംഗീരസ','ശ്രീമുഖ','ഭാവ','യുവ','ധാത','ഈശ്വര','ബഹുധാന്യ','പ്രമാദി','വിക്രമ','വൃഷ','ചിത്രഭാനു','സുഭാനു','താരണ','പാർഥിവ','വ്യയ','സർവജിത്','സർവധാരി','വിരോധി','വിക്രുതി','ഖര','നന്ദന','വിജയ','ജയ','മന്മഥ','ദുർമ്മുഖി','ഹേവിളംബി','വിളംബി','വികാരി','ശാർവരി','പ്ലവ','ശുഭകൃത്','ശോഭകൃത്','ക്രോധി','വിശ്വാവസു','പരാഭവ','പ്ലവംഗ','കീലക','സൗമ്യ','സാധാരണ','വിരോധിക്ൃത്','പരിധാവി','പ്രമാദീച','ആനന്ദ','രാക്ഷസ','നള','പിംഗള','കാളയുക്തി','സിദ്ധാർഥി','രൗദ്ര','ദുർമതി','ദുന്ദുഭി','രുധിരോദ്ഗാരി','രക്താക്ഷി','ക്രോധന','അക്ഷയ'],
  hi: ['प्रभव','विभव','शुक्ल','प्रमोदूत','प्रजोत्पत्ति','आंगीरस','श्रीमुख','भाव','युव','धात','ईश्वर','बहुधान्य','प्रमादि','विक्रम','वृष','चित्रभानु','सुभानु','तारण','पार्थिव','व्यय','सर्वजित','सर्वधारि','विरोधि','विकृति','खर','नंदन','विजय','जय','मन्मथ','दुर्मुखि','हेविळंबि','विळंबि','विकारि','शार्वरि','प्लव','शुभकृत','शोभकृत','क्रोधि','विश्वावसु','पराभव','प्लवंग','कीलक','सौम्य','साधारण','विरोधिकृत','परिधावि','प्रमादीच','आनंद','राक्षस','नल','पिंगल','काळयुक्ति','सिद्धार्थि','रौद्र','दुर्मति','दुंदुभि','रुधिरोद्गारि','रक्ताक्षि','क्रोधन','अक्षय'],
  mr: ['प्रभव','विभव','शुक्ल','प्रमोदूत','प्रजोत्पत्ति','आंगीरस','श्रीमुख','भाव','युव','धात','ईश्वर','बहुधान्य','प्रमादि','विक्रम','वृष','चित्रभानु','सुभानु','तारण','पार्थिव','व्यय','सर्वजित','सर्वधारि','विरोधि','विकृति','खर','नंदन','विजय','जय','मन्मथ','दुर्मुखि','हेविळंबि','विळंबि','विकारि','शार्वरि','प्लव','शुभकृत','शोभकृत','क्रोधि','विश्वावसु','पराभव','प्लवंग','कीलक','सौम्य','साधारण','विरोधिकृत','परिधावि','प्रमादीच','आनंद','राक्षस','नल','पिंगल','काळयुक्ति','सिद्धार्थि','रौद्र','दुर्मति','दुंदुभि','रुधिरोद्गारि','रक्ताक्षि','क्रोधन','अक्षय'],
  en: ['Prabhava','Vibhava','Shukla','Pramoduta','Prajotpatti','Angirasa','Srimukha','Bhava','Yuva','Dhata','Ishwara','Bahudhanya','Pramadi','Vikrama','Vrisha','Chitrabhanu','Subhanu','Tarana','Parthiva','Vyaya','Sarvajit','Sarvadharin','Virodhi','Vikruti','Khara','Nandana','Vijaya','Jaya','Manmatha','Durmukhi','Hevilambi','Vilambi','Vikari','Sharvari','Plava','Shubhakrut','Shobhakrut','Krodhi','Vishwavasu','Parabhava','Plavanga','Keelaka','Saumya','Sadharan','Virodhikrut','Paridhavi','Pramadeecha','Ananda','Rakshasa','Nala','Pingala','Kalayukthi','Siddharthi','Raudra','Durmathi','Dundubhi','Rudhirodhgari','Raktakshi','Krodhana','Akshaya'],
};

const MASAS_BY_LOCALE: Record<string, string[]> = {
  te: ['చైత్రం','వైశాఖం','జ్యేష్ఠం','ఆషాఢం','శ్రావణం','భాద్రపదం','ఆశ్వయుజం','కార్తీకం','మార్గశిరం','పుష్యం','మాఘం','ఫాల్గుణం'],
  ta: ['சித்திரை','வைகாசி','ஆனி','ஆடி','ஆவணி','புரட்டாசி','ஐப்பசி','கார்த்திகை','மார்கழி','தை','மாசி','பங்குனி'],
  kn: ['ಚೈತ್ರ','ವೈಶಾಖ','ಜ್ಯೇಷ್ಠ','ಆಷಾಢ','ಶ್ರಾವಣ','ಭಾದ್ರಪದ','ಆಶ್ವಯುಜ','ಕಾರ್ತಿಕ','ಮಾರ್ಗಶಿರ','ಪುಷ್ಯ','ಮಾಘ','ಫಾಲ್ಗುಣ'],
  ml: ['ചിങ್ങം','കന്നി','തുലാം','വൃശ്ചികം','ധനു','മകരം','കുംഭം','മീനം','മേടം','ഇടവം','മിഥുനം','കർക്കടകം'],
  hi: ['चैत्र','वैशाख','ज्येष्ठ','आषाढ','श्रावण','भाद्रपद','आश्विन','कार्तिक','मार्गशीर्ष','पौष','माघ','फाल्गुन'],
  mr: ['चैत्र','वैशाख','ज्येष्ठ','आषाढ','श्रावण','भाद्रपद','आश्विन','कार्तिक','मार्गशीर्ष','पौष','माघ','फाल्गुन'],
  bn: ['চৈত্র','বৈশাখ','জ্যৈষ্ঠ','আষাঢ়','শ্রাবণ','ভাদ্র','আশ্বিন','কার্তিক','অগ্রহায়ণ','পৌষ','মাঘ','ফাল্গুন'],
  en: ['Chaitra','Vaishakha','Jyeshtha','Ashadha','Shravana','Bhadrapada','Ashwayuja','Kartika','Margashira','Pushya','Magha','Phalguna'],
};

const TITHIS_BY_LOCALE: Record<string, string[]> = {
  te: ['పాడ్యమి','విదియ','తదియ','చవితి','పంచమి','షష్ఠి','సప్తమి','అష్టమి','నవమి','దశమి','ఏకాదశి','ద్వాదశి','త్రయోదశి','చతుర్దశి','పూర్ణిమ','పాడ్యమి','విదియ','తదియ','చవితి','పంచమి','షష్ఠి','సప్తమి','అష్టమి','నవమి','దశమి','ఏకాదశి','ద్వాదశి','త్రయోదశి','చతుర్దశి','అమావాస్య'],
  ta: ['பிரதமை','துவிதியை','திருதியை','சதுர்த்தி','பஞ்சமி','சஷ்டி','சப்தமி','அஷ்டமி','நவமி','தசமி','ஏகாதசி','துவாதசி','திரயோதசி','சதுர்தசி','பௌர்ணமி','பிரதமை','துவிதியை','திருதியை','சதுர்த்தி','பஞ்சமி','சஷ்டி','சப்தமி','அஷ்டமி','நவமி','தசமி','ஏகாதசி','துவாதசி','திரயோதசி','சதுர்தசி','அமாவாசை'],
  kn: ['ಪ್ರತಿಪದ','ದ್ವಿತೀಯ','ತೃತೀಯ','ಚತುರ್ಥಿ','ಪಂಚಮಿ','ಷಷ್ಠಿ','ಸಪ್ತಮಿ','ಅಷ್ಟಮಿ','ನವಮಿ','ದಶಮಿ','ಏಕಾದಶಿ','ದ್ವಾದಶಿ','ತ್ರಯೋದಶಿ','ಚತುರ್ದಶಿ','ಪೂರ್ಣಿಮ','ಪ್ರತಿಪದ','ದ್ವಿತೀಯ','ತೃತೀಯ','ಚತುರ್ಥಿ','ಪಂಚಮಿ','ಷಷ್ಠಿ','ಸಪ್ತಮಿ','ಅಷ್ಟಮಿ','ನವಮಿ','ದಶಮಿ','ಏಕಾದಶಿ','ದ್ವಾದಶಿ','ತ್ರಯೋದಶಿ','ಚತುರ್ದಶಿ','ಅಮಾವಾಸ್ಯ'],
  ml: ['പ്രതിപദ','ദ്വിതീയ','തൃതീയ','ചതുർഥി','പഞ്ചമി','ഷഷ്ഠി','സപ്തമി','അഷ്ടമി','നവമി','ദശമി','ഏകാദശി','ദ്വാദശി','ത്രയോദശി','ചതുർദശി','പൂർണ്ണിമ','പ്രതിപദ','ദ്വിതീയ','തൃതീയ','ചതുർഥി','പഞ്ചമി','ഷഷ്ഠി','സപ്തമി','അഷ്ടമി','നവമി','ദശമി','ഏകാദശി','ദ്വാദശി','ത്രയോദശി','ചതുർദശി','അമാവാസ്യ'],
  hi: ['प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी','षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी','एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','पूर्णिमा','प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी','षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी','एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','अमावस्या'],
  mr: ['प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी','षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी','एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','पौर्णिमा','प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी','षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी','एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','अमावस्या'],
  bn: ['প্রতিপদ','দ্বিতীয়া','তৃতীয়া','চতুর্থী','পঞ্চমী','ষষ্ঠী','সপ্তমী','অষ্টমী','নবমী','দশমী','একাদশী','দ্বাদশী','ত্রয়োদশী','চতুর্দশী','পূর্ণিমা','প্রতিপদ','দ্বিতীয়া','তৃতীয়া','চতুর্থী','পঞ্চমী','ষষ্ঠী','সপ্তমী','অষ্টমী','নবমী','দশমী','একাদশী','দ্বাদশী','ত্রয়োদশী','চতুর্দশী','অমাবস্যা'],
  en: ['Prathama','Dvitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Poornima','Prathama','Dvitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya'],
};

const YOGAS_BY_LOCALE: Record<string, string[]> = {
  te: ['విష్కంభ','ప్రీతి','ఆయుష్మాన్','సౌభాగ్య','శోభన','అతిగండ','సుకర్మ','ధృతి','శూల','గండ','వృద్ధి','ధ్రువ','వ్యాఘాత','హర్షణ','వజ్ర','సిద్ధి','వ్యతీపాత','వరీయాన్','పరిఘ','శివ','సిద్ధ','సాధ్య','శుభ','శుక్ల','బ్రహ్మ','ఇంద్ర','వైధృతి'],
  ta: ['விஷ்கம்ப','பிரீதி','ஆயுஷ்மான்','சௌபாக்கியம்','சோபன','அதிகண்ட','சுகர்மா','திருதி','சூல','கண்ட','விருத்தி','திருவ','வியாகாத','அர்ஷண','வஜ்ர','சித்தி','வியதீபாத','வரீயான்','பரிக','சிவ','சித்த','சாத்திய','சுப','சுக்ல','பிரம்ம','இந்திர','வைதிருதி'],
  kn: ['ವಿಷ್ಕಂಭ','ಪ್ರೀತಿ','ಆಯುಷ್ಮಾನ್','ಸೌಭಾಗ್ಯ','ಶೋಭನ','ಅತಿಗಂಡ','ಸುಕರ್ಮ','ಧೃತಿ','ಶೂಲ','ಗಂಡ','ವೃದ್ಧಿ','ಧ್ರುವ','ವ್ಯಾಘಾತ','ಹರ್ಷಣ','ವಜ್ರ','ಸಿದ್ಧಿ','ವ್ಯತೀಪಾತ','ವರೀಯಾನ್','ಪರಿಘ','ಶಿವ','ಸಿದ್ಧ','ಸಾಧ್ಯ','ಶುಭ','ಶುಕ್ಲ','ಬ್ರಹ್ಮ','ಇಂದ್ರ','ವೈಧೃತಿ'],
  ml: ['വിഷ്കംഭ','പ്രീതി','ആയുഷ്മാൻ','സൗഭാഗ്യ','ശോഭന','അതിഗണ്ഡ','സുകർമ','ധൃതി','ശൂല','ഗണ്ഡ','വൃദ്ധി','ധ്രുവ','വ്യാഘാത','ഹർഷണ','വജ്ര','സിദ്ധി','വ്യതീപാത','വരീയാൻ','പരിഘ','ശിവ','സിദ്ധ','സാധ്യ','ശുഭ','ശുക്ല','ബ്രഹ്മ','ഇന്ദ്ര','വൈധൃതി'],
  hi: ['विष्कम्भ','प्रीति','आयुष्मान','सौभाग्य','शोभन','अतिगण्ड','सुकर्मा','धृति','शूल','गण्ड','वृद्धि','ध्रुव','व्याघात','हर्षण','वज्र','सिद्धि','व्यतीपात','वरीयान','परिघ','शिव','सिद्ध','साध्य','शुभ','शुक्ल','ब्रह्म','इन्द्र','वैधृति'],
  mr: ['विष्कंभ','प्रीति','आयुष्मान','सौभाग्य','शोभन','अतिगंड','सुकर्मा','धृती','शूल','गंड','वृद्धि','ध्रुव','व्याघात','हर्षण','वज्र','सिद्धी','व्यतीपात','वरीयान','परिघ','शिव','सिद्ध','साध्य','शुभ','शुक्ल','ब्रह्म','इंद्र','वैधृती'],
  bn: ['বিষ্কম্ভ','প্রীতি','আয়ুষ্মান','সৌভাগ্য','শোভন','অতিগণ্ড','সুকর্মা','ধৃতি','শূল','গণ্ড','বৃদ্ধি','ধ্রুব','ব্যাঘাত','হর্ষণ','বজ্র','সিদ্ধি','ব্যতীপাত','বরীয়ান','পরিঘ','শিব','সিদ্ধ','সাধ্য','শুভ','শুক্ল','ব্রহ্ম','ইন্দ্র','বৈধৃতি'],
  en: ['Vishkambha','Preeti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shoola','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyan','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhruthi'],
};

const KARANAS_BY_LOCALE: Record<string, string[]> = {
  te: ['బవ','బాలవ','కౌలవ','తైతిల','గర','వణిజ','విష్టి'],
  ta: ['பவ','பாலவ','கௌலவ','தைதில','கர','வணிஜ','விஷ்டி'],
  kn: ['ಬವ','ಬಾಲವ','ಕೌಲವ','ತೈತಿಲ','ಗರ','ವಣಿಜ','ವಿಷ್ಟಿ'],
  ml: ['ബവ','ബാലവ','കൗലവ','തൈതില','ഗര','വണിജ','വിഷ്ടി'],
  hi: ['बव','बालव','कौलव','तैतिल','गर','वणिज','विष्टि'],
  mr: ['बव','बालव','कौलव','तैतिल','गर','वणिज','विष्टी'],
  bn: ['বব','বালব','কৌলব','তৈতিল','গর','বণিজ','বিষ্টি'],
  en: ['Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti'],
};

const VARAS_BY_LOCALE: Record<string, string[]> = {
  te: ['ఆదివారం','సోమవారం','మంగళవారం','బుధవారం','గురువారం','శుక్రవారం','శనివారం'],
  ta: ['ஞாயிற்றுக்கிழமை','திங்கட்கிழமை','செவ்வாய்கிழமை','புதன்கிழமை','வியாழக்கிழமை','வெள்ளிக்கிழமை','சனிக்கிழமை'],
  kn: ['ಭಾನುವಾರ','ಸೋಮವಾರ','ಮಂಗಳವಾರ','ಬುಧವಾರ','ಗುರುವಾರ','ಶುಕ್ರವಾರ','ಶನಿವಾರ'],
  ml: ['ഞായർ','തിങ്കൾ','ചൊവ്വ','ബുധൻ','വ്യാഴം','വെള്ളി','ശനി'],
  hi: ['रविवार','सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'],
  mr: ['रविवार','सोमवार','मंगळवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'],
  bn: ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'],
  pa: ['ਐਤਵਾਰ','ਸੋਮਵਾਰ','ਮੰਗਲਵਾਰ','ਬੁੱਧਵਾਰ','ਵੀਰਵਾਰ','ਸ਼ੁੱਕਰਵਾਰ','ਸ਼ਨੀਵਾਰ'],
  gu: ['રવિવાર','સોમવાર','મંગળવાર','બુધવાર','ગુરુવાર','શુક્રવાર','શનિવાર'],
  en: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
};

const SPECIAL_DAYS_BY_LOCALE: Record<string, { ek: string; full: string; new_: string; chat: string; mon: string; fri: string; thu: string }> = {
  te: { ek:'🌟 ఏకాదశి — ఉపవాసం, విష్ణు పూజ', full:'🌕 పూర్ణిమ — పౌర్ణమి, అత్యంత శుభప్రదం', new_:'🌑 అమావాస్య — పితృ పూజ', chat:'🐘 వినాయక చవితి — గణేశ పూజ', mon:'🕉️ సోమవారం — శివ పూజ', fri:'🌺 శుక్రవారం — లక్ష్మీ పూజ', thu:'📿 గురువారం — విష్ణు పూజ' },
  ta: { ek:'🌟 ஏகாதசி — உபவாசம், விஷ்ணு வழிபாடு', full:'🌕 பௌர்ணமி — நிறைநிலவு, மிகவும் நல்லது', new_:'🌑 அமாவாசை — முன்னோர் வழிபாடு', chat:'🐘 விநாயக சதுர்த்தி — கணேஷ் வழிபாடு', mon:'🕉️ திங்கள் — சிவன் வழிபாடு', fri:'🌺 வெள்ளி — லக்ஷ்மி வழிபாடு', thu:'📿 வியாழன் — விஷ்ணு வழிபாடு' },
  kn: { ek:'🌟 ಏಕಾದಶಿ — ಉಪವಾಸ, ವಿಷ್ಣು ಪೂಜೆ', full:'🌕 ಪೂರ್ಣಿಮ — ಹುಣ್ಣಿಮೆ, ತುಂಬಾ ಶುಭ', new_:'🌑 ಅಮಾವಾಸ್ಯ — ಪಿತೃ ಪೂಜೆ', chat:'🐘 ಗಣೇಶ ಚತುರ್ಥಿ — ಗಣೇಶ ಪೂಜೆ', mon:'🕉️ ಸೋಮವಾರ — ಶಿವ ಪೂಜೆ', fri:'🌺 ಶುಕ್ರವಾರ — ಲಕ್ಷ್ಮಿ ಪೂಜೆ', thu:'📿 ಗುರುವಾರ — ವಿಷ್ಣು ಪೂಜೆ' },
  ml: { ek:'🌟 ഏകാദശി — ഉപവാസം, വിഷ്ണു പൂജ', full:'🌕 പൂർണ്ണിമ — ഭരണി, വളരെ ശുഭം', new_:'🌑 അമാവാസ്യ — പിതൃ പൂജ', chat:'🐘 ഗണേശ ചതുർഥി — ഗണപതി പൂജ', mon:'🕉️ തിങ്കൾ — ശിവ പൂജ', fri:'🌺 വെള്ളി — ലക്ഷ്മി പൂജ', thu:'📿 വ്യാഴം — വിഷ്ണു പൂജ' },
  hi: { ek:'🌟 एकादशी — व्रत, विष्णु पूजा', full:'🌕 पूर्णिमा — पूनम, अत्यंत शुभ', new_:'🌑 अमावस्या — पितृ पूजा', chat:'🐘 गणेश चतुर्थी — गणेश पूजा', mon:'🕉️ सोमवार — शिव पूजा', fri:'🌺 शुक्रवार — लक्ष्मी पूजा', thu:'📿 गुरुवार — विष्णु पूजा' },
};

const EN_SPECIAL = { ek:'🌟 Ekadashi — fast day, Vishnu worship', full:'🌕 Poornima — Full Moon, very auspicious', new_:'🌑 Amavasya — New Moon, ancestor worship', chat:'🐘 Chaturthi — Ganesh worship', mon:'🕉️ Monday — Shiva worship day', fri:'🌺 Friday — Lakshmi / Venus worship day', thu:'📿 Thursday — Vishnu / Guru worship day' };

const MUHURTHAMS = [
  { name: 'Abhijit Muhurtham', time: '11:48 AM – 12:36 PM', stars: 5,
    description: 'The most universally auspicious muhurtham of each day. Named after the star Abhijit (Vega), this midday window is powerful for any new beginning — starting a business, important meetings, signing contracts, travel, or any major decision.' },
  { name: 'Vijaya Muhurtham', time: '2:24 PM – 3:12 PM', stars: 5,
    description: 'The "Victory" muhurtham — ideal for exams, interviews, legal proceedings, or anything where you need to emerge victorious. Strongly favored in South Indian tradition.' },
  { name: 'Brahma Muhurtham', time: '4:24 AM – 5:12 AM', stars: 5,
    description: "The Creator's Hour — 1.5 hours before sunrise. Best for spiritual practice, meditation, yoga, and deep study. The mind is at its clearest." },
  { name: 'Amrita Siddhi Yoga', time: 'Varies by weekday & nakshatra', stars: 4,
    description: 'Forms when specific nakshatras align with specific weekdays. Activities started here yield lasting results: Sunday+Hasta, Monday+Mrigashira, Tuesday+Ashwini, Wednesday+Anuradha, Thursday+Pushya, Friday+Ashwini, Saturday+Rohini.' },
  { name: 'Sarvaartha Siddhi Yoga', time: 'Varies by weekday & nakshatra', stars: 4,
    description: 'All desires are said to be fulfilled when an auspicious activity is started in this yoga. Particularly favored for business launches and important purchases.' },
];

const ACTIVITY_GUIDE = [
  { activity: 'Marriage', icon: '💍', good: ['Wednesday','Thursday','Friday'], avoid: ['Tuesday','Saturday'], nakshatras: 'Rohini, Mrigashira, Magha, Uttara Phalguni, Hasta, Swati, Anuradha, Uttara Ashadha, Revati', tithi: 'Avoid 4,8,9,12,14,Amavasya' },
  { activity: 'House Entry', icon: '🏠', good: ['Wednesday','Thursday','Friday','Monday'], avoid: ['Tuesday','Saturday'], nakshatras: 'Rohini, Mrigashira, Pushya, Uttara Phalguni, Hasta, Uttara Ashadha, Revati', tithi: 'Shukla Paksha preferred' },
  { activity: 'Business Start', icon: '🏪', good: ['Wednesday','Thursday','Friday','Monday'], avoid: ['Saturday'], nakshatras: 'Ashwini, Rohini, Mrigashira, Pushya, Hasta, Chitra, Anuradha, Shravana, Revati', tithi: 'Any except 8,14,30' },
  { activity: 'Travel', icon: '✈️', good: ['Wednesday','Thursday','Friday'], avoid: ['Tuesday','Saturday'], nakshatras: 'Ashwini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, Anuradha, Shravana, Revati', tithi: 'Shukla 2,3,5,7,10,11,12,13' },
  { activity: 'Education', icon: '📚', good: ['Wednesday','Thursday','Monday'], avoid: ['Tuesday','Saturday'], nakshatras: 'Ashwini, Rohini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, Shravana, Revati', tithi: 'Shukla 2,5,7,10,13 or Poornima' },
  { activity: 'Surgery', icon: '🏥', good: ['Tuesday','Saturday'], avoid: ['Monday','Poornima'], nakshatras: 'Ashwini, Hasta, Pushya, Anuradha, Mula', tithi: 'Krishna Paksha preferred; avoid Poornima' },
  { activity: 'Vehicle Purchase', icon: '🚗', good: ['Wednesday','Thursday','Friday'], avoid: ['Tuesday','Saturday'], nakshatras: 'Rohini, Mrigashira, Hasta, Anuradha, Shravana, Revati', tithi: 'Shukla 2,3,5,7,10,11' },
  { activity: 'Property / Land', icon: '🏡', good: ['Wednesday','Thursday','Monday'], avoid: ['Tuesday'], nakshatras: 'Rohini, Mrigashira, Pushya, Hasta, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada', tithi: 'Shukla Paksha' },
];

// ─── Nakshatra symbols ────────────────────────────────────────────────────────
const NAKSHATRA_SYMBOL: Record<string, string> = {
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
