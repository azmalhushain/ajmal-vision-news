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
  share: { en: "Share", ne: "साझा गर्नुहोस्" },
  loading: { en: "Loading...", ne: "लोड हुँदैछ..." },
  
  // Hero Section
  togetherFor: { en: "TOGETHER FOR", ne: "सँगै" },
  aProsperous: { en: "A PROSPEROUS", ne: "समृद्ध" },
  bhokrahaNarsingh: { en: "BHOKRAHA NARSINGH", ne: "भोक्राहा नरसिंह" },
  heroDescription: { 
    en: "Working hand-in-hand with citizens for development, dignity, and democracy.", 
    ne: "विकास, मर्यादा र लोकतन्त्रका लागि नागरिकसँग हातेमालो गर्दै।" 
  },
  
  // About Page
  meetMayor: { en: "MEET", ne: "परिचय" },
  theJourney: { en: "The Journey", ne: "यात्रा" },
  missionAndValues: { en: "Mission & Values", ne: "मिशन र मूल्यहरू" },
  keyAchievements: { en: "Key Achievements", ne: "मुख्य उपलब्धिहरू" },
  aboutDescription: { 
    en: "A dedicated public servant committed to transforming Bhokraha Narsingh through inclusive development and transparent governance.", 
    ne: "समावेशी विकास र पारदर्शी शासनको माध्यमबाट भोक्राहा नरसिंहलाई रूपान्तरण गर्न प्रतिबद्ध समर्पित जनसेवक।" 
  },
  
  // Vision Page
  visionAndDevelopment: { en: "VISION &", ne: "दृष्टि र" },
  development: { en: "DEVELOPMENT", ne: "विकास" },
  visionDescription: { 
    en: "Comprehensive development plans and policies for a prosperous Bhokraha Narsingh.", 
    ne: "समृद्ध भोक्राहा नरसिंहका लागि व्यापक विकास योजना र नीतिहरू।" 
  },
  keyDevelopmentAreas: { en: "Key Development Areas", ne: "मुख्य विकास क्षेत्रहरू" },
  ongoingProjects: { en: "Ongoing Projects", ne: "चलिरहेका परियोजनाहरू" },
  iBelieveIn: { en: "I BELIEVE IN", ne: "मेरो विश्वास" },
  peopleFirst: { en: "PEOPLE-FIRST", ne: "जनता पहिलो" },
  
  // Development Areas
  infrastructureDevelopment: { en: "Infrastructure Development", ne: "पूर्वाधार विकास" },
  healthcareServices: { en: "Healthcare Services", ne: "स्वास्थ्य सेवाहरू" },
  educationEnhancement: { en: "Education Enhancement", ne: "शिक्षा सुधार" },
  youthWomenEmpowerment: { en: "Youth & Women Empowerment", ne: "युवा र महिला सशक्तिकरण" },
  agricultureDevelopment: { en: "Agriculture Development", ne: "कृषि विकास" },
  digitalTransformation: { en: "Digital Transformation", ne: "डिजिटल रूपान्तरण" },
  
  // News
  latestNews: { en: "Latest News", ne: "ताजा समाचार" },
  newsDescription: { 
    en: "Stay updated with the latest news and announcements from our municipality.", 
    ne: "हाम्रो नगरपालिकाबाट ताजा समाचार र घोषणाहरूसँग अपडेट रहनुहोस्।" 
  },
  ourPodcasts: { en: "OUR PODCASTS", ne: "हाम्रा पोडकास्टहरू" },
  podcastDescription: { 
    en: "Listen to discussions on development, governance, and community stories.", 
    ne: "विकास, शासन र समुदायका कथाहरूमा छलफल सुन्नुहोस्।" 
  },
  
  // Gallery
  projectGallery: { en: "PROJECT", ne: "परियोजना" },
  galleryDescription: { 
    en: "A visual journey through our development initiatives and community programs.", 
    ne: "हाम्रो विकास पहलहरू र सामुदायिक कार्यक्रमहरूको दृश्य यात्रा।" 
  },
  noGalleryImages: { en: "No gallery images available yet.", ne: "ग्यालरी तस्विरहरू अहिलेसम्म उपलब्ध छैनन्।" },
  
  // Contact Page
  getInTouch: { en: "GET IN TOUCH", ne: "सम्पर्कमा रहनुहोस्" },
  getIn: { en: "GET IN", ne: "सम्पर्क" },
  touch: { en: "TOUCH", ne: "गर्नुहोस्" },
  contactDescription: { 
    en: "Have questions or suggestions? We'd love to hear from you.", 
    ne: "प्रश्न वा सुझावहरू छन्? हामी तपाईंबाट सुन्न चाहन्छौं।" 
  },
  sendMessage: { en: "Send Message", ne: "सन्देश पठाउनुहोस्" },
  sendUsMessage: { en: "Send Us a Message", ne: "हामीलाई सन्देश पठाउनुहोस्" },
  officeAddress: { en: "Office Address", ne: "कार्यालय ठेगाना" },
  phone: { en: "Phone", ne: "फोन" },
  email: { en: "Email", ne: "इमेल" },
  officeHours: { en: "Office Hours", ne: "कार्यालय समय" },
  firstName: { en: "First Name", ne: "पहिलो नाम" },
  lastName: { en: "Last Name", ne: "थर" },
  message: { en: "Message", ne: "सन्देश" },
  enterFirstName: { en: "Enter your first name", ne: "आफ्नो पहिलो नाम लेख्नुहोस्" },
  enterLastName: { en: "Enter your last name", ne: "आफ्नो थर लेख्नुहोस्" },
  enterEmail: { en: "your.email@example.com", ne: "तपाईंको.इमेल@example.com" },
  enterPhone: { en: "+977-XXX-XXXXXX", ne: "+९७७-XXX-XXXXXX" },
  writeMessage: { en: "Write your message here...", ne: "यहाँ आफ्नो सन्देश लेख्नुहोस्..." },
  messageSent: { en: "Message Sent!", ne: "सन्देश पठाइयो!" },
  messageSentDesc: { 
    en: "Thank you for contacting us. We'll get back to you soon.", 
    ne: "सम्पर्क गर्नुभएकोमा धन्यवाद। हामी चाँडै तपाईंलाई जवाफ दिनेछौं।" 
  },
  
  // Footer
  quickLinks: { en: "Quick Links", ne: "छिटो लिंकहरू" },
  contactInfo: { en: "Contact Info", ne: "सम्पर्क जानकारी" },
  followUs: { en: "Follow Us", ne: "हामीलाई फलो गर्नुहोस्" },
  developedWith: { en: "Developed with ❤️ for Bhokraha Narsingh", ne: "भोक्राहा नरसिंहका लागि ❤️ सहित विकसित" },
  
  // Social Media
  shareOnFacebook: { en: "Share on Facebook", ne: "फेसबुकमा साझा गर्नुहोस्" },
  shareOnTwitter: { en: "Share on Twitter", ne: "ट्विटरमा साझा गर्नुहोस्" },
  shareOnLinkedIn: { en: "Share on LinkedIn", ne: "लिंक्डइनमा साझा गर्नुहोस्" },
  shareOnWhatsApp: { en: "Share on WhatsApp", ne: "व्हाट्सएपमा साझा गर्नुहोस्" },
  copyLink: { en: "Copy Link", ne: "लिंक कपी गर्नुहोस्" },
  linkCopied: { en: "Link copied to clipboard!", ne: "लिंक कपी भयो!" },
  
  // Auth
  signIn: { en: "Sign In", ne: "साइन इन" },
  signUp: { en: "Sign Up", ne: "साइन अप" },
  signOut: { en: "Sign Out", ne: "साइन आउट" },
  emailAddress: { en: "Email address", ne: "इमेल ठेगाना" },
  password: { en: "Password", ne: "पासवर्ड" },
  fullName: { en: "Full Name", ne: "पूरा नाम" },
  
  // Podcast
  audio: { en: "Audio", ne: "अडियो" },
  video: { en: "Video", ne: "भिडियो" },
  noPodcasts: { en: "No podcasts available yet.", ne: "पोडकास्टहरू अहिलेसम्म उपलब्ध छैनन्।" },
  
  // Engagement
  likes: { en: "Likes", ne: "मनपर्छ" },
  comments: { en: "Comments", ne: "टिप्पणीहरू" },
  views: { en: "Views", ne: "हेराइहरू" },
  leaveComment: { en: "Leave a Comment", ne: "टिप्पणी छोड्नुहोस्" },
  yourName: { en: "Your Name", ne: "तपाईंको नाम" },
  writeComment: { en: "Write your comment...", ne: "आफ्नो टिप्पणी लेख्नुहोस्..." },
  submitComment: { en: "Submit Comment", ne: "टिप्पणी पेश गर्नुहोस्" },
  submitting: { en: "Submitting...", ne: "पेश गर्दै..." },
  cancel: { en: "Cancel", ne: "रद्द गर्नुहोस्" },
  fillAllFields: { en: "Please fill in all fields", ne: "कृपया सबै फिल्डहरू भर्नुहोस्" },
  commentSubmitted: { en: "Comment submitted for review", ne: "टिप्पणी समीक्षाको लागि पेश गरियो" },
  commentError: { en: "Error submitting comment", ne: "टिप्पणी पेश गर्दा त्रुटि" },
  commentModeration: { en: "Your comment will appear after moderation.", ne: "तपाईंको टिप्पणी मोडरेशन पछि देखिनेछ।" },
  
  // Search
  searchPlaceholder: { en: "Search posts, podcasts, gallery...", ne: "पोस्ट, पोडकास्ट, ग्यालरी खोज्नुहोस्..." },
  noResults: { en: "No results found", ne: "कुनै नतिजा फेला परेन" },
  searchHint: { en: "Type to search...", ne: "खोज्न टाइप गर्नुहोस्..." },
  
  // Read More
  showLess: { en: "Show Less", ne: "कम देखाउनुहोस्" },
  
  // Newsletter
  subscribeNewsletter: { en: "Subscribe to Our Newsletter", ne: "हाम्रो न्यूजलेटरमा सदस्यता लिनुहोस्" },
  newsletterDescription: { en: "Get the latest updates, news, and announcements delivered to your inbox.", ne: "नवीनतम अपडेटहरू, समाचार र घोषणाहरू तपाईंको इनबक्समा प्राप्त गर्नुहोस्।" },
  subscribe: { en: "Subscribe", ne: "सदस्यता लिनुहोस्" },
  noSpam: { en: "We respect your privacy. No spam, unsubscribe anytime.", ne: "हामी तपाईंको गोपनीयताको सम्मान गर्छौं। स्प्याम छैन, कुनै पनि समय अनसब्सक्राइब गर्नुहोस्।" },
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
