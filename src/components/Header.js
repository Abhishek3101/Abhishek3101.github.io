import React, { useState, useEffect } from 'react';
import { Flex, Heading, HStack, IconButton, Box } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as ScrollLink } from 'react-scroll'; // Importing Link from react-scroll

const Header = () => {
  const [display, changeDisplay] = useState('none');
  const [isScrolled, setIsScrolled] = useState(false);

  // Function to handle scroll event
  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 0) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Flex
    as="nav"
    align="center"
    justify="center"
    wrap="wrap"
    padding=".5rem"
    bg={isScrolled > 0 ? 'linear-gradient(45deg, #3b3b98, #3b3b98, #8e44ad)' : 'transparent'}
    color="white"
    position="fixed"
    top="0"
    left="0"
    right="0"
    zIndex="sticky"
    boxShadow={isScrolled > 0 ? '0px 4px 2px -2px gray' : 'none'}
    transition="background-color 0.3s, box-shadow 0.3s"
    >
      <Flex align="center" mr={5}>
        <Heading as="h1" size="lg" letterSpacing={'-.1rem'}>
          Abhishek
        </Heading>
      </Flex>

      <Box w="150px" /> {/* Spacer between logo and links */}

      {/* Desktop */}
      <HStack display={['none', 'none', 'flex', 'flex']} spacing={8} alignItems="center">
        <ScrollLink to="about" smooth={true} duration={500} style={{ fontWeight: 'bold', cursor: 'pointer' }}>About</ScrollLink>
        {/* <ScrollLink to="projects" smooth={true} duration={500} style={{ fontWeight: 'bold', cursor: 'pointer' }}>Projects</ScrollLink>
        <ScrollLink to="competitions" smooth={true} duration={500} style={{ fontWeight: 'bold', cursor: 'pointer' }}>Competitions</ScrollLink>
        <ScrollLink to="publications" smooth={true} duration={500} style={{ fontWeight: 'bold', cursor: 'pointer' }}>Publications</ScrollLink> */}
        <ScrollLink to="travel" smooth={true} duration={500} style={{ fontWeight: 'bold', cursor: 'pointer' }}>Travel</ScrollLink>
        <ScrollLink to="contact" smooth={true} duration={500} style={{ fontWeight: 'bold', cursor: 'pointer' }}>Contact</ScrollLink>
      </HStack>

      {/* Mobile */}
      <IconButton
        aria-label="Open Menu"
        size="lg"
        icon={<HamburgerIcon />}
        display={['flex', 'flex', 'none', 'none']}
        onClick={() => changeDisplay('flex')}
      />

      <Flex
        w="100vw"
        display={display}
        bgColor="gray.50"
        zIndex={20}
        h="100vh"
        pos="fixed"
        top="0"
        left="0"
        overflowY="auto"
        flexDir="column"
      >
        <Flex justify="flex-end">
          <IconButton
            mt={2}
            mr={2}
            aria-label="Close Menu"
            size="lg"
            icon={<CloseIcon />}
            onClick={() => changeDisplay('none')}
          />
        </Flex>

        <Flex flexDir="column" align="center" color={'black'}>
          <ScrollLink to="about" smooth={true} duration={500} onClick={() => changeDisplay('none')} style={{ fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' }}>About</ScrollLink>
          {/* <ScrollLink to="projects" smooth={true} duration={500} onClick={() => changeDisplay('none')} style={{ fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' }}>Projects</ScrollLink>
          <ScrollLink to="competitions" smooth={true} duration={500} onClick={() => changeDisplay('none')} style={{ fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' }}>Competitions</ScrollLink>
          <ScrollLink to="publications" smooth={true} duration={500} onClick={() => changeDisplay('none')} style={{ fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' }}>Publications</ScrollLink> */}
          <ScrollLink to="travel" smooth={true} duration={500} onClick={() => changeDisplay('none')} style={{ fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' }}>Travel</ScrollLink>
          <ScrollLink to="contact" smooth={true} duration={500} onClick={() => changeDisplay('none')} style={{ fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' }}>Contact</ScrollLink>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Header;
