import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Competitions from './components/Competitions';
import Publications from './components/Publications';
import Travel from './components/Travel';
import Contact from './components/Contact';

function App() {
  return (
    <Box>
      <Header />
      <Hero />
      <About />
      {/* <Projects />
      <Competitions />
      <Publications /> */}
      <Travel />
      <Contact />
    </Box>
  );
}

export default App;
