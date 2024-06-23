import React from 'react';
import { Box, Heading, Text, SimpleGrid, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const competitions = [
  {
    title: "Competition One",
    description: "Description for competition one. This competition involved...",
    result: "First Place",
  },
  {
    title: "Competition Two",
    description: "Description for competition two. This competition involved...",
    result: "Second Place",
  },
  {
    title: "Competition Three",
    description: "Description for competition three. This competition involved...",
    result: "Participant",
  },
];

const Competitions = () => (
  <Box id="competitions" p={4} mt={10} bg="white" borderRadius="md">
    <Heading as="h3" size="lg" mb={6} color="gray.900" textAlign="center">
      Competitions
    </Heading>
    <SimpleGrid columns={[1, 1, 2, 3]} spacing={8}>
      {competitions.map((competition, index) => (
        <MotionBox
          key={index}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          whileHover={{ scale: 1.05 }}
          bg="gray.50"
        >
          <VStack align="start" spacing={4}>
            <Heading as="h4" size="md" color="gray.800">{competition.title}</Heading>
            <Text color="gray.700">{competition.description}</Text>
            <Text color="accent.500" fontWeight="bold">{competition.result}</Text>
          </VStack>
        </MotionBox>
      ))}
    </SimpleGrid>
  </Box>
);

export default Competitions;
