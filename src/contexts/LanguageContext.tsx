import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "es" | "fr" | "de" | "pt" | "zh" | "ar" | "ru";

export const LANGUAGE_META: Record<Language, { label: string; native: string; flag: string }> = {
  en: { label: "English", native: "English", flag: "🇬🇧" },
  es: { label: "Spanish", native: "Español", flag: "🇪🇸" },
  fr: { label: "French", native: "Français", flag: "🇫🇷" },
  de: { label: "German", native: "Deutsch", flag: "🇩🇪" },
  pt: { label: "Portuguese", native: "Português", flag: "🇵🇹" },
  zh: { label: "Chinese", native: "中文", flag: "🇨🇳" },
  ar: { label: "Arabic", native: "العربية", flag: "🇸🇦" },
  ru: { label: "Russian", native: "Русский", flag: "🇷🇺" },
};

type TranslationEntry = Partial<Record<Language, string>> & { en: string };

interface Translations {
  [key: string]: TranslationEntry;
}

const translations: Translations = {
  // Navigation
  home: { en: "Home", es: "Inicio", fr: "Accueil", de: "Startseite", pt: "Início", zh: "首页", ar: "الرئيسية", ru: "Главная" },
  about: { en: "About", es: "Acerca", fr: "À propos", de: "Über", pt: "Sobre", zh: "关于", ar: "حول", ru: "О нас" },
  vision: { en: "Vision", es: "Visión", fr: "Vision", de: "Vision", pt: "Visão", zh: "愿景", ar: "رؤية", ru: "Видение" },
  news: { en: "News", es: "Noticias", fr: "Actualités", de: "Nachrichten", pt: "Notícias", zh: "新闻", ar: "أخبار", ru: "Новости" },
  podcasts: { en: "Podcasts", es: "Podcasts", fr: "Podcasts", de: "Podcasts", pt: "Podcasts", zh: "播客", ar: "بودكاست", ru: "Подкасты" },
  gallery: { en: "Gallery", es: "Galería", fr: "Galerie", de: "Galerie", pt: "Galeria", zh: "图库", ar: "معرض", ru: "Галерея" },
  contact: { en: "Contact", es: "Contacto", fr: "Contact", de: "Kontakt", pt: "Contato", zh: "联系", ar: "اتصل", ru: "Контакты" },
  login: { en: "Login", es: "Iniciar sesión", fr: "Connexion", de: "Anmelden", pt: "Entrar", zh: "登录", ar: "تسجيل الدخول", ru: "Войти" },

  // Common
  readMore: { en: "Read More", es: "Leer más", fr: "Lire plus", de: "Mehr lesen", pt: "Ler mais", zh: "阅读更多", ar: "اقرأ المزيد", ru: "Читать далее" },
  watchVideo: { en: "Watch Video", es: "Ver video", fr: "Regarder", de: "Video ansehen", pt: "Assistir", zh: "观看视频", ar: "شاهد الفيديو", ru: "Смотреть видео" },
  learnMore: { en: "Learn More", es: "Saber más", fr: "En savoir plus", de: "Mehr erfahren", pt: "Saiba mais", zh: "了解更多", ar: "اعرف المزيد", ru: "Узнать больше" },
  play: { en: "Play", es: "Reproducir", fr: "Lire", de: "Abspielen", pt: "Reproduzir", zh: "播放", ar: "تشغيل", ru: "Играть" },
  pause: { en: "Pause", es: "Pausa", fr: "Pause", de: "Pause", pt: "Pausa", zh: "暂停", ar: "إيقاف", ru: "Пауза" },
  pinned: { en: "Pinned", es: "Fijado", fr: "Épinglé", de: "Angeheftet", pt: "Fixado", zh: "已置顶", ar: "مثبت", ru: "Закреплено" },
  share: { en: "Share", es: "Compartir", fr: "Partager", de: "Teilen", pt: "Compartilhar", zh: "分享", ar: "مشاركة", ru: "Поделиться" },
  loading: { en: "Loading...", es: "Cargando...", fr: "Chargement...", de: "Laden...", pt: "Carregando...", zh: "加载中...", ar: "جار التحميل...", ru: "Загрузка..." },

  // Hero
  togetherFor: { en: "TOGETHER FOR", es: "JUNTOS POR", fr: "ENSEMBLE POUR", de: "GEMEINSAM FÜR", pt: "JUNTOS POR", zh: "携手共建", ar: "معاً من أجل", ru: "ВМЕСТЕ ЗА" },
  aProsperous: { en: "A PROSPEROUS", es: "UN PRÓSPERO", fr: "UN PROSPÈRE", de: "EIN BLÜHENDES", pt: "UM PRÓSPERO", zh: "繁荣的", ar: "مزدهرة", ru: "ПРОЦВЕТАЮЩИЙ" },
  bhokrahaNarsingh: { en: "BHOKRAHA NARSINGH", es: "BHOKRAHA NARSINGH", fr: "BHOKRAHA NARSINGH", de: "BHOKRAHA NARSINGH", pt: "BHOKRAHA NARSINGH", zh: "BHOKRAHA NARSINGH", ar: "بوكراها نارسينغ", ru: "БХОКРАХА НАРСИНГХ" },
  heroDescription: {
    en: "Working hand-in-hand with citizens for development, dignity, and democracy.",
    es: "Trabajando de la mano con los ciudadanos por el desarrollo, la dignidad y la democracia.",
    fr: "Travailler main dans la main avec les citoyens pour le développement, la dignité et la démocratie.",
    de: "Hand in Hand mit den Bürgern für Entwicklung, Würde und Demokratie.",
    pt: "Trabalhando lado a lado com os cidadãos pelo desenvolvimento, dignidade e democracia.",
    zh: "与公民携手共进,推动发展、尊严与民主。",
    ar: "نعمل يداً بيد مع المواطنين من أجل التنمية والكرامة والديمقراطية.",
    ru: "Работаем рука об руку с гражданами ради развития, достоинства и демократии.",
  },

  // About
  meetMayor: { en: "MEET", es: "CONOCE", fr: "RENCONTREZ", de: "TREFFEN SIE", pt: "CONHEÇA", zh: "认识", ar: "تعرّف على", ru: "ПОЗНАКОМЬТЕСЬ" },
  theJourney: { en: "The Journey", es: "El Camino", fr: "Le Parcours", de: "Die Reise", pt: "A Jornada", zh: "历程", ar: "الرحلة", ru: "Путь" },
  missionAndValues: { en: "Mission & Values", es: "Misión y Valores", fr: "Mission et Valeurs", de: "Mission & Werte", pt: "Missão e Valores", zh: "使命与价值", ar: "المهمة والقيم", ru: "Миссия и ценности" },
  keyAchievements: { en: "Key Achievements", es: "Logros Clave", fr: "Réalisations Clés", de: "Wichtige Erfolge", pt: "Principais Conquistas", zh: "主要成就", ar: "الإنجازات الرئيسية", ru: "Ключевые достижения" },
  aboutDescription: {
    en: "A dedicated public servant committed to transforming Bhokraha Narsingh through inclusive development and transparent governance.",
    es: "Un servidor público dedicado a transformar Bhokraha Narsingh mediante un desarrollo inclusivo y una gobernanza transparente.",
    fr: "Un serviteur public dévoué, engagé à transformer Bhokraha Narsingh grâce à un développement inclusif et une gouvernance transparente.",
    de: "Ein engagierter öffentlicher Bediensteter, der sich der Transformation von Bhokraha Narsingh durch inklusive Entwicklung und transparente Regierungsführung widmet.",
    pt: "Um servidor público dedicado a transformar Bhokraha Narsingh por meio do desenvolvimento inclusivo e da governança transparente.",
    zh: "致力于通过包容性发展和透明治理改变 Bhokraha Narsingh 的敬业公仆。",
    ar: "موظف عام مخلص ملتزم بتحويل بوكراها نارسينغ من خلال التنمية الشاملة والحوكمة الشفافة.",
    ru: "Преданный своему делу государственный служащий, стремящийся преобразить Бхокраху Нарсингх через инклюзивное развитие и прозрачное управление.",
  },

  // Vision
  visionAndDevelopment: { en: "VISION &", es: "VISIÓN Y", fr: "VISION ET", de: "VISION &", pt: "VISÃO E", zh: "愿景与", ar: "الرؤية و", ru: "ВИДЕНИЕ И" },
  development: { en: "DEVELOPMENT", es: "DESARROLLO", fr: "DÉVELOPPEMENT", de: "ENTWICKLUNG", pt: "DESENVOLVIMENTO", zh: "发展", ar: "التنمية", ru: "РАЗВИТИЕ" },
  visionDescription: {
    en: "Comprehensive development plans and policies for a prosperous Bhokraha Narsingh.",
    es: "Planes y políticas integrales de desarrollo para una próspera Bhokraha Narsingh.",
    fr: "Plans et politiques de développement complets pour une Bhokraha Narsingh prospère.",
    de: "Umfassende Entwicklungspläne und -richtlinien für ein blühendes Bhokraha Narsingh.",
    pt: "Planos e políticas de desenvolvimento abrangentes para uma próspera Bhokraha Narsingh.",
    zh: "为繁荣的 Bhokraha Narsingh 制定全面的发展计划和政策。",
    ar: "خطط وسياسات تنموية شاملة من أجل بوكراها نارسينغ مزدهرة.",
    ru: "Комплексные планы и политика развития процветающей Бхокрахи Нарсингх.",
  },
  keyDevelopmentAreas: { en: "Key Development Areas", es: "Áreas Clave de Desarrollo", fr: "Domaines Clés de Développement", de: "Wichtige Entwicklungsbereiche", pt: "Áreas-Chave de Desenvolvimento", zh: "重点发展领域", ar: "مجالات التنمية الرئيسية", ru: "Ключевые направления развития" },
  ongoingProjects: { en: "Ongoing Projects", es: "Proyectos en Curso", fr: "Projets en Cours", de: "Laufende Projekte", pt: "Projetos em Andamento", zh: "正在进行的项目", ar: "المشاريع الجارية", ru: "Текущие проекты" },
  iBelieveIn: { en: "I BELIEVE IN", es: "CREO EN", fr: "JE CROIS EN", de: "ICH GLAUBE AN", pt: "EU ACREDITO EM", zh: "我相信", ar: "أؤمن بـ", ru: "Я ВЕРЮ В" },
  peopleFirst: { en: "PEOPLE-FIRST", es: "LA GENTE PRIMERO", fr: "LES GENS D'ABORD", de: "MENSCHEN ZUERST", pt: "PESSOAS PRIMEIRO", zh: "以人为本", ar: "الناس أولاً", ru: "ЛЮДИ ПРЕЖДЕ ВСЕГО" },

  // Development Areas
  infrastructureDevelopment: { en: "Infrastructure Development", es: "Desarrollo de Infraestructura", fr: "Développement des Infrastructures", de: "Infrastrukturentwicklung", pt: "Desenvolvimento de Infraestrutura", zh: "基础设施发展", ar: "تطوير البنية التحتية", ru: "Развитие инфраструктуры" },
  healthcareServices: { en: "Healthcare Services", es: "Servicios de Salud", fr: "Services de Santé", de: "Gesundheitsdienste", pt: "Serviços de Saúde", zh: "医疗服务", ar: "خدمات الرعاية الصحية", ru: "Здравоохранение" },
  educationEnhancement: { en: "Education Enhancement", es: "Mejora Educativa", fr: "Amélioration de l'Éducation", de: "Bildungsförderung", pt: "Melhoria da Educação", zh: "教育提升", ar: "تعزيز التعليم", ru: "Улучшение образования" },
  youthWomenEmpowerment: { en: "Youth & Women Empowerment", es: "Empoderamiento de Jóvenes y Mujeres", fr: "Autonomisation des Jeunes et des Femmes", de: "Stärkung von Jugend und Frauen", pt: "Empoderamento de Jovens e Mulheres", zh: "青年与妇女赋权", ar: "تمكين الشباب والمرأة", ru: "Расширение прав молодёжи и женщин" },
  agricultureDevelopment: { en: "Agriculture Development", es: "Desarrollo Agrícola", fr: "Développement Agricole", de: "Landwirtschaftsentwicklung", pt: "Desenvolvimento Agrícola", zh: "农业发展", ar: "التنمية الزراعية", ru: "Развитие сельского хозяйства" },
  digitalTransformation: { en: "Digital Transformation", es: "Transformación Digital", fr: "Transformation Numérique", de: "Digitale Transformation", pt: "Transformação Digital", zh: "数字化转型", ar: "التحول الرقمي", ru: "Цифровая трансформация" },

  // News
  latestNews: { en: "Latest News", es: "Últimas Noticias", fr: "Dernières Actualités", de: "Aktuelle Nachrichten", pt: "Últimas Notícias", zh: "最新新闻", ar: "آخر الأخبار", ru: "Последние новости" },
  newsDescription: {
    en: "Stay updated with the latest news and announcements from our municipality.",
    es: "Mantente al día con las últimas noticias y anuncios de nuestro municipio.",
    fr: "Restez informé des dernières nouvelles et annonces de notre municipalité.",
    de: "Bleiben Sie über die neuesten Nachrichten und Ankündigungen unserer Gemeinde informiert.",
    pt: "Fique por dentro das últimas notícias e anúncios do nosso município.",
    zh: "及时了解我们市政府的最新新闻和公告。",
    ar: "ابق على اطلاع بآخر الأخبار والإعلانات من بلديتنا.",
    ru: "Будьте в курсе последних новостей и объявлений нашего муниципалитета.",
  },
  ourPodcasts: { en: "OUR PODCASTS", es: "NUESTROS PODCASTS", fr: "NOS PODCASTS", de: "UNSERE PODCASTS", pt: "NOSSOS PODCASTS", zh: "我们的播客", ar: "بودكاستاتنا", ru: "НАШИ ПОДКАСТЫ" },
  podcastDescription: {
    en: "Listen to discussions on development, governance, and community stories.",
    es: "Escucha debates sobre desarrollo, gobernanza e historias de la comunidad.",
    fr: "Écoutez des discussions sur le développement, la gouvernance et les histoires de la communauté.",
    de: "Hören Sie Diskussionen über Entwicklung, Governance und Gemeinschaftsgeschichten.",
    pt: "Ouça discussões sobre desenvolvimento, governança e histórias da comunidade.",
    zh: "聆听关于发展、治理和社区故事的讨论。",
    ar: "استمع إلى مناقشات حول التنمية والحوكمة وقصص المجتمع.",
    ru: "Слушайте обсуждения о развитии, управлении и историях сообщества.",
  },

  // Gallery
  projectGallery: { en: "PROJECT", es: "PROYECTO", fr: "PROJET", de: "PROJEKT", pt: "PROJETO", zh: "项目", ar: "المشروع", ru: "ПРОЕКТ" },
  galleryDescription: {
    en: "A visual journey through our development initiatives and community programs.",
    es: "Un viaje visual a través de nuestras iniciativas de desarrollo y programas comunitarios.",
    fr: "Un voyage visuel à travers nos initiatives de développement et programmes communautaires.",
    de: "Eine visuelle Reise durch unsere Entwicklungsinitiativen und Gemeinschaftsprogramme.",
    pt: "Uma jornada visual pelas nossas iniciativas de desenvolvimento e programas comunitários.",
    zh: "通过视觉呈现我们的发展计划和社区项目。",
    ar: "رحلة بصرية عبر مبادراتنا التنموية وبرامجنا المجتمعية.",
    ru: "Визуальное путешествие по нашим инициативам и программам сообщества.",
  },
  noGalleryImages: { en: "No gallery images available yet.", es: "Aún no hay imágenes en la galería.", fr: "Aucune image de galerie disponible.", de: "Noch keine Galeriebilder verfügbar.", pt: "Nenhuma imagem na galeria ainda.", zh: "暂无图库图片。", ar: "لا توجد صور في المعرض بعد.", ru: "Изображений в галерее пока нет." },

  // Contact
  getInTouch: { en: "GET IN TOUCH", es: "PONTE EN CONTACTO", fr: "CONTACTEZ-NOUS", de: "KONTAKT", pt: "ENTRE EM CONTATO", zh: "联系我们", ar: "تواصل معنا", ru: "СВЯЖИТЕСЬ С НАМИ" },
  getIn: { en: "GET IN", es: "PONTE EN", fr: "ENTRER EN", de: "IN", pt: "ENTRE EM", zh: "联系", ar: "تواصل", ru: "СВЯЖИТЕСЬ" },
  touch: { en: "TOUCH", es: "CONTACTO", fr: "CONTACT", de: "KONTAKT", pt: "CONTATO", zh: "我们", ar: "معنا", ru: "С НАМИ" },
  contactDescription: {
    en: "Have questions or suggestions? We'd love to hear from you.",
    es: "¿Tienes preguntas o sugerencias? Nos encantaría saber de ti.",
    fr: "Des questions ou des suggestions ? Nous serions ravis d'avoir de vos nouvelles.",
    de: "Haben Sie Fragen oder Anregungen? Wir freuen uns von Ihnen zu hören.",
    pt: "Tem perguntas ou sugestões? Adoraríamos ouvir você.",
    zh: "有问题或建议吗?我们很乐意听取您的意见。",
    ar: "هل لديك أسئلة أو اقتراحات؟ يسعدنا سماع آرائك.",
    ru: "Есть вопросы или предложения? Мы будем рады услышать вас.",
  },
  sendMessage: { en: "Send Message", es: "Enviar Mensaje", fr: "Envoyer", de: "Nachricht senden", pt: "Enviar Mensagem", zh: "发送消息", ar: "إرسال رسالة", ru: "Отправить" },
  sendUsMessage: { en: "Send Us a Message", es: "Envíanos un Mensaje", fr: "Envoyez-nous un Message", de: "Senden Sie uns eine Nachricht", pt: "Envie-nos uma Mensagem", zh: "给我们发消息", ar: "أرسل لنا رسالة", ru: "Напишите нам" },
  officeAddress: { en: "Office Address", es: "Dirección de Oficina", fr: "Adresse du Bureau", de: "Büroadresse", pt: "Endereço do Escritório", zh: "办公地址", ar: "عنوان المكتب", ru: "Адрес офиса" },
  phone: { en: "Phone", es: "Teléfono", fr: "Téléphone", de: "Telefon", pt: "Telefone", zh: "电话", ar: "هاتف", ru: "Телефон" },
  email: { en: "Email", es: "Correo", fr: "Courriel", de: "E-Mail", pt: "E-mail", zh: "邮箱", ar: "البريد", ru: "Эл. почта" },
  officeHours: { en: "Office Hours", es: "Horario", fr: "Heures d'ouverture", de: "Öffnungszeiten", pt: "Horário", zh: "办公时间", ar: "ساعات العمل", ru: "Часы работы" },
  firstName: { en: "First Name", es: "Nombre", fr: "Prénom", de: "Vorname", pt: "Nome", zh: "名字", ar: "الاسم الأول", ru: "Имя" },
  lastName: { en: "Last Name", es: "Apellido", fr: "Nom", de: "Nachname", pt: "Sobrenome", zh: "姓氏", ar: "اسم العائلة", ru: "Фамилия" },
  message: { en: "Message", es: "Mensaje", fr: "Message", de: "Nachricht", pt: "Mensagem", zh: "消息", ar: "رسالة", ru: "Сообщение" },
  enterFirstName: { en: "Enter your first name", es: "Ingresa tu nombre", fr: "Entrez votre prénom", de: "Geben Sie Ihren Vornamen ein", pt: "Digite seu nome", zh: "输入您的名字", ar: "أدخل اسمك الأول", ru: "Введите ваше имя" },
  enterLastName: { en: "Enter your last name", es: "Ingresa tu apellido", fr: "Entrez votre nom", de: "Geben Sie Ihren Nachnamen ein", pt: "Digite seu sobrenome", zh: "输入您的姓氏", ar: "أدخل اسم العائلة", ru: "Введите вашу фамилию" },
  enterEmail: { en: "your.email@example.com", es: "tu.correo@ejemplo.com", fr: "votre.email@exemple.com", de: "ihre.email@beispiel.com", pt: "seu.email@exemplo.com", zh: "your.email@example.com", ar: "your.email@example.com", ru: "your.email@example.com" },
  enterPhone: { en: "+1-XXX-XXX-XXXX", es: "+1-XXX-XXX-XXXX", fr: "+1-XXX-XXX-XXXX", de: "+1-XXX-XXX-XXXX", pt: "+1-XXX-XXX-XXXX", zh: "+1-XXX-XXX-XXXX", ar: "+1-XXX-XXX-XXXX", ru: "+1-XXX-XXX-XXXX" },
  writeMessage: { en: "Write your message here...", es: "Escribe tu mensaje aquí...", fr: "Écrivez votre message ici...", de: "Schreiben Sie Ihre Nachricht hier...", pt: "Escreva sua mensagem aqui...", zh: "在此输入您的消息...", ar: "اكتب رسالتك هنا...", ru: "Напишите ваше сообщение..." },
  messageSent: { en: "Message Sent!", es: "¡Mensaje Enviado!", fr: "Message Envoyé !", de: "Nachricht gesendet!", pt: "Mensagem Enviada!", zh: "消息已发送!", ar: "تم إرسال الرسالة!", ru: "Сообщение отправлено!" },
  messageSentDesc: {
    en: "Thank you for contacting us. We'll get back to you soon.",
    es: "Gracias por contactarnos. Te responderemos pronto.",
    fr: "Merci de nous avoir contactés. Nous vous répondrons bientôt.",
    de: "Danke für Ihre Nachricht. Wir melden uns bald bei Ihnen.",
    pt: "Obrigado por nos contatar. Retornaremos em breve.",
    zh: "感谢您的联系,我们将尽快回复。",
    ar: "شكراً لتواصلك معنا. سنرد عليك قريباً.",
    ru: "Спасибо за обращение. Мы свяжемся с вами в ближайшее время.",
  },

  // Footer
  quickLinks: { en: "Quick Links", es: "Enlaces Rápidos", fr: "Liens Rapides", de: "Schnellzugriff", pt: "Links Rápidos", zh: "快速链接", ar: "روابط سريعة", ru: "Быстрые ссылки" },
  contactInfo: { en: "Contact Info", es: "Información de Contacto", fr: "Coordonnées", de: "Kontaktinfo", pt: "Contato", zh: "联系方式", ar: "معلومات الاتصال", ru: "Контакты" },
  followUs: { en: "Follow Us", es: "Síguenos", fr: "Suivez-nous", de: "Folgen Sie uns", pt: "Siga-nos", zh: "关注我们", ar: "تابعنا", ru: "Подпишитесь" },
  developedWith: { en: "Developed with ❤️ for Bhokraha Narsingh", es: "Desarrollado con ❤️ para Bhokraha Narsingh", fr: "Développé avec ❤️ pour Bhokraha Narsingh", de: "Entwickelt mit ❤️ für Bhokraha Narsingh", pt: "Desenvolvido com ❤️ para Bhokraha Narsingh", zh: "用 ❤️ 为 Bhokraha Narsingh 开发", ar: "تم التطوير بـ ❤️ من أجل بوكراها نارسينغ", ru: "Создано с ❤️ для Бхокрахи Нарсингх" },

  // Social
  shareOnFacebook: { en: "Share on Facebook", es: "Compartir en Facebook", fr: "Partager sur Facebook", de: "Auf Facebook teilen", pt: "Compartilhar no Facebook", zh: "分享到 Facebook", ar: "مشاركة على فيسبوك", ru: "Поделиться в Facebook" },
  shareOnTwitter: { en: "Share on Twitter", es: "Compartir en Twitter", fr: "Partager sur Twitter", de: "Auf Twitter teilen", pt: "Compartilhar no Twitter", zh: "分享到 Twitter", ar: "مشاركة على تويتر", ru: "Поделиться в Twitter" },
  shareOnLinkedIn: { en: "Share on LinkedIn", es: "Compartir en LinkedIn", fr: "Partager sur LinkedIn", de: "Auf LinkedIn teilen", pt: "Compartilhar no LinkedIn", zh: "分享到 LinkedIn", ar: "مشاركة على لينكد إن", ru: "Поделиться в LinkedIn" },
  shareOnWhatsApp: { en: "Share on WhatsApp", es: "Compartir en WhatsApp", fr: "Partager sur WhatsApp", de: "Auf WhatsApp teilen", pt: "Compartilhar no WhatsApp", zh: "分享到 WhatsApp", ar: "مشاركة على واتساب", ru: "Поделиться в WhatsApp" },
  copyLink: { en: "Copy Link", es: "Copiar Enlace", fr: "Copier le Lien", de: "Link kopieren", pt: "Copiar Link", zh: "复制链接", ar: "نسخ الرابط", ru: "Скопировать" },
  linkCopied: { en: "Link copied to clipboard!", es: "¡Enlace copiado!", fr: "Lien copié !", de: "Link kopiert!", pt: "Link copiado!", zh: "链接已复制!", ar: "تم نسخ الرابط!", ru: "Ссылка скопирована!" },

  // Auth
  signIn: { en: "Sign In", es: "Iniciar sesión", fr: "Se connecter", de: "Anmelden", pt: "Entrar", zh: "登录", ar: "تسجيل الدخول", ru: "Войти" },
  signUp: { en: "Sign Up", es: "Registrarse", fr: "S'inscrire", de: "Registrieren", pt: "Cadastrar", zh: "注册", ar: "إنشاء حساب", ru: "Регистрация" },
  signOut: { en: "Sign Out", es: "Cerrar sesión", fr: "Se déconnecter", de: "Abmelden", pt: "Sair", zh: "退出", ar: "تسجيل الخروج", ru: "Выйти" },
  emailAddress: { en: "Email address", es: "Correo electrónico", fr: "Adresse e-mail", de: "E-Mail-Adresse", pt: "Endereço de e-mail", zh: "邮箱地址", ar: "البريد الإلكتروني", ru: "Эл. адрес" },
  password: { en: "Password", es: "Contraseña", fr: "Mot de passe", de: "Passwort", pt: "Senha", zh: "密码", ar: "كلمة المرور", ru: "Пароль" },
  fullName: { en: "Full Name", es: "Nombre Completo", fr: "Nom Complet", de: "Vollständiger Name", pt: "Nome Completo", zh: "全名", ar: "الاسم الكامل", ru: "Полное имя" },

  // Podcast
  audio: { en: "Audio", es: "Audio", fr: "Audio", de: "Audio", pt: "Áudio", zh: "音频", ar: "صوت", ru: "Аудио" },
  video: { en: "Video", es: "Video", fr: "Vidéo", de: "Video", pt: "Vídeo", zh: "视频", ar: "فيديو", ru: "Видео" },
  noPodcasts: { en: "No podcasts available yet.", es: "Aún no hay podcasts disponibles.", fr: "Aucun podcast disponible.", de: "Noch keine Podcasts verfügbar.", pt: "Nenhum podcast disponível.", zh: "暂无播客。", ar: "لا توجد بودكاستات بعد.", ru: "Подкастов пока нет." },

  // Engagement
  likes: { en: "Likes", es: "Me gusta", fr: "J'aime", de: "Gefällt mir", pt: "Curtidas", zh: "点赞", ar: "إعجابات", ru: "Лайки" },
  comments: { en: "Comments", es: "Comentarios", fr: "Commentaires", de: "Kommentare", pt: "Comentários", zh: "评论", ar: "تعليقات", ru: "Комментарии" },
  views: { en: "Views", es: "Vistas", fr: "Vues", de: "Ansichten", pt: "Visualizações", zh: "浏览", ar: "مشاهدات", ru: "Просмотры" },
  leaveComment: { en: "Leave a Comment", es: "Deja un Comentario", fr: "Laisser un Commentaire", de: "Kommentar hinterlassen", pt: "Deixe um Comentário", zh: "发表评论", ar: "اترك تعليقاً", ru: "Оставить комментарий" },
  yourName: { en: "Your Name", es: "Tu Nombre", fr: "Votre Nom", de: "Ihr Name", pt: "Seu Nome", zh: "您的姓名", ar: "اسمك", ru: "Ваше имя" },
  writeComment: { en: "Write your comment...", es: "Escribe tu comentario...", fr: "Écrivez votre commentaire...", de: "Schreiben Sie Ihren Kommentar...", pt: "Escreva seu comentário...", zh: "写下您的评论...", ar: "اكتب تعليقك...", ru: "Напишите комментарий..." },
  submitComment: { en: "Submit Comment", es: "Enviar Comentario", fr: "Envoyer", de: "Kommentar senden", pt: "Enviar Comentário", zh: "提交评论", ar: "إرسال التعليق", ru: "Отправить" },
  submitting: { en: "Submitting...", es: "Enviando...", fr: "Envoi...", de: "Wird gesendet...", pt: "Enviando...", zh: "提交中...", ar: "جار الإرسال...", ru: "Отправка..." },
  cancel: { en: "Cancel", es: "Cancelar", fr: "Annuler", de: "Abbrechen", pt: "Cancelar", zh: "取消", ar: "إلغاء", ru: "Отмена" },
  fillAllFields: { en: "Please fill in all fields", es: "Por favor completa todos los campos", fr: "Veuillez remplir tous les champs", de: "Bitte alle Felder ausfüllen", pt: "Preencha todos os campos", zh: "请填写所有字段", ar: "يرجى ملء جميع الحقول", ru: "Заполните все поля" },
  commentSubmitted: { en: "Comment submitted for review", es: "Comentario enviado para revisión", fr: "Commentaire soumis pour examen", de: "Kommentar zur Überprüfung eingereicht", pt: "Comentário enviado para revisão", zh: "评论已提交审核", ar: "تم إرسال التعليق للمراجعة", ru: "Комментарий отправлен на модерацию" },
  commentError: { en: "Error submitting comment", es: "Error al enviar el comentario", fr: "Erreur lors de l'envoi", de: "Fehler beim Senden", pt: "Erro ao enviar comentário", zh: "提交评论出错", ar: "خطأ في إرسال التعليق", ru: "Ошибка отправки" },
  commentModeration: { en: "Your comment will appear after moderation.", es: "Tu comentario aparecerá tras moderación.", fr: "Votre commentaire apparaîtra après modération.", de: "Ihr Kommentar erscheint nach Moderation.", pt: "Seu comentário aparecerá após moderação.", zh: "您的评论将在审核后显示。", ar: "سيظهر تعليقك بعد المراجعة.", ru: "Комментарий появится после модерации." },

  // Search
  searchPlaceholder: { en: "Search posts, podcasts, gallery...", es: "Buscar publicaciones, podcasts, galería...", fr: "Rechercher articles, podcasts, galerie...", de: "Beiträge, Podcasts, Galerie suchen...", pt: "Pesquisar publicações, podcasts...", zh: "搜索帖子、播客、图库...", ar: "ابحث في المقالات والبودكاست...", ru: "Поиск публикаций, подкастов..." },
  noResults: { en: "No results found", es: "No se encontraron resultados", fr: "Aucun résultat", de: "Keine Ergebnisse", pt: "Nenhum resultado", zh: "未找到结果", ar: "لا توجد نتائج", ru: "Ничего не найдено" },
  searchHint: { en: "Type to search...", es: "Escribe para buscar...", fr: "Tapez pour rechercher...", de: "Tippen zum Suchen...", pt: "Digite para pesquisar...", zh: "输入搜索...", ar: "اكتب للبحث...", ru: "Введите для поиска..." },

  // Read More
  showLess: { en: "Show Less", es: "Mostrar Menos", fr: "Voir Moins", de: "Weniger anzeigen", pt: "Mostrar Menos", zh: "收起", ar: "عرض أقل", ru: "Свернуть" },

  // Newsletter
  subscribeNewsletter: { en: "Subscribe to Our Newsletter", es: "Suscríbete a Nuestro Boletín", fr: "Abonnez-vous à Notre Newsletter", de: "Abonnieren Sie unseren Newsletter", pt: "Assine Nosso Boletim", zh: "订阅我们的新闻通讯", ar: "اشترك في نشرتنا الإخبارية", ru: "Подпишитесь на рассылку" },
  newsletterDescription: { en: "Get the latest updates, news, and announcements delivered to your inbox.", es: "Recibe las últimas actualizaciones y noticias en tu bandeja de entrada.", fr: "Recevez les dernières mises à jour et nouvelles dans votre boîte de réception.", de: "Erhalten Sie die neuesten Updates und Nachrichten in Ihrem Posteingang.", pt: "Receba as últimas atualizações e notícias em sua caixa de entrada.", zh: "在您的收件箱中获取最新更新、新闻和公告。", ar: "احصل على أحدث التحديثات والأخبار في بريدك الوارد.", ru: "Получайте последние новости прямо на почту." },
  subscribe: { en: "Subscribe", es: "Suscribir", fr: "S'abonner", de: "Abonnieren", pt: "Assinar", zh: "订阅", ar: "اشترك", ru: "Подписаться" },
  noSpam: { en: "We respect your privacy. No spam, unsubscribe anytime.", es: "Respetamos tu privacidad. Sin spam, cancela cuando quieras.", fr: "Nous respectons votre vie privée. Pas de spam, désabonnez-vous à tout moment.", de: "Wir respektieren Ihre Privatsphäre. Kein Spam, jederzeit kündbar.", pt: "Respeitamos sua privacidade. Sem spam, cancele a qualquer momento.", zh: "我们尊重您的隐私。无垃圾邮件,随时取消订阅。", ar: "نحترم خصوصيتك. لا رسائل مزعجة، يمكنك إلغاء الاشتراك في أي وقت.", ru: "Мы уважаем вашу конфиденциальность. Без спама, отписаться в любой момент." },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const RTL_LANGUAGES: Language[] = ["ar"];

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
