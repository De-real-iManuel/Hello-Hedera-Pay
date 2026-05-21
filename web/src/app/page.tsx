import React from 'react';
import LandingNavbar from './components/LandingNavbar';
import HeroSection from './components/HeroSection';
import LandingFooter from './components/LandingFooter';
import FeaturesSection from './components/FeaturesSection';
import DemoPreviewSection from './components/DemoPreviewSection';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <DemoPreviewSection />
      <LandingFooter />
    </main>
  );
}
