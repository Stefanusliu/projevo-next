import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Stats from './components/Stats';
import CTA from './components/CTA';
import Contact from './components/Contact';
import About from './components/About';
import Footer from './components/Footer';

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
        <section id="contact-us">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  );
}
