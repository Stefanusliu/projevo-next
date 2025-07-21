import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Stats from "./components/Stats";
import CTA from "./components/CTA";
import About from "./components/About";
import Footer from "./components/Footer";

export const metadata = {
  title: "Projevo - Premier Construction & Design Platform in Indonesia",
  description:
    "Connect with trusted contractors, interior designers, architects, and renovation specialists. Projevo makes it easy to find qualified vendors, submit proposals, and manage construction projects from start to finish.",
  keywords: [
    "construction platform Indonesia",
    "find contractors Jakarta",
    "interior design services",
    "architecture projects",
    "renovation contractors",
    "construction tenders",
    "building contractors",
    "design and build services",
    "project management platform",
    "vendor marketplace Indonesia",
  ],
  openGraph: {
    title: "Projevo - Premier Construction & Design Platform",
    description:
      "Find trusted contractors and vendors for construction, interior design, architecture, and renovation projects. Seamless collaboration for innovative solutions.",
    images: [
      {
        url: "/images/projevo-homepage.jpg",
        width: 1200,
        height: 630,
        alt: "Projevo Homepage - Construction Platform",
      },
    ],
  },
  twitter: {
    title: "Projevo - Premier Construction & Design Platform",
    description:
      "Find trusted contractors and vendors for construction, interior design, architecture, and renovation projects in Indonesia.",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <main>
        <Hero />
        <Stats />
        <section id="how-it-works">
          <Features />
        </section>
        <section id="about-us">
          <About />
        </section>
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
