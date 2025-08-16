import React from 'react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import AboutSection from './AboutSection';
import ContactSection from '../ContactSection';

const Homepage = ({ onGetStartedClick }) => {
  return (
    <>
      <HeroSection onGetStartedClick={onGetStartedClick} />
      <FeaturesSection />
      <AboutSection />
      <ContactSection />
    </>
  );
};

export default Homepage;