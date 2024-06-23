import React from 'react';
import { Box, Heading, Text, Link, VStack, HStack, Icon, Button } from '@chakra-ui/react';
import { FaLinkedin, FaInstagram, FaGithub } from 'react-icons/fa';

const Contact = () => (
  <>
  <Box id="contact" p={4} mt={10} bg="white" borderRadius="md" textAlign="center">
    <VStack spacing={4} align="center">
      <Text fontSize="xl" fontStyle="italic" color="gray.700" mb={6}>
        "The sky is not the limit; it's just the beginning. Let's reach for the stars together."
      </Text>
      <Heading as="h4" size="md" color="gray.800">Abhishek Agrawal</Heading>
      <HStack spacing={4} mt={4}>
        <Link href="https://www.linkedin.com/in/abhishek-agrawal-8766931a5/" isExternal>
          <Icon as={FaLinkedin} boxSize={6} color="blue.500" />
        </Link>
        <Link href="https://www.instagram.com/agrawalabhi3101/" isExternal>
          <Icon as={FaInstagram} boxSize={6} color="pink.500" />
        </Link>
        <Link href="https://github.com/Abhishek3101" isExternal>
          <Icon as={FaGithub} boxSize={6} color="gray.800" />
        </Link>
      </HStack>
      <Button colorScheme="blue" size="md" as="a" href="https://drive.google.com/file/d/1NRjASQEHw_85pLt8Y7TRV8b9t1jQUfdl/view?usp=sharing" target="_blank" mt={4}>
        View My Resume
      </Button>
      <Text color="gray.700" mt={4} px={4} maxW="3xl">
        As a dynamic Aerospace Engineer with a specialization in Artificial Intelligence and Machine Learning, I thrive on innovation and leadership. My journey is all about pushing the boundaries of aerospace and automotive engineering. Whether it's designing the future of aerodynamics or developing cutting-edge AI tools, I'm ready to take on exciting challenges. Please explore my resume to see how my expertise can benefit your team. And don't worry about the location—I've got a suitcase ready and a passport that’s eager for stamps. Let's make great things happen, no matter where the journey takes us!
      </Text>
    </VStack>
  </Box>
  <Box as="footer" mt={10} py={4} bg="gray.200" w="100%" textAlign="center">
  <Text color="gray.600">&copy; {new Date().getFullYear()} Abhishek Agrawal. All rights reserved.</Text>
  </Box>
  </>
);

export default Contact;
