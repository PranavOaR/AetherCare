import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import ProblemSolution from '@/components/ProblemSolution';
import Features from '@/components/Features';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0C10]">
      <Navigation />
      <Hero />
      <ProblemSolution />
      <Features />
      <CallToAction />
      <Footer />
    </div>
  );
}
