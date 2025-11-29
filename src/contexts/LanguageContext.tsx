import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ne";

interface Translations {
  [key: string]: {
    en: string;
    ne: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { en: "Home", ne: "गृहपृष्ठ" },
  about: { en: "About", ne: "बारेमा" },
  vision: { en: "Vision", ne: "दृष्टिकोण" },
  news: { en: "News", ne: "समाचार" },
  podcasts: { en: "Podcasts", ne: "पोडकास्ट" },
  gallery: { en: "Gallery", ne: "ग्यालरी" },
  contact: { en: "Contact", ne: "सम्पर्क" },
  login: { en: "Login", ne: "लगइन" },
  
  // Common
  readMore: { en: "Read More", ne: "थप पढ्नुहोस्" },
  watchVideo: { en: "Watch Video", ne: "भिडियो हेर्नुहोस्" },
  learnMore: { en: "Learn More", ne: "थप जान्नुहोस्" },
  play: { en: "Play", ne: "बजाउनुहोस्" },
  pause: { en: "Pause", ne: "रोक्नुहोस्" },
  pinned: { en: "Pinned", ne: "पिन गरिएको" },
  
  // Hero Section
  togetherFor: { en: "TOGETHER FOR", ne: "सँगै" },
  aProsperous: { en: "A PROSPEROUS", ne: "समृद्ध" },
  bhokrahaNarsingh: { en: "BHOKRAHA NARSINGH", ne: "भोक्राहा नरसिंह" },
  
  // About
  meetMayor: { en: "MEET", ne: "परिचय" },
  theJourney: { en: "The Journey", ne: "यात्रा" },
  
  // Vision
  iBelieveIn: { en: "I BELIEVE IN", ne: "मेरो विश्वास" },
  peopleFirst: { en: "PEOPLE-FIRST", ne: "जनता पहिलो" },
  development: { en: "DEVELOPMENT", ne: "विकास" },
  
  // News
  latestNews: { en: "Latest News", ne: "ताजा समाचार" },
  ourPodcasts: { en: "OUR PODCASTS", ne: "हाम्रा पोडकास्टहरू" },
  
  // Contact
  getInTouch: { en: "GET IN TOUCH", ne: "सम्पर्कमा रहनुहोस्" },
  sendMessage: { en: "Send Message", ne: "सन्देश पठाउनुहोस्" },
  
  // Footer
  quickLinks: { en: "Quick Links", ne: "छिटो लिंकहरू" },
  contactInfo: { en: "Contact Info", ne: "सम्पर्क जानकारी" },
  followUs: { en: "Follow Us", ne: "हामीलाई फलो गर्नुहोस्" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
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
