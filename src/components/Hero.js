import React from 'react';
import { Box } from '@chakra-ui/react';

const Hero = () => (
  <Box
    as="section"
    minH="100vh"
    w={'full'}
    backgroundImage={`url(${process.env.PUBLIC_URL}/images/hero_photo.jpg)`}
    backgroundSize="cover"
    backgroundPosition="center"
    backgroundAttachment="fixed"
  >
  </Box>
);

export default Hero;
