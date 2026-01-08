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
  category?: string;
}

export const SEOHead = ({
  title = "Ajmal Akhtar Azad - Mayor of Bhokraha Narsingh Municipality",
  description = "Official website of Mayor Ajmal Akhtar Azad - Bhokraha Narsingh Municipality. Together for development, dignity, and democracy.",
  image = "https://storage.googleapis.com/gpt-engineer-file-uploads/6j4N84GNxsXn52PqWIVTQd9p8RI2/social-images/social-1764428453124-image1.jpg",
  url,
  type = "website",
  keywords = "Ajmal Akhtar Azad, Mayor, Bhokraha Narsingh, Municipality, Nepal, Development, Local Government, Province 1, Sunsari",
  author = "Ajmal Akhtar Azad",
  publishedTime,
  modifiedTime,
  category,
}: SEOHeadProps) => {
  const siteUrl = "https://ajmal-vision-news.lovable.app";
  const fullUrl = url ? `${siteUrl}${url}` : (typeof window !== 'undefined' ? window.location.href : siteUrl);
  const siteName = "Ajmal Akhtar Azad";
  
  // Ensure title is under 60 chars
  const truncatedTitle = title.length > 60 ? title.substring(0, 57) + "..." : title;
  // Ensure description is under 160 chars
  const truncatedDescription = description.length > 160 ? description.substring(0, 157) + "..." : description;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{truncatedTitle}</title>
      <meta name="title" content={truncatedTitle} />
      <meta name="description" content={truncatedDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="3 days" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={truncatedTitle} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={truncatedTitle} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@AjmalAkhtarAzad" />
      <meta name="twitter:creator" content="@AjmalAkhtarAzad" />
      <meta name="twitter:title" content={truncatedTitle} />
      <meta name="twitter:description" content={truncatedDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={truncatedTitle} />

      {/* Article-specific tags */}
      {type === "article" && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          <meta property="article:author" content={author} />
          {category && <meta property="article:section" content={category} />}
          <meta property="article:tag" content={keywords} />
        </>
      )}

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === "article" ? "NewsArticle" : "WebPage",
          name: truncatedTitle,
          headline: truncatedTitle,
          url: fullUrl,
          image: {
            "@type": "ImageObject",
            url: image,
            width: 1200,
            height: 630,
          },
          description: truncatedDescription,
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
              url: "https://storage.googleapis.com/gpt-engineer-file-uploads/6j4N84GNxsXn52PqWIVTQd9p8RI2/uploads/1764428477117-logo.jpg.png",
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": fullUrl,
          },
          ...(type === "article" && publishedTime
            ? { 
                datePublished: publishedTime, 
                dateModified: modifiedTime || publishedTime,
                articleSection: category || "News",
              }
            : {}),
        })}
      </script>

      {/* Breadcrumb Schema for articles */}
      {type === "article" && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteUrl,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "News",
                item: `${siteUrl}/news`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: truncatedTitle,
                item: fullUrl,
              },
            ],
          })}
        </script>
      )}
    </Helmet>
  );
};
