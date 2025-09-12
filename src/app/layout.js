import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "../contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Projevo - Connect Project Owners with Qualified Vendors",
    template: "%s | Projevo",
  },
  description:
    "Projevo is the premier platform connecting Project Owners with qualified Vendors for construction, interior design, architecture, and renovation projects in Indonesia. Find trusted contractors, submit proposals, and bring your projects to life.",
  keywords: [
    "construction platform",
    "contractor marketplace",
    "interior design services",
    "architecture projects",
    "renovation contractors",
    "project management",
    "vendor marketplace",
    "construction tenders",
    "Indonesian contractors",
    "building services",
    "project owners",
    "construction proposals",
  ],
  authors: [{ name: "Projevo Team" }],
  creator: "Projevo",
  publisher: "Projevo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://projevo.com"),
  alternates: {
    canonical: "/",
    languages: {
      "id-ID": "/id",
      "en-US": "/en",
    },
  },
  openGraph: {
    title: "Projevo - Connect Project Owners with Qualified Vendors",
    description:
      "The premier platform where Project Owners find the perfect Vendors for construction, interior design, architecture, and renovation projects. Seamless collaboration for innovative solutions.",
    url: "https://projevo.com",
    siteName: "Projevo",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Projevo - Construction and Design Platform",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projevo - Connect Project Owners with Qualified Vendors",
    description:
      "Find trusted contractors and vendors for your construction, interior design, architecture, and renovation projects in Indonesia.",
    images: ["/twitter-image.jpg"],
    creator: "@projevo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Projevo",
    description:
      "Premier platform connecting Project Owners with qualified Vendors for construction, interior design, architecture, and renovation projects in Indonesia.",
    url: "https://projevo.com",
    logo: "https://projevo.com/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+62-21-1234-5678",
      contactType: "customer service",
      areaServed: "ID",
      availableLanguage: ["Indonesian", "English"],
    },
    sameAs: [
      "https://www.facebook.com/projevo",
      "https://www.instagram.com/projevo",
      "https://www.linkedin.com/company/projevo",
    ],
    potentialAction: {
      "@type": "SearchAction",
      target: "https://projevo.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Projevo",
    description:
      "Leading construction and design platform connecting project owners with qualified vendors in Indonesia.",
    url: "https://projevo.com",
    logo: "https://projevo.com/logo.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jl. Sudirman No. 123",
      addressLocality: "Jakarta Selatan",
      addressRegion: "DKI Jakarta",
      postalCode: "12190",
      addressCountry: "ID",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+62-21-1234-5678",
      contactType: "customer service",
    },
    founder: {
      "@type": "Person",
      name: "Projevo Team",
    },
    foundingDate: "2024",
    numberOfEmployees: "50-100",
    industry: "Construction Technology",
    serviceArea: {
      "@type": "Country",
      name: "Indonesia",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthContextProvider>{children}</AuthContextProvider>
      </body>
    </html>
  );
}
