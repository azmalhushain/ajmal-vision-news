import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

type Section = { h: string; p: string[] };

const updated = "November 4, 2026";

const privacy: Section[] = [
  { h: "Who we are", p: ["This is the official website of Ajmal Akhtar Azad, Mayor of Bhokraha Narsingh Municipality, Sunsari, Nepal (ajmalakhtar.com.np)."] },
  { h: "Information we collect", p: [
    "Account details you give us when signing up: name, email address, and optionally phone number and profile photo.",
    "Messages you send through the contact form, comments you post, and newsletter sign-ups.",
    "Basic, anonymous usage information such as pages visited and time on page, used to improve the website.",
    "If you allow notifications, a technical device address used only to deliver those notifications.",
  ]},
  { h: "How we use it", p: [
    "To respond to citizen messages and inquiries.",
    "To send news, announcements, and newsletters you have chosen to receive.",
    "To keep the website secure and prevent misuse.",
    "We never sell or rent your personal information.",
  ]},
  { h: "Your choices", p: [
    "You can unsubscribe from emails at any time using the link in every email or the preferences page.",
    "You can turn off notifications in your browser settings at any time.",
    "You can ask us to correct or delete your account and data by contacting us.",
  ]},
  { h: "Security", p: ["Your data is stored on secure, encrypted servers with access limited to authorised staff."] },
  { h: "Contact", p: ["For privacy questions, please use our contact page or email info@bhokrahanarsingh.gov.np."] },
];

const terms: Section[] = [
  { h: "Acceptance", p: ["By using this website you agree to these terms. If you do not agree, please do not use the site."] },
  { h: "Purpose of the website", p: ["This website shares official news, development updates, media and civic information. Content is provided for public information."] },
  { h: "User accounts and comments", p: [
    "You are responsible for keeping your account secure.",
    "Comments must be respectful. Hate speech, harassment, false information, spam, or illegal content will be removed and accounts may be suspended.",
  ]},
  { h: "Content and copyright", p: ["Photos, videos, articles and logos on this website belong to their respective owners. You may share links to our content; please ask before reusing it."] },
  { h: "No guarantee", p: ["We try to keep information accurate and up to date, but cannot guarantee it is always complete. Official municipal notices take precedence."] },
  { h: "Changes", p: ["We may update these terms from time to time. The date at the top shows the latest version."] },
  { h: "Governing law", p: ["These terms are governed by the laws of Nepal."] },
];

const Legal = ({ kind }: { kind: "privacy" | "terms" }) => {
  const isPrivacy = kind === "privacy";
  const title = isPrivacy ? "Privacy Policy" : "Terms & Conditions";
  const sections = isPrivacy ? privacy : terms;
  return (
    <>
      <SEOHead title={`${title} | Ajmal Akhtar Azad`} description={isPrivacy ? "How ajmalakhtar.com.np collects, uses and protects your information." : "Terms for using the official website of Ajmal Akhtar Azad."} />
      <main className="min-h-screen pt-28 pb-16 px-4">
        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto rounded-3xl border border-border bg-card/60 backdrop-blur-xl p-6 sm:p-10 shadow-xl">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2">Last updated: {updated}</p>
          <div className="mt-8 space-y-8">
            {sections.map((s, i) => (
              <section key={s.h}>
                <h2 className="text-lg font-bold mb-2">{i + 1}. {s.h}</h2>
                {s.p.length > 1
                  ? <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-sm leading-relaxed">{s.p.map((x) => <li key={x}>{x}</li>)}</ul>
                  : <p className="text-muted-foreground text-sm leading-relaxed">{s.p[0]}</p>}
              </section>
            ))}
          </div>
          <div className="mt-10 pt-6 border-t border-border text-sm">
            <Link to={isPrivacy ? "/terms" : "/privacy"} className="text-primary hover:underline">
              {isPrivacy ? "Read our Terms & Conditions →" : "Read our Privacy Policy →"}
            </Link>
          </div>
        </motion.article>
      </main>
      <Footer />
    </>
  );
};

export default Legal;
