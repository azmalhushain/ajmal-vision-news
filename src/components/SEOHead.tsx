import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export const SEOHead = ({
  title = "Ajmal Akhtar Azad - Mayor of Bhokraha Narsingh Municipality",
  description = "Official website of Mayor Ajmal Akhtar Azad - Bhokraha Narsingh Municipality. Together for development, dignity, and democracy.",
  image = "https://storage.googleapis.com/gpt-engineer-file-uploads/6j4N84GNxsXn52PqWIVTQd9p8RI2/social-images/social-1764428453124-image1.jpg",
  url,
  type = "website",
  keywords = "Ajmal Akhtar Azad, Mayor, Bhokraha Narsingh, Municipality, Nepal, Development, Local Government",
  author = "Ajmal Akhtar Azad",
  publishedTime,
  modifiedTime,
}: SEOHeadProps) => {
  const fullUrl = url ? `${window.location.origin}${url}` : window.location.href;
  const siteName = "Ajmal Akhtar Azad";

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@AjmalAkhtarAzad" />
      <meta name="twitter:creator" content="@AjmalAkhtarAzad" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />

      {/* Article-specific tags */}
      {type === "article" && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          <meta property="article:author" content={author} />
          <meta property="article:section" content="News" />
        </>
      )}

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === "article" ? "NewsArticle" : "WebSite",
          name: siteName,
          url: fullUrl,
          image: image,
          description: description,
          author: {
            "@type": "Person",
            name: author,
            jobTitle: "Mayor",
            worksFor: {
              "@type": "GovernmentOrganization",
              name: "Bhokraha Narsingh Municipality",
            },
          },
          publisher: {
            "@type": "Organization",
            name: siteName,
            logo: {
              "@type": "ImageObject",
              url: image,
            },
          },
          ...(type === "article" && publishedTime
            ? { datePublished: publishedTime, dateModified: modifiedTime || publishedTime }
            : {}),
        })}
      </script>

      {/* Local Business Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "GovernmentOffice",
          name: "Office of Mayor Ajmal Akhtar Azad",
          description: "Official office of the Mayor of Bhokraha Narsingh Municipality",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Bhokraha Narsingh",
            addressRegion: "Province 1",
            addressCountry: "Nepal",
          },
          url: window.location.origin,
          image: image,
        })}
      </script>
    </Helmet>
  );
};
