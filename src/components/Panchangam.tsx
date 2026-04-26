'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const TEAL   = '#B8860B';
const AMBER  = '#8B1A1A';
const TEAL_L = '#9A7520';

// ── Localisation helpers ────────────────────────────────────────────────────

// Regional name for the calendar tradition
const PANCH_TITLE: Record<string, string> = {
  te:'తెలుగు పంచాంగం', hi:'पंचांग', ta:'பஞ்சாங்கம்', ml:'പഞ്ചാംഗം',
  kn:'ಪಂಚಾಂಗ', mr:'पंचांग', bn:'পঞ্চাঙ্গ', pa:'ਪੰਚਾਂਗ', gu:'પંચાંગ',
};
const PANCH_TITLE_EN: Record<string, string> = {
  te:'Telugu Panchangam', hi:'Hindi Panchang', ta:'Tamil Panchangam',
  ml:'Malayalam Panchangam', kn:'Kannada Panchanga', mr:'Marathi Panchang',
  bn:'Bengali Panchang', pa:'Punjabi Panchang', gu:'Gujarati Panchang',
};

// Samvatsara names — script prefix swapped per locale, Sanskrit name shared
const SAMVATSARA_NAMES: Record<string, string[]> = {
  te: ['ప్రభవ','విభవ','శుక్ల','ప్రమోదూత','ప్రజోత్పత్తి','ఆంగీరస','శ్రీముఖ','భావ','యువ','ధాత','ఈశ్వర','బహుధాన్య','ప్రమాది','విక్రమ','వృష','చిత్రభాను','సుభాను','తారణ','పార్థివ','వ్యయ','సర్వజిత్','సర్వధారి','విరోధి','వికృతి','ఖర','నందన','విజయ','జయ','మన్మథ','దుర్ముఖి','హేవిళంబి','విళంబి','వికారి','శార్వరి','ప్లవ','శుభకృత్','శోభకృత్','క్రోధి','విశ్వావసు','పరాభవ','ప్లవంగ','కీలక','సౌమ్య','సాధారణ','విరోధికృత్','పరిధావి','ప్రమాదీచ','ఆనంద','రాక్షస','నల','పింగళ','కాళయుక్తి','సిద్ధార్థి','రౌద్ర','దుర్మతి','దుందుభి','రుధిరోద్గారి','రక్తాక్షి','క్రోధన','అక్షయ'],
  ta: ['பிரபவ','விபவ','சுக்ல','பிரமோதூத','பிரஜோத்பத்தி','ஆங்கிரஸ','ஸ்ரீமுக','பாவ','யுவ','தாத','ஈஸ்வர','பஹுதான்ய','பிரமாதி','விக்ரம','விருஷ','சித்திரபானு','சுபானு','தாரண','பார்திவ','வியய','சர்வஜித்','சர்வதாரி','விரோதி','விக்ருதி','கர','நந்தன','விஜய','ஜய','மன்மத','துர்முகி','ஹேவிளம்பி','விளம்பி','விகாரி','சார்வரி','பிலவ','சுபக்ருத்','சோபக்ருத்','க்ரோதி','விஸ்வாவசு','பராபவ','பிலவங்க','கீலக','சௌம்ய','சாதாரண','விரோதிக்ருத்','பரிதாவி','பிரமாதீச','ஆனந்த','ராக்ஷஸ','நள','பிங்கள','காளயுக்தி','சித்தார்தி','ரௌத்ர','துர்மதி','துந்துபி','ருதிரோத்காரி','ரக்தாக்ஷி','க்ரோதன','அக்ஷய'],
  ml: ['പ്രഭവ','വിഭവ','ശുക്ല','പ്രമോദൂത','പ്രജോൽപ്പത്തി','ആംഗിരസ','ശ്രീമുഖ','ഭാവ','യുവ','ധാത','ഈശ്വര','ബഹുധാന്യ','പ്രമാദി','വിക്രമ','വൃഷ','ചിത്രഭാനു','സുഭാനു','താരണ','പാർഥിവ','വ്യയ','സർവജിത്','സർവധാരി','വിരോധി','വികൃതി','ഖര','നന്ദന','വിജയ','ജയ','മന്മഥ','ദുർമുഖി','ഹേവിളംബി','വിളംബി','വികാരി','ശാർവരി','പ്ലവ','ശുഭകൃത്','ശോഭകൃത്','ക്രോധി','വിശ്വാവസു','പരാഭവ','പ്ലവംഗ','കീലക','സൗമ്യ','സാധാരണ','വിരോധികൃത്','പരിധാവി','പ്രമാദീച','ആനന്ദ','രാക്ഷസ','നള','പിംഗള','കാളയുക്തി','സിദ്ധാർഥി','രൗദ്ര','ദുർമതി','ദുന്ദുഭി','രുധിരോദ്ഗാരി','രക്താക്ഷി','ക്രോധന','അക്ഷയ'],
  kn: ['ಪ್ರಭವ','ವಿಭವ','ಶುಕ್ಲ','ಪ್ರಮೋದೂತ','ಪ್ರಜೋತ್ಪತ್ತಿ','ಆಂಗಿರಸ','ಶ್ರೀಮುಖ','ಭಾವ','ಯುವ','ಧಾತ','ಈಶ್ವರ','ಬಹುಧಾನ್ಯ','ಪ್ರಮಾದಿ','ವಿಕ್ರಮ','ವೃಷ','ಚಿತ್ರಭಾನು','ಸುಭಾನು','ತಾರಣ','ಪಾರ್ಥಿವ','ವ್ಯಯ','ಸರ್ವಜಿತ್','ಸರ್ವಧಾರಿ','ವಿರೋಧಿ','ವಿಕೃತಿ','ಖರ','ನಂದನ','ವಿಜಯ','ಜಯ','ಮನ್ಮಥ','ದುರ್ಮುಖಿ','ಹೇವಿಳಂಬಿ','ವಿಳಂಬಿ','ವಿಕಾರಿ','ಶಾರ್ವರಿ','ಪ್ಲವ','ಶುಭಕೃತ್','ಶೋಭಕೃತ್','ಕ್ರೋಧಿ','ವಿಶ್ವಾವಸು','ಪರಾಭವ','ಪ್ಲವಂಗ','ಕೀಲಕ','ಸೌಮ್ಯ','ಸಾಧಾರಣ','ವಿರೋಧಿಕೃತ್','ಪರಿಧಾವಿ','ಪ್ರಮಾದೀಚ','ಆನಂದ','ರಾಕ್ಷಸ','ನಳ','ಪಿಂಗಳ','ಕಾಳಯುಕ್ತಿ','ಸಿದ್ಧಾರ್ಥಿ','ರೌದ್ರ','ದುರ್ಮತಿ','ದುಂದುಭಿ','ರುಧಿರೋದ್ಗಾರಿ','ರಕ್ತಾಕ್ಷಿ','ಕ್ರೋಧನ','ಅಕ್ಷಯ'],
  hi: ['प्रभव','विभव','शुक्ल','प्रमोदूत','प्रजोत्पत्ति','आंगिरस','श्रीमुख','भाव','युव','धात','ईश्वर','बहुधान्य','प्रमादि','विक्रम','वृष','चित्रभानु','सुभानु','तारण','पार्थिव','व्यय','सर्वजित्','सर्वधारि','विरोधि','विकृति','खर','नंदन','विजय','जय','मन्मथ','दुर्मुखि','हेविळंबि','विळंबि','विकारि','शार्वरि','प्लव','शुभकृत्','शोभकृत्','क्रोधि','विश्वावसु','पराभव','प्लवंग','कीलक','सौम्य','साधारण','विरोधिकृत्','परिधावि','प्रमादीच','आनंद','राक्षस','नल','पिंगल','काळयुक्ति','सिद्धार्थि','रौद्र','दुर्मति','दुंदुभि','रुधिरोद्गारि','रक्ताक्षि','क्रोधन','अक्षय'],
};
const SAMVATSARA_EN = ['Prabhava','Vibhava','Shukla','Pramoduta','Prajotpatti','Angirasa','Srimukha','Bhava','Yuva','Dhata','Ishwara','Bahudhanya','Pramadi','Vikrama','Vrisha','Chitrabhanu','Subhanu','Tarana','Parthiva','Vyaya','Sarvajit','Sarvadharin','Virodhi','Vikruti','Khara','Nandana','Vijaya','Jaya','Manmatha','Durmukhi','Hevilambi','Vilambi','Vikari','Sharvari','Plava','Shubhakrut','Shobhakrut','Krodhi','Vishwavasu','Parabhava','Plavanga','Keelaka','Saumya','Sadharan','Virodhikrut','Paridhavi','Pramadeecha','Ananda','Rakshasa','Nala','Pingala','Kalayukthi','Siddharthi','Raudra','Durmathi','Dundubhi','Rudhirodhgari','Raktakshi','Krodhana','Akshaya'];

// Lunar month names per script (index 0 = Chaitra)
const MASA_NAMES: Record<string, string[]> = {
  te: ['చైత్రం','వైశాఖం','జ్యేష్ఠం','ఆషాఢం','శ్రావణం','భాద్రపదం','ఆశ్వయుజం','కార్తీకం','మార్గశిరం','పుష్యం','మాఘం','ఫాల్గుణం'],
  ta: ['சித்திரை','வைகாசி','ஆனி','ஆடி','ஆவணி','புரட்டாசி','ஐப்பசி','கார்த்திகை','மார்கழி','தை','மாசி','பங்குனி'],
  ml: ['മേടം','ഇടവം','മിഥുനം','കർക്കടകം','ചിങ്ങം','കന്നി','തുലാം','വൃശ്ചികം','ധനു','മകരം','കുംഭം','മീനം'],
  kn: ['ಚೈತ್ರ','ವೈಶಾಖ','ಜ್ಯೇಷ್ಠ','ಆಷಾಢ','ಶ್ರಾವಣ','ಭಾದ್ರಪದ','ಆಶ್ವಯುಜ','ಕಾರ್ತಿಕ','ಮಾರ್ಗಶಿರ','ಪುಷ್ಯ','ಮಾಘ','ಫಾಲ್ಗುಣ'],
  hi: ['चैत्र','वैशाख','ज्येष्ठ','आषाढ़','श्रावण','भाद्रपद','आश्विन','कार्तिक','मार्गशीर्ष','पौष','माघ','फाल्गुन'],
};
const MASA_EN = ['Chaitra','Vaishakha','Jyeshtha','Ashadha','Shravana','Bhadrapada','Ashwayuja','Kartika','Margashira','Pushya','Magha','Phalguna'];

// Tithi names per script
const TITHI_NAMES: Record<string, string[]> = {
  te: ['పాడ్యమి','విదియ','తదియ','చవితి','పంచమి','షష్ఠి','సప్తమి','అష్టమి','నవమి','దశమి','ఏకాదశి','ద్వాదశి','త్రయోదశి','చతుర్దశి','పూర్ణిమ','పాడ్యమి','విదియ','తదియ','చవితి','పంచమి','షష్ఠి','సప్తమి','అష్టమి','నవమి','దశమి','ఏకాదశి','ద్వాదశి','త్రయోదశి','చతుర్దశి','అమావాస్య'],
  ta: ['பிரதமை','துவிதியை','திருதியை','சதுர்த்தி','பஞ்சமி','சஷ்டி','சப்தமி','அஷ்டமி','நவமி','தசமி','ஏகாதசி','துவாதசி','திரயோதசி','சதுர்தசி','பௌர்ணமி','பிரதமை','துவிதியை','திருதியை','சதுர்த்தி','பஞ்சமி','சஷ்டி','சப்தமி','அஷ்டமி','நவமி','தசமி','ஏகாதசி','துவாதசி','திரயோதசி','சதுர்தசி','அமாவாசை'],
  ml: ['പ്രതിപദ','ദ്വിതീയ','തൃതീയ','ചതുർഥി','പഞ്ചമി','ഷഷ്ഠി','സപ്തമി','അഷ്ടമി','നവമി','ദശമി','ഏകാദശി','ദ്വാദശി','ത്രയോദശി','ചതുർദശി','പൂർണ്ണിമ','പ്രതിപദ','ദ്വിതീയ','തൃതീയ','ചതുർഥി','പഞ്ചമി','ഷഷ്ഠി','സപ്തമി','അഷ്ടമി','നവമി','ദശമി','ഏകാദശി','ദ്വാദശി','ത്രയോദശി','ചതുർദശി','അമാവാസ്യ'],
  kn: ['ಪ್ರತಿಪದ','ದ್ವಿತೀಯ','ತೃತೀಯ','ಚತುರ್ಥಿ','ಪಂಚಮಿ','ಷಷ್ಠಿ','ಸಪ್ತಮಿ','ಅಷ್ಟಮಿ','ನವಮಿ','ದಶಮಿ','ಏಕಾದಶಿ','ದ್ವಾದಶಿ','ತ್ರಯೋದಶಿ','ಚತುರ್ದಶಿ','ಪೂರ್ಣಿಮ','ಪ್ರತಿಪದ','ದ್ವಿತೀಯ','ತೃತೀಯ','ಚತುರ್ಥಿ','ಪಂಚಮಿ','ಷಷ್ಠಿ','ಸಪ್ತಮಿ','ಅಷ್ಟಮಿ','ನವಮಿ','ದಶಮಿ','ಏಕಾದಶಿ','ದ್ವಾದಶಿ','ತ್ರಯೋದಶಿ','ಚತುರ್ದಶಿ','ಅಮಾವಾಸ್ಯ'],
  hi: ['प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी','षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी','एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','पूर्णिमा','प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी','षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी','एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','अमावस्या'],
};
const TITHI_EN = ['Prathama','Dvitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Poornima','Prathama','Dvitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya'];

// Yoga names per script
const YOGA_NAMES: Record<string, string[]> = {
  te: ['విష్కంభ','ప్రీతి','ఆయుష్మాన్','సౌభాగ్య','శోభన','అతిగండ','సుకర్మ','ధృతి','శూల','గండ','వృద్ధి','ధ్రువ','వ్యాఘాత','హర్షణ','వజ్ర','సిద్ధి','వ్యతీపాత','వరీయాన్','పరిఘ','శివ','సిద్ధ','సాధ్య','శుభ','శుక్ల','బ్రహ్మ','ఇంద్ర','వైధృతి'],
  ta: ['விஷ்கம்ப','பிரீதி','ஆயுஷ்மான்','சௌபாக்கியம்','சோபன','அதிகண்ட','சுகர்மா','திருதி','சூல','கண்ட','விருத்தி','திருவ','வியாகாத','அர்ஷண','வஜ்ர','சித்தி','வியதீபாத','வரீயான்','பரிக','சிவ','சித்த','சாத்திய','சுப','சுக்ல','பிரம்ம','இந்திர','வைதிருதி'],
  ml: ['വിഷ്കംഭ','പ്രീതി','ആയുഷ്മാൻ','സൗഭാഗ്യ','ശോഭന','അതിഗണ്ഡ','സുകർമ','ധൃതി','ശൂല','ഗണ്ഡ','വൃദ്ധി','ധ്രുവ','വ്യാഘാത','ഹർഷണ','വജ്ര','സിദ്ധി','വ്യതീപാത','വരീയാൻ','പരിഘ','ശിവ','സിദ്ധ','സാധ്യ','ശുഭ','ശുക്ല','ബ്രഹ്മ','ഇന്ദ്ര','വൈധൃതി'],
  kn: ['ವಿಷ್ಕಂಭ','ಪ್ರೀತಿ','ಆಯುಷ್ಮಾನ್','ಸೌಭಾಗ್ಯ','ಶೋಭನ','ಅತಿಗಂಡ','ಸುಕರ್ಮ','ಧೃತಿ','ಶೂಲ','ಗಂಡ','ವೃದ್ಧಿ','ಧ್ರುವ','ವ್ಯಾಘಾತ','ಹರ್ಷಣ','ವಜ್ರ','ಸಿದ್ಧಿ','ವ್ಯತೀಪಾತ','ವರೀಯಾನ್','ಪರಿಘ','ಶಿವ','ಸಿದ್ಧ','ಸಾಧ್ಯ','ಶುಭ','ಶುಕ್ಲ','ಬ್ರಹ್ಮ','ಇಂದ್ರ','ವೈಧೃತಿ'],
  hi: ['विष्कम्भ','प्रीति','आयुष्मान','सौभाग्य','शोभन','अतिगण्ड','सुकर्मा','धृति','शूल','गण्ड','वृद्धि','ध्रुव','व्याघात','हर्षण','वज्र','सिद्धि','व्यतीपात','वरीयान','परिघ','शिव','सिद्ध','साध्य','शुभ','शुक्ल','ब्रह्म','इन्द्र','वैधृति'],
};
const YOGA_EN = ['Vishkambha','Preeti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shoola','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyan','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];

// Karana names per script
const KARANA_NAMES: Record<string, string[]> = {
  te: ['బవ','బాలవ','కౌలవ','తైతిల','గర','వణిజ','విష్టి'],
  ta: ['பவ','பாலவ','கௌலவ','தைதில','கர','வணிஜ','விஷ்டி'],
  ml: ['ബവ','ബാലവ','കൗലവ','തൈതില','ഗര','വണിജ','വിഷ്ടി'],
  kn: ['ಬವ','ಬಾಲವ','ಕೌಲವ','ತೈತಿಲ','ಗರ','ವಣಿಜ','ವಿಷ್ಟಿ'],
  hi: ['बव','बालव','कौलव','तैतिल','गर','वणिज','विष्टि'],
};
const KARANA_EN = ['Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti'];

// Vara (day) names per script
const VARA_NAMES: Record<string, string[]> = {
  te: ['ఆదివారం','సోమవారం','మంగళవారం','బుధవారం','గురువారం','శుక్రవారం','శనివారం'],
  ta: ['ஞாயிற்றுக்கிழமை','திங்கட்கிழமை','செவ்வாய்கிழமை','புதன்கிழமை','வியாழக்கிழமை','வெள்ளிக்கிழமை','சனிக்கிழமை'],
  ml: ['ഞായർ','തിങ്കൾ','ചൊവ്വ','ബുധൻ','വ്യാഴം','വെള്ളി','ശനി'],
  kn: ['ಭಾನುವಾರ','ಸೋಮವಾರ','ಮಂಗಳವಾರ','ಬುಧವಾರ','ಗುರುವಾರ','ಶುಕ್ರವಾರ','ಶನಿವಾರ'],
  hi: ['रविवार','सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'],
};
const VARA_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Paksha labels
const PAKSHA_LABEL: Record<string, [string, string]> = {
  te: ['శుక్ల పక్షం','కృష్ణ పక్షం'],
  ta: ['சுக்ல பக்ஷம்','கிருஷ்ண பக்ஷம்'],
  ml: ['ശുക്ല പക്ഷം','കൃഷ്ണ പക്ഷം'],
  kn: ['ಶುಕ್ಲ ಪಕ್ಷ','ಕೃಷ್ಣ ಪಕ್ಷ'],
  hi: ['शुक्ल पक्ष','कृष्ण पक्ष'],
};

// Label strings for 5 Angas
const ANGA_LABELS: Record<string, string[]> = {
  te: ['తిథి','నక్షత్రం','యోగం','కరణం','వారం','సంవత్సరం'],
  ta: ['திதி','நட்சத்திரம்','யோகம்','கரணம்','வாரம்','சம்வத்சரம்'],
  ml: ['തിഥി','നക്ഷത്രം','യോഗം','കരണം','വാരം','സംവത്സരം'],
  kn: ['ತಿಥಿ','ನಕ್ಷತ್ರ','ಯೋಗ','ಕರಣ','ವಾರ','ಸಂವತ್ಸರ'],
  hi: ['तिथि','नक्षत्र','योग','करण','वार','संवत्सर'],
};
const ANGA_EN = ['Tithi','Nakshatra','Yoga','Karana','Vara','Samvatsara'];

// Inauspicious time labels
const INAUSPICIOUS_LABEL: Record<string, string[]> = {
  te: ['రాహు కాలం','గుళిక కాలం','యమగండం'],
  ta: ['ராகு காலம்','குளிகை காலம்','எமகண்டம்'],
  ml: ['രാഹുകാലം','ഗുളിക കാലം','യമഗണ്ഡം'],
  kn: ['ರಾಹುಕಾಲ','ಗುಳಿಕ ಕಾಲ','ಯಮಗಂಡ'],
  hi: ['राहु काल','गुलिक काल','यमगण्ड'],
};

function localise(map: Record<string, string[]>, key: string, idx: number, fallback: string): string {
  const loc = key.split('-')[0];
  return map[loc]?.[idx] ?? fallback;
}
function locStr(map: Record<string, string>, key: string, fallback: string): string {
  return map[key.split('-')[0]] ?? fallback;
}

const VARA_LORDS  = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];

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

const ACTIVITY_NAMES: Record<string, string[]> = {
  te: ['వివాహం','గృహప్రవేశం','వ్యాపారం','ప్రయాణం','విద్యారంభం','శస్త్రచికిత్స','వాహనం','స్థలం'],
  ta: ['திருமணம்','இல்லப்பிரவேசம்','வணிகம்','பயணம்','கல்வி','அறுவை சிகிச்சை','வாகனம்','சொத்து'],
  ml: ['വിവാഹം','ഗൃഹപ്രവേശം','വ്യാപാരം','യാത്ര','വിദ്യാരംഭം','ശസ്ത്രക്രിയ','വാഹനം','ഭൂമി'],
  kn: ['ವಿವಾಹ','ಗೃಹಪ್ರವೇಶ','ವ್ಯಾಪಾರ','ಪ್ರಯಾಣ','ವಿದ್ಯಾರಂಭ','ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ','ವಾಹನ','ಭೂಮಿ'],
  hi: ['विवाह','गृहप्रवेश','व्यापार','यात्रा','विद्यारंभ','शस्त्रक्रिया','वाहन','संपत्ति'],
};
const ACTIVITY_EN = ['Marriage','House Entry','Business Start','Travel','Education','Surgery','Vehicle Purchase','Property / Land'];

const ACTIVITY_GUIDE = [
  { idx:0, icon: '💍', good: ['Wednesday','Thursday','Friday'],         avoid: ['Tuesday','Saturday'],    nakshatras: 'Rohini, Mrigashira, Magha, Uttara Phalguni, Hasta, Swati, Anuradha, Uttara Ashadha, Uttara Bhadrapada, Revati', tithi: 'Avoid 4,8,9,12,14,Amavasya' },
  { idx:1, icon: '🏠', good: ['Wednesday','Thursday','Friday','Monday'], avoid: ['Tuesday','Saturday'],    nakshatras: 'Rohini, Mrigashira, Pushya, Uttara Phalguni, Hasta, Uttara Ashadha, Uttara Bhadrapada, Revati', tithi: 'Shukla Paksha preferred' },
  { idx:2, icon: '🏪', good: ['Wednesday','Thursday','Friday','Monday'], avoid: ['Saturday'],              nakshatras: 'Ashwini, Rohini, Mrigashira, Pushya, Hasta, Chitra, Anuradha, Shravana, Revati', tithi: 'Any except 8,14,30' },
  { idx:3, icon: '✈️', good: ['Wednesday','Thursday','Friday'],         avoid: ['Tuesday','Saturday'],    nakshatras: 'Ashwini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, Anuradha, Shravana, Revati', tithi: 'Shukla 2,3,5,7,10,11,12,13' },
  { idx:4, icon: '📚', good: ['Wednesday','Thursday','Monday'],         avoid: ['Tuesday','Saturday'],    nakshatras: 'Ashwini, Rohini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, Shravana, Revati', tithi: 'Shukla 2,5,7,10,13 or Poornima' },
  { idx:5, icon: '🏥', good: ['Tuesday','Saturday'],                    avoid: ['Monday','Poornima'],     nakshatras: 'Ashwini, Hasta, Pushya, Anuradha, Mula', tithi: 'Krishna Paksha preferred; avoid Poornima' },
  { idx:6, icon: '🚗', good: ['Wednesday','Thursday','Friday'],         avoid: ['Tuesday','Saturday'],    nakshatras: 'Rohini, Mrigashira, Hasta, Anuradha, Shravana, Revati', tithi: 'Shukla 2,3,5,7,10,11' },
  { idx:7, icon: '🏡', good: ['Wednesday','Thursday','Monday'],         avoid: ['Tuesday'],               nakshatras: 'Rohini, Mrigashira, Pushya, Hasta, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada', tithi: 'Shukla Paksha' },
];

function computeTodayPanchang(locale: string) {
  const loc = locale.split('-')[0];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const weekday = now.getDay();

  const afterUgadi = month > 2 || (month === 2 && day >= 25);
  const shakaYear = year - 78 - (afterUgadi ? 0 : 1);
  const samvatsaraIdx = ((shakaYear - 1) % 60 + 60) % 60;
  const samvatsara = SAMVATSARA_NAMES[loc]?.[samvatsaraIdx] ?? SAMVATSARA_EN[samvatsaraIdx];

  const monthOffsets = [9,10,11,0,1,2,3,4,5,6,7,8];
  const masaIdx = afterUgadi && month === 2 ? 0 : monthOffsets[month];
  const masa = MASA_NAMES[loc]?.[masaIdx] ?? MASA_EN[masaIdx];

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
  const tithi    = TITHI_NAMES[loc]?.[tithiIdx]   ?? TITHI_EN[tithiIdx];
  const pakshaArr = PAKSHA_LABEL[loc] ?? ['Shukla Paksha (Waxing Moon)', 'Krishna Paksha (Waning Moon)'];
  const paksha   = tithiIdx < 15 ? pakshaArr[0] : pakshaArr[1];

  const refMoonNK = 3;
  const moonNKIdx = Math.floor(((todayJD - refNM) * 27 / 27.32 + refMoonNK) % 27 + 27) % 27;
  const moonNakToday = Object.keys(NAKSHATRA_SYMBOL)[moonNKIdx] || 'Rohini';

  const yogaIdx = Math.floor((daysSinceNM * 27 / 29.53059 + moonNKIdx) % 27);
  const yoga     = YOGA_NAMES[loc]?.[yogaIdx]     ?? YOGA_EN[yogaIdx]    ?? YOGA_EN[0];

  const karanaIdx = (tithiIdx * 2) % 7;
  const karana   = KARANA_NAMES[loc]?.[karanaIdx] ?? KARANA_EN[karanaIdx];

  const vara     = VARA_NAMES[loc]?.[weekday]     ?? VARA_EN[weekday];
  const varaLord = VARA_LORDS[weekday];
  const varaShort = (ANGA_LABELS[loc] ? VARA_NAMES[loc]?.[weekday] : undefined) ?? VARA_EN[weekday];

  const RAHU_KALAM   = ['4:30–6:00 PM','7:30–9:00 AM','3:00–4:30 PM','12:00–1:30 PM','1:30–3:00 PM','10:30 AM–12:00 PM','9:00–10:30 AM'];
  const GULIKA_KALAM = ['6:00–7:30 AM','3:00–4:30 PM','4:30–6:00 PM','3:00–4:30 PM','9:00–10:30 AM','7:30–9:00 AM','6:00–7:30 AM'];
  const YAMAGANDAM   = ['10:30 AM–12:00 PM','4:30–6:00 PM','9:00–10:30 AM','1:30–3:00 PM','12:00–1:30 PM','6:00–7:30 AM','12:00–1:30 PM'];

  // Special day messages — native script + English
  const specialDays: string[] = [];
  const ekadashi  = TITHI_EN[10];
  const poornima  = TITHI_EN[14];
  const amavasya  = TITHI_EN[29];
  const chaturthi = TITHI_EN[3];
  if (tithiIdx === 10) specialDays.push(`🌟 ${TITHI_NAMES[loc]?.[10] ?? ekadashi} — fast day, Vishnu worship`);
  if (tithiIdx === 14) specialDays.push(`🌕 ${TITHI_NAMES[loc]?.[14] ?? poornima} — Full Moon, very auspicious`);
  if (tithiIdx === 29) specialDays.push(`🌑 ${TITHI_NAMES[loc]?.[29] ?? amavasya} — New Moon, ancestor worship`);
  if (tithiIdx === 3)  specialDays.push(`🐘 ${TITHI_NAMES[loc]?.[3] ?? chaturthi} — Ganesh worship`);
  if (tithiIdx === 5 && weekday === 5) specialDays.push(`💚 ${VARA_NAMES[loc]?.[5] ?? 'Friday'} + ${TITHI_NAMES[loc]?.[5] ?? 'Shashthi'} — Lakshmi worship, very auspicious`);
  if (weekday === 1) specialDays.push(`🕉️ ${VARA_NAMES[loc]?.[1] ?? 'Monday'} — Shiva worship day`);
  if (weekday === 5) specialDays.push(`🌺 ${VARA_NAMES[loc]?.[5] ?? 'Friday'} — Lakshmi / Venus worship day`);
  if (weekday === 4) specialDays.push(`📿 ${VARA_NAMES[loc]?.[4] ?? 'Thursday'} — Vishnu / Guru worship day`);

  return {
    samvatsara, masa, paksha, tithi, moonNakToday, yoga, karana, vara, varaLord, varaShort,
    rahuKalam: RAHU_KALAM[weekday], gulikaKalam: GULIKA_KALAM[weekday], yamaDandam: YAMAGANDAM[weekday],
    specialDays,
    date: now.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' }),
  };
}

interface PanchangamProps { locale?: string; }

export default function Panchangam({ locale = 'en' }: PanchangamProps) {
  const loc = locale.split('-')[0];
  const p = computeTodayPanchang(locale);
  const [section, setSection] = useState<'today'|'muhurthams'|'guide'>('today');

  // Locale-aware label helpers
  const angaLabel = (idx: number) => ANGA_LABELS[loc]?.[idx] ?? ANGA_EN[idx];
  const inauspLabel = (idx: number) => INAUSPICIOUS_LABEL[loc]?.[idx] ?? ['Rahu Kalam','Gulika Kalam','Yamagandam'][idx];

  const nativeTitle  = PANCH_TITLE[loc];
  const englishTitle = PANCH_TITLE_EN[loc] ?? 'Panchangam';

  const tab = (id: typeof section, label: string) => (
    <button onClick={() => setSection(id)}
      className="px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap"
      style={section === id
        ? { background:`linear-gradient(135deg,${TEAL},${TEAL_L})`, color:'#fff', boxShadow:'0 2px 8px rgba(184,134,11,0.25)' }
        : { color:'#6B4A20' }
      }>{label}</button>
  );

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
      className="max-w-4xl mx-auto space-y-5">

      {/* ── Hero header ── */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor:'rgba(184,134,11,0.25)', background:'linear-gradient(135deg,rgba(26,107,107,0.1),rgba(212,136,10,0.07))' }}>
        <div className="px-5 py-5 flex items-start gap-4">
          <span className="text-5xl flex-shrink-0">🪔</span>
          <div className="flex-1">
            {nativeTitle && (
              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color:AMBER }}>{nativeTitle}</p>
            )}
            <h2 className="text-2xl font-bold" style={{ color:'#1F2937' }}>{englishTitle}</h2>
            <p className="text-sm mt-0.5 font-medium" style={{ color:TEAL }}>{p.date}</p>
            <p className="text-xs mt-1" style={{ color:'#6B4A20' }}>{p.samvatsara} · {p.masa}</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color:'#6B4A20' }}>{p.paksha}</p>
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
              { label: angaLabel(0),           value:p.tithi,        icon:'🌙',  desc:'Lunar day — governs the quality of the day' },
              { label: angaLabel(1),            value:p.moonNakToday, icon:NAKSHATRA_SYMBOL[p.moonNakToday]||'⭐', desc:"Moon's star — affects mood & nature of day" },
              { label: angaLabel(2),            value:p.yoga,         icon:'🔱',  desc:'Sun+Moon combination — auspiciousness level' },
              { label: angaLabel(3),            value:p.karana,       icon:'⚖️',  desc:'Half tithi — 2 per day, affects activity quality' },
              { label: angaLabel(4),            value:p.vara,         icon:'☀️',  desc:`${p.varaShort} — ${p.varaLord} rules today` },
              { label: angaLabel(5),            value:p.samvatsara,   icon:'🏺',  desc:'Current year in the 60-year cycle' },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-3.5 border" style={{ background:'#FFFDF8', borderColor:'#E5E7EB' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-[10px] font-bold uppercase tracking-wide leading-tight" style={{ color:AMBER }}>{item.label}</p>
                </div>
                <p className="text-sm font-bold leading-snug mb-1" style={{ color:TEAL }}>{item.value}</p>
                <p className="text-[10px] leading-snug" style={{ color:'#8A7050' }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Inauspicious times */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor:'#FCA5A5' }}>
            <div className="px-4 py-2.5" style={{ background:'rgba(220,38,38,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'#DC2626' }}>⚠️ Avoid These Times Today</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {[
                { label: inauspLabel(0), time:p.rahuKalam,   who:'Rahu' },
                { label: inauspLabel(1), time:p.gulikaKalam, who:"Gulika (Saturn's son)" },
                { label: inauspLabel(2), time:p.yamaDandam,  who:'Yama (Death deity)' },
              ].map(t => (
                <div key={t.label} className="px-3 py-3">
                  <p className="text-[10px] font-bold mb-0.5" style={{ color:'#DC2626' }}>{t.label}</p>
                  <p className="text-sm font-semibold" style={{ color:'#374151' }}>{t.time}</p>
                  <p className="text-[9px] mt-0.5" style={{ color:'#8A7050' }}>Ruled by {t.who}</p>
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
              {p.varaLord === 'Sun'     && `${p.vara} is governed by Surya. Best for government matters, authority, health treatments, seeking recognition. Worship Surya Narayana at sunrise. Sun days favour solo leadership.`}
              {p.varaLord === 'Moon'    && `${p.vara} is Shiva's day, governed by Chandra. Best for emotional matters, home, travel, beginning anything requiring public warmth. Worship Shiva with milk and Bilva leaves.`}
              {p.varaLord === 'Mars'    && `${p.vara} is governed by Mangala and Hanuman. Best for physical effort, competitive endeavors, surgery, legal battles, property matters. Worship Hanuman or Subramanya.`}
              {p.varaLord === 'Mercury' && `${p.vara} is governed by Budha. Best for business, education, writing, communication, contracts. Worship Vishnu/Krishna. One of the most favourable days for auspicious work.`}
              {p.varaLord === 'Jupiter' && `${p.vara} is governed by Brihaspati. Best for education, spiritual practice, elders, gold purchases, auspicious ceremonies. Worship Vishnu with yellow flowers and Tulasi.`}
              {p.varaLord === 'Venus'   && `${p.vara} is Lakshmi Devi's day, governed by Shukra. Best for romance, art, beauty, luxury, social events. Worship Lakshmi Devi with lotus and honey.`}
              {p.varaLord === 'Saturn'  && `${p.vara} is governed by Shani. Best for discipline, long-term planning, service, medical treatments. Worship Shani with sesame oil lamps and Hanuman. Traditionally avoided for auspicious ceremonies.`}
            </p>
          </div>
        </div>
      )}

      {/* ── Muhurthams ── */}
      {section === 'muhurthams' && (
        <div className="space-y-3">
          <div className="rounded-xl p-4 border" style={{ background:'rgba(26,107,107,0.05)', borderColor:'rgba(26,107,107,0.2)' }}>
            <p className="text-sm leading-relaxed" style={{ color:'#374151' }}>
              <strong style={{ color:TEAL }}>What is a Muhurtham?</strong><br/>
              An auspicious time window selected from the Panchangam. Starting important activities within a good muhurtham significantly increases the chances of success. No major event — wedding, housewarming, business launch — begins without consulting the Panchangam.
            </p>
          </div>
          {MUHURTHAMS.map(m => (
            <div key={m.name} className="rounded-xl border overflow-hidden" style={{ borderColor:'#E5E7EB' }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ background:'rgba(26,107,107,0.06)' }}>
                <div>
                  <p className="text-sm font-bold" style={{ color:TEAL }}>{m.english}</p>
                  {nativeTitle && <p className="text-xs mt-0.5 font-medium" style={{ color:AMBER }}>{m.name}</p>}
                  <p className="text-xs mt-0.5" style={{ color:'#6B4A20' }}>{m.time}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length:5 }).map((_,i) => (
                    <span key={i} className="text-sm" style={{ opacity:i < m.stars ? 1 : 0.18 }}>⭐</span>
                  ))}
                </div>
              </div>
              <div className="px-4 py-3 space-y-2">
                <p className="text-sm leading-relaxed" style={{ color:'#374151' }}>{m.description}</p>
                {(loc === 'te') && (
                  <p className="text-xs p-2.5 rounded-lg leading-relaxed" style={{ background:'rgba(139,26,26,0.08)', color:'#92400E' }}>
                    <strong>తెలుగులో:</strong> {m.telugu}
                  </p>
                )}
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
              <strong style={{ color:AMBER }}>Auspicious Activity Guide</strong> — Classical Panchangam recommendations for different life events, as prescribed in the Dharmasindhu and Muhurthamartanda texts.
            </p>
          </div>
          {ACTIVITY_GUIDE.map(item => {
            const activityName = ACTIVITY_NAMES[loc]?.[item.idx] ?? ACTIVITY_EN[item.idx];
            const activityEN   = ACTIVITY_EN[item.idx];
            const displayLabel = activityName !== activityEN ? `${activityEN} · ${activityName}` : activityEN;
            return (
            <div key={item.idx} className="rounded-xl border overflow-hidden" style={{ borderColor:'#E5E7EB' }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ background:'linear-gradient(135deg,rgba(26,107,107,0.07),rgba(212,136,10,0.04))' }}>
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm font-bold" style={{ color:'#1F2937' }}>{displayLabel}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <div className="px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color:TEAL }}>✅ Auspicious Days</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.good.map(d => <span key={d} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:'rgba(184,134,11,0.12)', color:TEAL }}>{d}</span>)}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color:'#DC2626' }}>❌ Avoid</p>
                  <div className="flex flex-wrap gap-1">
                    {item.avoid.map(d => <span key={d} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:'rgba(220,38,38,0.08)', color:'#DC2626' }}>{d}</span>)}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color:AMBER }}>⭐ Best Nakshatras</p>
                  <p className="text-xs leading-relaxed mb-2" style={{ color:'#4B5563' }}>{item.nakshatras}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color:'#8A7050' }}>🌙 Tithi Notes</p>
                  <p className="text-xs" style={{ color:'#8A7050' }}>{item.tithi}</p>
                </div>
              </div>
            </div>
            );
          })}
          <div className="rounded-xl p-3.5 border" style={{ borderColor:'#E5E7EB' }}>
            <p className="text-xs leading-relaxed" style={{ color:'#8A7050' }}>
              📜 These are general guidelines from traditional Panchangam texts. For exact muhurtham selection for major life events consult a qualified Jyotisha expert who will factor in your specific birth chart and current transits.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
