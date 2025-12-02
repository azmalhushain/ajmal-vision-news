import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEOHead = ({
  title = "Ajmal Akhtar Azad - Mayor of Bhokraha Narsingh Municipality",
  description = "Official website of Mayor Ajmal Akhtar Azad - Bhokraha Narsingh Municipality. Together for development, dignity, and democracy.",
  image = "https://storage.googleapis.com/gpt-engineer-file-uploads/6j4N84GNxsXn52PqWIVTQd9p8RI2/social-images/social-1764428453124-image1.jpg",
  url,
  type = "website",
}: SEOHeadProps) => {
  const fullUrl = url ? `${window.location.origin}${url}` : window.location.href;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};
