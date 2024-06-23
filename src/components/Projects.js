import React from 'react';
import { Box, Heading, Text, Link, SimpleGrid, VStack, Image } from '@chakra-ui/react';

const projects = [
  {
    title: "Project One",
    description: "Description for project one. This project involves...",
    link: "https://github.com/project-one",
    imageUrl: "https://via.placeholder.com/300x150", // Placeholder image URL
  },
  {
    title: "Project Two",
    description: "Description for project two. This project involves...",
    link: "https://github.com/project-two",
    imageUrl: "https://via.placeholder.com/300x150", // Placeholder image URL
  },
  {
    title: "Project Three",
    description: "Description for project three. This project involves...",
    link: "https://github.com/project-three",
    imageUrl: "https://via.placeholder.com/300x150", // Placeholder image URL
  },
];

const Projects = () => (
  <Box id="projects" p={4} mt={10} bg="white" borderRadius="md" mx={10}>
    <Heading as="h3" size="lg" mb={6} color="gray.900" textAlign="center">
      Projects
    </Heading>
    <SimpleGrid columns={[1, 1, 2, 3]} spacing={8}>
      {projects.map((project, index) => (
        <Box
          key={index}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          bg="gray.50"
        >
          <VStack align="start" spacing={4}>
            <Image src={project.imageUrl} alt={project.title} borderRadius="md" />
            <Heading as="h4" size="md" color="gray.800">{project.title}</Heading>
            <Text color="gray.700">{project.description}</Text>
          </VStack>
        </Box>
      ))}
    </SimpleGrid>
  </Box>
);

export default Projects;
