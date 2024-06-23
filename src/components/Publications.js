import React from 'react';
import { Box, Heading, Text, Link, SimpleGrid, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const publications = [
  {
    title: "Publication One",
    description: "Description for publication one. This paper discusses...",
    link: "https://example.com/publication-one",
  },
  {
    title: "Publication Two",
    description: "Description for publication two. This article covers...",
    link: "https://example.com/publication-two",
  },
  {
    title: "Publication Three",
    description: "Description for publication three. This research focuses on...",
    link: "https://example.com/publication-three",
  },
];

const Publications = () => (
  <Box id="publications" p={4} mt={10} bg="white" borderRadius="md">
    <Heading as="h3" size="lg" mb={6} color="gray.900" textAlign="center">
      Publications
    </Heading>
    <SimpleGrid columns={[1, 1, 2, 3]} spacing={8}>
      {publications.map((publication, index) => (
        <MotionBox
          key={index}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          whileHover={{ scale: 1.05 }}
          bg="gray.50"
        >
          <VStack align="start" spacing={4}>
            <Heading as="h4" size="md" color="gray.800">{publication.title}</Heading>
            <Text color="gray.700">{publication.description}</Text>
            <Link href={publication.link} isExternal color="accent.500">Read More</Link>
          </VStack>
        </MotionBox>
      ))}
    </SimpleGrid>
  </Box>
);

export default Publications;
