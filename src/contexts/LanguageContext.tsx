import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ne" | "hi" | "mai" | "bho" | "ur";

export const LANGUAGE_META: Record<Language, { label: string; native: string; flag: string }> = {
  en: { label: "English", native: "English", flag: "🇬🇧" },
  ne: { label: "Nepali", native: "नेपाली", flag: "🇳🇵" },
  hi: { label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  mai: { label: "Maithili", native: "मैथिली", flag: "🇳🇵" },
  bho: { label: "Bhojpuri", native: "भोजपुरी", flag: "🇳🇵" },
  ur: { label: "Urdu", native: "اردو", flag: "🇵🇰" },
};

type TranslationEntry = Partial<Record<Language, string>> & { en: string };

interface Translations {
  [key: string]: TranslationEntry;
}

const translations: Translations = {
  // Navigation
  home: { en: "Home", ne: "गृहपृष्ठ", hi: "होम", mai: "घर", bho: "घर", ur: "ہوم" },
  about: { en: "About", ne: "बारेमा", hi: "परिचय", mai: "परिचय", bho: "परिचय", ur: "تعارف" },
  vision: { en: "Vision", ne: "दृष्टिकोण", hi: "दृष्टि", mai: "दृष्टि", bho: "दृष्टि", ur: "وژن" },
  news: { en: "News", ne: "समाचार", hi: "समाचार", mai: "समाचार", bho: "खबर", ur: "خبریں" },
  podcasts: { en: "Podcasts", ne: "पोडकास्ट", hi: "पॉडकास्ट", mai: "पॉडकास्ट", bho: "पॉडकास्ट", ur: "پوڈکاسٹ" },
  gallery: { en: "Gallery", ne: "ग्यालरी", hi: "गैलरी", mai: "गैलरी", bho: "गैलरी", ur: "گیلری" },
  contact: { en: "Contact", ne: "सम्पर्क", hi: "संपर्क", mai: "संपर्क", bho: "संपर्क", ur: "رابطہ" },
  login: { en: "Login", ne: "लगइन", hi: "लॉगिन", mai: "लॉगिन", bho: "लॉगिन", ur: "لاگ ان" },

  // Common
  readMore: { en: "Read More", ne: "थप पढ्नुहोस्", hi: "और पढ़ें", mai: "आओर पढ़ू", bho: "अउर पढ़ीं", ur: "مزید پڑھیں" },
  watchVideo: { en: "Watch Video", ne: "भिडियो हेर्नुहोस्", hi: "वीडियो देखें", mai: "वीडियो देखू", bho: "वीडियो देखीं", ur: "ویڈیو دیکھیں" },
  learnMore: { en: "Learn More", ne: "थप जान्नुहोस्", hi: "और जानें", mai: "आओर जानू", bho: "अउर जानीं", ur: "مزید جانیں" },
  play: { en: "Play", ne: "बजाउनुहोस्", hi: "चलाएं", mai: "चलाउ", bho: "चलाईं", ur: "چلائیں" },
  pause: { en: "Pause", ne: "रोक्नुहोस्", hi: "रोकें", mai: "रोकू", bho: "रोकीं", ur: "روکیں" },
  pinned: { en: "Pinned", ne: "पिन गरिएको", hi: "पिन किया गया", mai: "पिन कएल", bho: "पिन कइल", ur: "پن شدہ" },
  share: { en: "Share", ne: "साझा गर्नुहोस्", hi: "साझा करें", mai: "साझा करू", bho: "साझा करीं", ur: "شیئر کریں" },
  loading: { en: "Loading...", ne: "लोड हुँदैछ...", hi: "लोड हो रहा है...", mai: "लोड भ' रहल अछि...", bho: "लोड हो रहल बा...", ur: "لوڈ ہو رہا ہے..." },

  // Hero
  togetherFor: { en: "TOGETHER FOR", ne: "सँगै", hi: "एक साथ", mai: "संगहि", bho: "एक संगे", ur: "مل کر" },
  aProsperous: { en: "A PROSPEROUS", ne: "समृद्ध", hi: "समृद्ध", mai: "समृद्ध", bho: "समृद्ध", ur: "خوشحال" },
  bhokrahaNarsingh: { en: "BHOKRAHA NARSINGH", ne: "भोक्राहा नरसिंह", hi: "भोकराहा नरसिंह", mai: "भोक्राहा नरसिंह", bho: "भोकराहा नरसिंह", ur: "بھوکراہا نرسنگھ" },
  heroDescription: {
    en: "Working hand-in-hand with citizens for development, dignity, and democracy.",
    ne: "विकास, मर्यादा र लोकतन्त्रका लागि नागरिकसँग हातेमालो गर्दै।",
    hi: "विकास, गरिमा और लोकतंत्र के लिए नागरिकों के साथ मिलकर काम कर रहे हैं।",
    mai: "विकास, मर्यादा आ लोकतंत्र लेल नागरिक संग मिलिकेँ काज क' रहल छी।",
    bho: "विकास, मर्यादा आ लोकतंत्र खातिर जनता के साथे काम करत बानी।",
    ur: "ترقی، وقار اور جمہوریت کے لیے شہریوں کے ساتھ مل کر کام کر رہے ہیں۔",
  },

  // About
  meetMayor: { en: "MEET", ne: "परिचय", hi: "मिलिए", mai: "भेंट करू", bho: "मिलीं", ur: "ملاقات" },
  theJourney: { en: "The Journey", ne: "यात्रा", hi: "यात्रा", mai: "यात्रा", bho: "यात्रा", ur: "سفر" },
  missionAndValues: { en: "Mission & Values", ne: "मिशन र मूल्यहरू", hi: "मिशन और मूल्य", mai: "मिशन आ मूल्य", bho: "मिशन आ मूल्य", ur: "مشن اور اقدار" },
  keyAchievements: { en: "Key Achievements", ne: "मुख्य उपलब्धिहरू", hi: "मुख्य उपलब्धियाँ", mai: "मुख्य उपलब्धि", bho: "मुख्य उपलब्धि", ur: "کلیدی کامیابیاں" },
  aboutDescription: {
    en: "A dedicated public servant committed to transforming Bhokraha Narsingh through inclusive development and transparent governance.",
    ne: "समावेशी विकास र पारदर्शी शासनको माध्यमबाट भोक्राहा नरसिंहलाई रूपान्तरण गर्न प्रतिबद्ध समर्पित जनसेवक।",
    hi: "समावेशी विकास और पारदर्शी शासन के माध्यम से भोकराहा नरसिंह को बदलने के लिए प्रतिबद्ध एक समर्पित जनसेवक।",
    mai: "समावेशी विकास आ पारदर्शी शासन के माध्यम सं भोक्राहा नरसिंह के बदलैत समर्पित जनसेवक।",
    bho: "समावेशी विकास आ पारदर्शी शासन के माध्यम से भोकराहा नरसिंह के बदले खातिर समर्पित जनसेवक।",
    ur: "جامع ترقی اور شفاف حکمرانی کے ذریعے بھوکراہا نرسنگھ کو تبدیل کرنے کے لیے پُرعزم ایک سرشار خدمت گار۔",
  },

  // Vision
  visionAndDevelopment: { en: "VISION &", ne: "दृष्टि र", hi: "दृष्टि और", mai: "दृष्टि आ", bho: "दृष्टि आ", ur: "وژن اور" },
  development: { en: "DEVELOPMENT", ne: "विकास", hi: "विकास", mai: "विकास", bho: "विकास", ur: "ترقی" },
  visionDescription: {
    en: "Comprehensive development plans and policies for a prosperous Bhokraha Narsingh.",
    ne: "समृद्ध भोक्राहा नरसिंहका लागि व्यापक विकास योजना र नीतिहरू।",
    hi: "समृद्ध भोकराहा नरसिंह के लिए व्यापक विकास योजनाएँ और नीतियाँ।",
    mai: "समृद्ध भोक्राहा नरसिंह लेल व्यापक विकास योजना आ नीति।",
    bho: "समृद्ध भोकराहा नरसिंह खातिर व्यापक विकास योजना आ नीति।",
    ur: "خوشحال بھوکراہا نرسنگھ کے لیے جامع ترقیاتی منصوبے اور پالیسیاں۔",
  },
  keyDevelopmentAreas: { en: "Key Development Areas", ne: "मुख्य विकास क्षेत्रहरू", hi: "मुख्य विकास क्षेत्र", mai: "मुख्य विकास क्षेत्र", bho: "मुख्य विकास क्षेत्र", ur: "اہم ترقیاتی شعبے" },
  ongoingProjects: { en: "Ongoing Projects", ne: "चलिरहेका परियोजनाहरू", hi: "चालू परियोजनाएँ", mai: "चलैत परियोजना", bho: "चलत परियोजना", ur: "جاری منصوبے" },
  iBelieveIn: { en: "I BELIEVE IN", ne: "मेरो विश्वास", hi: "मैं मानता हूँ", mai: "हमरा विश्वास अछि", bho: "हमरा विश्वास बा", ur: "میں یقین رکھتا ہوں" },
  peopleFirst: { en: "PEOPLE-FIRST", ne: "जनता पहिलो", hi: "जनता पहले", mai: "जनता पहिने", bho: "जनता पहिले", ur: "عوام پہلے" },

  // Development Areas
  infrastructureDevelopment: { en: "Infrastructure Development", ne: "पूर्वाधार विकास", hi: "बुनियादी ढाँचा विकास", mai: "पूर्वाधार विकास", bho: "बुनियादी ढाँचा विकास", ur: "بنیادی ڈھانچے کی ترقی" },
  healthcareServices: { en: "Healthcare Services", ne: "स्वास्थ्य सेवाहरू", hi: "स्वास्थ्य सेवाएँ", mai: "स्वास्थ्य सेवा", bho: "स्वास्थ्य सेवा", ur: "صحت کی خدمات" },
  educationEnhancement: { en: "Education Enhancement", ne: "शिक्षा सुधार", hi: "शिक्षा सुधार", mai: "शिक्षा सुधार", bho: "शिक्षा सुधार", ur: "تعلیم میں بہتری" },
  youthWomenEmpowerment: { en: "Youth & Women Empowerment", ne: "युवा र महिला सशक्तिकरण", hi: "युवा एवं महिला सशक्तिकरण", mai: "युवा आ महिला सशक्तिकरण", bho: "युवा आ महिला सशक्तिकरण", ur: "نوجوانوں اور خواتین کو بااختیار بنانا" },
  agricultureDevelopment: { en: "Agriculture Development", ne: "कृषि विकास", hi: "कृषि विकास", mai: "कृषि विकास", bho: "कृषि विकास", ur: "زراعت کی ترقی" },
  digitalTransformation: { en: "Digital Transformation", ne: "डिजिटल रूपान्तरण", hi: "डिजिटल परिवर्तन", mai: "डिजिटल रूपान्तरण", bho: "डिजिटल रूपान्तरण", ur: "ڈیجیٹل تبدیلی" },

  // News
  latestNews: { en: "Latest News", ne: "ताजा समाचार", hi: "ताज़ा समाचार", mai: "ताजा समाचार", bho: "ताजा खबर", ur: "تازہ ترین خبریں" },
  newsDescription: {
    en: "Stay updated with the latest news and announcements from our municipality.",
    ne: "हाम्रो नगरपालिकाबाट ताजा समाचार र घोषणाहरूसँग अपडेट रहनुहोस्।",
    hi: "हमारी नगरपालिका से ताज़ा समाचार और घोषणाओं से अपडेट रहें।",
    mai: "हमर नगरपालिका सं ताजा समाचार आ घोषणा सं अपडेट रहू।",
    bho: "हमार नगरपालिका से ताजा खबर आ घोषणा से अपडेट रहीं।",
    ur: "ہماری میونسپلٹی کی تازہ ترین خبروں اور اعلانات سے باخبر رہیں۔",
  },
  ourPodcasts: { en: "OUR PODCASTS", ne: "हाम्रा पोडकास्टहरू", hi: "हमारे पॉडकास्ट", mai: "हमर पॉडकास्ट", bho: "हमार पॉडकास्ट", ur: "ہمارے پوڈکاسٹ" },
  podcastDescription: {
    en: "Listen to discussions on development, governance, and community stories.",
    ne: "विकास, शासन र समुदायका कथाहरूमा छलफल सुन्नुहोस्।",
    hi: "विकास, शासन और सामुदायिक कहानियों पर चर्चा सुनें।",
    mai: "विकास, शासन आ सामुदायिक कथा पर चर्चा सुनू।",
    bho: "विकास, शासन आ सामुदायिक कहानी पर बातचीत सुनीं।",
    ur: "ترقی، حکمرانی اور کمیونٹی کی کہانیوں پر گفتگو سنیں۔",
  },

  // Gallery
  projectGallery: { en: "PROJECT", ne: "परियोजना", hi: "परियोजना", mai: "परियोजना", bho: "परियोजना", ur: "منصوبہ" },
  galleryDescription: {
    en: "A visual journey through our development initiatives and community programs.",
    ne: "हाम्रो विकास पहलहरू र सामुदायिक कार्यक्रमहरूको दृश्य यात्रा।",
    hi: "हमारी विकास पहलों और सामुदायिक कार्यक्रमों की दृश्य यात्रा।",
    mai: "हमर विकास पहल आ सामुदायिक कार्यक्रम के दृश्य यात्रा।",
    bho: "हमार विकास पहल आ सामुदायिक कार्यक्रम के दृश्य यात्रा।",
    ur: "ہمارے ترقیاتی اقدامات اور کمیونٹی پروگراموں کا بصری سفر۔",
  },
  noGalleryImages: { en: "No gallery images available yet.", ne: "ग्यालरी तस्विरहरू अहिलेसम्म उपलब्ध छैनन्।", hi: "अभी तक कोई गैलरी छवि उपलब्ध नहीं है।", mai: "अखन धरि कोनो गैलरी छवि उपलब्ध नहि अछि।", bho: "अबले कवनो गैलरी फोटो उपलब्ध नइखे।", ur: "ابھی تک کوئی گیلری تصویر دستیاب نہیں ہے۔" },

  // Contact
  getInTouch: { en: "GET IN TOUCH", ne: "सम्पर्कमा रहनुहोस्", hi: "संपर्क में रहें", mai: "सम्पर्क में रहू", bho: "सम्पर्क में रहीं", ur: "رابطے میں رہیں" },
  getIn: { en: "GET IN", ne: "सम्पर्क", hi: "संपर्क", mai: "सम्पर्क", bho: "सम्पर्क", ur: "رابطہ" },
  touch: { en: "TOUCH", ne: "गर्नुहोस्", hi: "करें", mai: "करू", bho: "करीं", ur: "کریں" },
  contactDescription: {
    en: "Have questions or suggestions? We'd love to hear from you.",
    ne: "प्रश्न वा सुझावहरू छन्? हामी तपाईंबाट सुन्न चाहन्छौं।",
    hi: "कोई प्रश्न या सुझाव हैं? हम आपसे सुनना पसंद करेंगे।",
    mai: "प्रश्न वा सुझाव अछि? हम अहाँ सं सुनबाक चाहैत छी।",
    bho: "कुछ सवाल या सुझाव बा? हम राउर बात सुनल चाहीला।",
    ur: "کوئی سوال یا تجاویز ہیں؟ ہم آپ سے سننا پسند کریں گے۔",
  },
  sendMessage: { en: "Send Message", ne: "सन्देश पठाउनुहोस्", hi: "संदेश भेजें", mai: "संदेश पठाउ", bho: "संदेश भेजीं", ur: "پیغام بھیجیں" },
  sendUsMessage: { en: "Send Us a Message", ne: "हामीलाई सन्देश पठाउनुहोस्", hi: "हमें संदेश भेजें", mai: "हमरा संदेश पठाउ", bho: "हमरा के संदेश भेजीं", ur: "ہمیں پیغام بھیجیں" },
  officeAddress: { en: "Office Address", ne: "कार्यालय ठेगाना", hi: "कार्यालय का पता", mai: "कार्यालय पता", bho: "कार्यालय के पता", ur: "دفتر کا پتہ" },
  phone: { en: "Phone", ne: "फोन", hi: "फ़ोन", mai: "फोन", bho: "फोन", ur: "فون" },
  email: { en: "Email", ne: "इमेल", hi: "ईमेल", mai: "इमेल", bho: "इमेल", ur: "ای میل" },
  officeHours: { en: "Office Hours", ne: "कार्यालय समय", hi: "कार्यालय समय", mai: "कार्यालय समय", bho: "कार्यालय समय", ur: "دفتر کے اوقات" },
  firstName: { en: "First Name", ne: "पहिलो नाम", hi: "पहला नाम", mai: "पहिल नाम", bho: "पहिलका नाम", ur: "پہلا نام" },
  lastName: { en: "Last Name", ne: "थर", hi: "उपनाम", mai: "अंतिम नाम", bho: "अंतिम नाम", ur: "آخری نام" },
  message: { en: "Message", ne: "सन्देश", hi: "संदेश", mai: "संदेश", bho: "संदेश", ur: "پیغام" },
  enterFirstName: { en: "Enter your first name", ne: "आफ्नो पहिलो नाम लेख्नुहोस्", hi: "अपना पहला नाम दर्ज करें", mai: "अपन पहिल नाम लिखू", bho: "आपन पहिलका नाम लिखीं", ur: "اپنا پہلا نام درج کریں" },
  enterLastName: { en: "Enter your last name", ne: "आफ्नो थर लेख्नुहोस्", hi: "अपना उपनाम दर्ज करें", mai: "अपन अंतिम नाम लिखू", bho: "आपन अंतिम नाम लिखीं", ur: "اپنا آخری نام درج کریں" },
  enterEmail: { en: "your.email@example.com", ne: "तपाईंको.इमेल@example.com", hi: "your.email@example.com", mai: "your.email@example.com", bho: "your.email@example.com", ur: "your.email@example.com" },
  enterPhone: { en: "+977-XXX-XXXXXX", ne: "+९७७-XXX-XXXXXX", hi: "+977-XXX-XXXXXX", mai: "+977-XXX-XXXXXX", bho: "+977-XXX-XXXXXX", ur: "+977-XXX-XXXXXX" },
  writeMessage: { en: "Write your message here...", ne: "यहाँ आफ्नो सन्देश लेख्नुहोस्...", hi: "यहाँ अपना संदेश लिखें...", mai: "एतय अपन संदेश लिखू...", bho: "इहाँ आपन संदेश लिखीं...", ur: "اپنا پیغام یہاں لکھیں..." },
  messageSent: { en: "Message Sent!", ne: "सन्देश पठाइयो!", hi: "संदेश भेजा गया!", mai: "संदेश पठाएल गेल!", bho: "संदेश भेज दिहल गइल!", ur: "پیغام بھیج دیا گیا!" },
  messageSentDesc: {
    en: "Thank you for contacting us. We'll get back to you soon.",
    ne: "सम्पर्क गर्नुभएकोमा धन्यवाद। हामी चाँडै तपाईंलाई जवाफ दिनेछौं।",
    hi: "हमसे संपर्क करने के लिए धन्यवाद। हम जल्द ही आपसे संपर्क करेंगे।",
    mai: "सम्पर्क करबाक लेल धन्यवाद। हम जल्दीए अहाँ सं सम्पर्क करब।",
    bho: "सम्पर्क करे खातिर धन्यवाद। हम जल्दिए राउर जवाब देब।",
    ur: "ہم سے رابطہ کرنے کا شکریہ۔ ہم جلد ہی آپ سے رابطہ کریں گے۔",
  },

  // Footer
  quickLinks: { en: "Quick Links", ne: "छिटो लिंकहरू", hi: "त्वरित लिंक", mai: "त्वरित लिंक", bho: "जल्दी लिंक", ur: "فوری روابط" },
  contactInfo: { en: "Contact Info", ne: "सम्पर्क जानकारी", hi: "संपर्क जानकारी", mai: "सम्पर्क जानकारी", bho: "सम्पर्क जानकारी", ur: "رابطے کی معلومات" },
  followUs: { en: "Follow Us", ne: "हामीलाई फलो गर्नुहोस्", hi: "हमें फॉलो करें", mai: "हमरा फॉलो करू", bho: "हमरा के फॉलो करीं", ur: "ہمیں فالو کریں" },
  developedWith: { en: "Developed with ❤️ for Bhokraha Narsingh", ne: "भोक्राहा नरसिंहका लागि ❤️ सहित विकसित", hi: "भोकराहा नरसिंह के लिए ❤️ से बनाया गया", mai: "भोक्राहा नरसिंह लेल ❤️ सं विकसित", bho: "भोकराहा नरसिंह खातिर ❤️ से बनवल गइल", ur: "بھوکراہا نرسنگھ کے لیے ❤️ سے بنایا گیا" },

  // Social
  shareOnFacebook: { en: "Share on Facebook", ne: "फेसबुकमा साझा गर्नुहोस्", hi: "फेसबुक पर साझा करें", mai: "फेसबुक पर साझा करू", bho: "फेसबुक पर साझा करीं", ur: "فیس بک پر شیئر کریں" },
  shareOnTwitter: { en: "Share on Twitter", ne: "ट्विटरमा साझा गर्नुहोस्", hi: "ट्विटर पर साझा करें", mai: "ट्विटर पर साझा करू", bho: "ट्विटर पर साझा करीं", ur: "ٹویٹر پر شیئر کریں" },
  shareOnLinkedIn: { en: "Share on LinkedIn", ne: "लिंक्डइनमा साझा गर्नुहोस्", hi: "लिंक्डइन पर साझा करें", mai: "लिंक्डइन पर साझा करू", bho: "लिंक्डइन पर साझा करीं", ur: "لنکڈ ان پر شیئر کریں" },
  shareOnWhatsApp: { en: "Share on WhatsApp", ne: "व्हाट्सएपमा साझा गर्नुहोस्", hi: "व्हाट्सएप पर साझा करें", mai: "व्हाट्सएप पर साझा करू", bho: "व्हाट्सएप पर साझा करीं", ur: "واٹس ایپ پر شیئر کریں" },
  copyLink: { en: "Copy Link", ne: "लिंक कपी गर्नुहोस्", hi: "लिंक कॉपी करें", mai: "लिंक कॉपी करू", bho: "लिंक कॉपी करीं", ur: "لنک کاپی کریں" },
  linkCopied: { en: "Link copied to clipboard!", ne: "लिंक कपी भयो!", hi: "लिंक कॉपी हो गया!", mai: "लिंक कॉपी भ' गेल!", bho: "लिंक कॉपी हो गइल!", ur: "لنک کاپی ہو گیا!" },

  // Auth
  signIn: { en: "Sign In", ne: "साइन इन", hi: "साइन इन", mai: "साइन इन", bho: "साइन इन", ur: "سائن ان" },
  signUp: { en: "Sign Up", ne: "साइन अप", hi: "साइन अप", mai: "साइन अप", bho: "साइन अप", ur: "سائن اپ" },
  signOut: { en: "Sign Out", ne: "साइन आउट", hi: "साइन आउट", mai: "साइन आउट", bho: "साइन आउट", ur: "سائن آؤٹ" },
  emailAddress: { en: "Email address", ne: "इमेल ठेगाना", hi: "ईमेल पता", mai: "इमेल पता", bho: "इमेल पता", ur: "ای میل پتہ" },
  password: { en: "Password", ne: "पासवर्ड", hi: "पासवर्ड", mai: "पासवर्ड", bho: "पासवर्ड", ur: "پاس ورڈ" },
  fullName: { en: "Full Name", ne: "पूरा नाम", hi: "पूरा नाम", mai: "पूरा नाम", bho: "पूरा नाम", ur: "پورا نام" },

  // Podcast
  audio: { en: "Audio", ne: "अडियो", hi: "ऑडियो", mai: "ऑडियो", bho: "ऑडियो", ur: "آڈیو" },
  video: { en: "Video", ne: "भिडियो", hi: "वीडियो", mai: "वीडियो", bho: "वीडियो", ur: "ویڈیو" },
  noPodcasts: { en: "No podcasts available yet.", ne: "पोडकास्टहरू अहिलेसम्म उपलब्ध छैनन्।", hi: "अभी तक कोई पॉडकास्ट उपलब्ध नहीं है।", mai: "अखन धरि कोनो पॉडकास्ट उपलब्ध नहि अछि।", bho: "अबले कवनो पॉडकास्ट उपलब्ध नइखे।", ur: "ابھی تک کوئی پوڈکاسٹ دستیاب نہیں ہے۔" },

  // Engagement
  likes: { en: "Likes", ne: "मनपर्छ", hi: "लाइक्स", mai: "लाइक", bho: "लाइक", ur: "لائکس" },
  comments: { en: "Comments", ne: "टिप्पणीहरू", hi: "टिप्पणियाँ", mai: "टिप्पणी", bho: "टिप्पणी", ur: "تبصرے" },
  views: { en: "Views", ne: "हेराइहरू", hi: "व्यूज़", mai: "व्यू", bho: "व्यू", ur: "آراء" },
  leaveComment: { en: "Leave a Comment", ne: "टिप्पणी छोड्नुहोस्", hi: "टिप्पणी करें", mai: "टिप्पणी करू", bho: "टिप्पणी करीं", ur: "تبصرہ کریں" },
  yourName: { en: "Your Name", ne: "तपाईंको नाम", hi: "आपका नाम", mai: "अहाँक नाम", bho: "रउरा के नाम", ur: "آپ کا نام" },
  writeComment: { en: "Write your comment...", ne: "आफ्नो टिप्पणी लेख्नुहोस्...", hi: "अपनी टिप्पणी लिखें...", mai: "अपन टिप्पणी लिखू...", bho: "आपन टिप्पणी लिखीं...", ur: "اپنا تبصرہ لکھیں..." },
  submitComment: { en: "Submit Comment", ne: "टिप्पणी पेश गर्नुहोस्", hi: "टिप्पणी जमा करें", mai: "टिप्पणी पेश करू", bho: "टिप्पणी जमा करीं", ur: "تبصرہ جمع کریں" },
  submitting: { en: "Submitting...", ne: "पेश गर्दै...", hi: "जमा हो रहा है...", mai: "पेश भ' रहल अछि...", bho: "जमा हो रहल बा...", ur: "جمع ہو رہا ہے..." },
  cancel: { en: "Cancel", ne: "रद्द गर्नुहोस्", hi: "रद्द करें", mai: "रद्द करू", bho: "रद्द करीं", ur: "منسوخ کریں" },
  fillAllFields: { en: "Please fill in all fields", ne: "कृपया सबै फिल्डहरू भर्नुहोस्", hi: "कृपया सभी फ़ील्ड भरें", mai: "कृपया सब फिल्ड भरू", bho: "किरपा सब फिल्ड भरीं", ur: "براہ کرم تمام خانے بھریں" },
  commentSubmitted: { en: "Comment submitted for review", ne: "टिप्पणी समीक्षाको लागि पेश गरियो", hi: "टिप्पणी समीक्षा के लिए जमा की गई", mai: "टिप्पणी समीक्षा लेल पेश कएल गेल", bho: "टिप्पणी समीक्षा खातिर जमा कइल गइल", ur: "تبصرہ جائزے کے لیے جمع کیا گیا" },
  commentError: { en: "Error submitting comment", ne: "टिप्पणी पेश गर्दा त्रुटि", hi: "टिप्पणी जमा करने में त्रुटि", mai: "टिप्पणी पेश करबा में त्रुटि", bho: "टिप्पणी जमा करे में गलती", ur: "تبصرہ جمع کرنے میں خرابی" },
  commentModeration: { en: "Your comment will appear after moderation.", ne: "तपाईंको टिप्पणी मोडरेशन पछि देखिनेछ।", hi: "आपकी टिप्पणी मॉडरेशन के बाद दिखाई देगी।", mai: "अहाँक टिप्पणी मॉडरेशन के बाद देखब।", bho: "रउरा के टिप्पणी मॉडरेशन के बाद देखाई।", ur: "آپ کا تبصرہ نظرثانی کے بعد ظاہر ہوگا۔" },

  // Search
  searchPlaceholder: { en: "Search posts, podcasts, gallery...", ne: "पोस्ट, पोडकास्ट, ग्यालरी खोज्नुहोस्...", hi: "पोस्ट, पॉडकास्ट, गैलरी खोजें...", mai: "पोस्ट, पॉडकास्ट, गैलरी खोजू...", bho: "पोस्ट, पॉडकास्ट, गैलरी खोजीं...", ur: "پوسٹس، پوڈکاسٹ، گیلری تلاش کریں..." },
  noResults: { en: "No results found", ne: "कुनै नतिजा फेला परेन", hi: "कोई परिणाम नहीं मिला", mai: "कोनो परिणाम नहि भेटल", bho: "कवनो रिजल्ट ना मिलल", ur: "کوئی نتیجہ نہیں ملا" },
  searchHint: { en: "Type to search...", ne: "खोज्न टाइप गर्नुहोस्...", hi: "खोजने के लिए टाइप करें...", mai: "खोजबाक लेल टाइप करू...", bho: "खोजे खातिर टाइप करीं...", ur: "تلاش کرنے کے لیے ٹائپ کریں..." },

  // Read More
  showLess: { en: "Show Less", ne: "कम देखाउनुहोस्", hi: "कम दिखाएँ", mai: "कम देखाउ", bho: "कम देखाईं", ur: "کم دکھائیں" },

  // Newsletter
  subscribeNewsletter: { en: "Subscribe to Our Newsletter", ne: "हाम्रो न्यूजलेटरमा सदस्यता लिनुहोस्", hi: "हमारे न्यूज़लेटर की सदस्यता लें", mai: "हमर न्यूजलेटर सदस्यता लिअ", bho: "हमार न्यूजलेटर के सदस्यता लीं", ur: "ہمارے نیوز لیٹر کو سبسکرائب کریں" },
  newsletterDescription: { en: "Get the latest updates, news, and announcements delivered to your inbox.", ne: "नवीनतम अपडेटहरू, समाचार र घोषणाहरू तपाईंको इनबक्समा प्राप्त गर्नुहोस्।", hi: "नवीनतम अपडेट, समाचार और घोषणाएँ अपने इनबॉक्स में पाएँ।", mai: "नवीनतम अपडेट, समाचार आ घोषणा अपन इनबॉक्स में पाउ।", bho: "नया अपडेट, खबर आ घोषणा आपन इनबॉक्स में पाईं।", ur: "تازہ ترین اپ ڈیٹس، خبریں اور اعلانات اپنے ان باکس میں حاصل کریں۔" },
  subscribe: { en: "Subscribe", ne: "सदस्यता लिनुहोस्", hi: "सदस्यता लें", mai: "सदस्यता लिअ", bho: "सदस्यता लीं", ur: "سبسکرائب کریں" },
  noSpam: { en: "We respect your privacy. No spam, unsubscribe anytime.", ne: "हामी तपाईंको गोपनीयताको सम्मान गर्छौं। स्प्याम छैन, कुनै पनि समय अनसब्सक्राइब गर्नुहोस्।", hi: "हम आपकी गोपनीयता का सम्मान करते हैं। कोई स्पैम नहीं, कभी भी अनसब्सक्राइब करें।", mai: "हम अहाँक गोपनीयता के सम्मान करैत छी। स्पैम नहि, कहियो अनसब्सक्राइब करू।", bho: "हम राउर गोपनीयता के सम्मान करिले। स्पैम ना, कबो अनसब्सक्राइब करीं।", ur: "ہم آپ کی رازداری کا احترام کرتے ہیں۔ کوئی اسپام نہیں، کسی بھی وقت ان سبسکرائب کریں۔" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const RTL_LANGUAGES: Language[] = ["ur"];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    if (saved && saved in LANGUAGE_META) return saved as Language;
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = RTL_LANGUAGES.includes(language) ? "rtl" : "ltr";
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
