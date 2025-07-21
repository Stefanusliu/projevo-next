import Header from "../components/Header";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export const metadata = {
  title: "Get in Touch - Projevo",
  description: "Contact Projevo for support, questions, or to learn more about our construction and design platform. We're here to help you connect with the right partners.",
  keywords: [
    "contact Projevo",
    "customer support",
    "construction platform support",
    "get in touch",
    "help center"
  ],
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <main>
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
