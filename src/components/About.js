import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Image,
  VStack,
  Tag,
  Flex,
  IconButton,
  Stack,
  Link,
  Button
} from '@chakra-ui/react';
import { FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

const About = () => (
  <Box id="about" borderRadius="md" mt={10}>
    {/* About Me Heading */}
    <Flex justify="center" mb={8}>
      <Heading as="h3" size="lg" color="gray.900">
        About Me
      </Heading>
    </Flex>

    {/* Profile and Bio */}
    <VStack spacing={8} align="center">
      {/* Profile Picture with Flip Effect */}
      <FlipCard />

      <Link href="https://drive.google.com/file/d/1NRjASQEHw_85pLt8Y7TRV8b9t1jQUfdl/view?usp=sharing" isExternal>
        <Button colorScheme="blue" size="lg">
          View my resume
        </Button>
      </Link>

      {/* Bio */}
      <Box textAlign="center" mx={10}>
      <Text color="gray.700">
        I am Abhishek Agrawal, a recent graduate of <strong>Aerospace Engineering</strong> from <strong>IIT Kharagpur</strong>, specializing in <strong>Artificial Intelligence</strong> and Machine Learning. My journey in aerospace began with a deep-rooted passion for innovation in engineering. At IIT Kharagpur, I had the privilege of serving as the <strong>Aerodynamics Designer</strong> and later as <strong>Team Leader</strong> in our esteemed <strong>Formula Student</strong> team, where I honed my skills in aerodynamics and leadership.
      </Text>

      {/* Automotive Engineering */}
      <Text mt={4} color="gray.700">
        Beyond the skies, my fascination with <strong>automotive engineering</strong> led me to actively participate as a Formula Student Driver, blending theoretical knowledge with practical experience in vehicle dynamics. My academic focus on integrating AI into aerospace reflects my commitment to enhancing industry efficiency and pushing technological boundaries, driven by a relentless passion for innovation.
      </Text>

      {/* Academic and Extracurricular Achievements */}
      <Text mt={4} color="gray.700">
        Hailing from Raigarh, Chhattisgarh, I have persevered to excel in both academics and extracurriculars, including my involvement in the <strong>Quant Club</strong> at IIT Kharagpur, where my interests in <strong>financial models and quantitative analysis</strong> blossomed. My entrepreneurial spirit shines through <strong>my ventures</strong> — I've developed production-ready websites like <strong>pearmock.com</strong> and innovative AI tools at <strong>kuberanix.com</strong>, leveraging my proficiency in web development and <strong>AI technologies</strong>.
      </Text>

      {/* Interest in Cutting-edge Concepts */}
      <Text mt={4} color="gray.700">
        I thrive on exploring cutting-edge concepts such as <strong>digital twins</strong>, an area where I made significant contributions during my academic tenure. Outside of my professional pursuits, I am an <strong>avid traveler</strong>, having explored over 1/3rd of India, always seeking new adventures and cultural experiences. Each journey fuels my creativity and broadens my perspective, aligning with my goal to make impactful contributions in aerospace and technology sectors.
      </Text>
      </Box>
    </VStack>

    {/* Skills */}
    <Box mt={8} textAlign="center" mx={10}>
      <Heading as="h4" size="md" color="gray.900" mb={4}>
        Skills
      </Heading>
      <Stack direction="row" wrap="wrap" justify="center" spacing={4}>
  <Tag colorScheme="blue">Aerospace Engineering</Tag>
  <Tag colorScheme="green">Artificial Intelligence (AI)</Tag>
  <Tag colorScheme="purple">Machine Learning (ML)</Tag>
  <Tag colorScheme="orange">Aerodynamics Design</Tag>
  <Tag colorScheme="red">Team Leadership</Tag>
  <Tag colorScheme="cyan">Automotive Engineering</Tag>
  <Tag colorScheme="teal">Vehicle Dynamics</Tag>
  <Tag colorScheme="yellow">AI Integration in Aerospace</Tag>
  <Tag colorScheme="pink">Financial Modeling</Tag>
  <Tag colorScheme="gray">Quantitative Analysis</Tag>
  <Tag colorScheme="blue">Web Development</Tag>
  <Tag colorScheme="green">AI Tool Development</Tag>
  <Tag colorScheme="purple">Digital Twin Technology</Tag>
  <Tag colorScheme="orange">Project Management</Tag>
  <Tag colorScheme="cyan">Research and Development (R&D)</Tag>
  <Tag colorScheme="teal">Entrepreneurship</Tag>
  <Tag colorScheme="yellow">Innovation and Problem-Solving</Tag>
  <Tag colorScheme="pink">Technical Writing and Communication</Tag>
  <Tag colorScheme="green">Travel and Cultural Adaptability</Tag>
</Stack>

    </Box>

    {/* Career Timeline */}
    <Box mt={8}>
      <Heading as="h4" size="md" color="gray.900" mb={4} textAlign="center">
        Education and WorkEx.
      </Heading>
      <CareerTimeline />
    </Box>
  </Box>
);

const FlipCard = () => {
  const [flipped, setFlipped] = useState(false);

  return (
    <Box
      position="relative"
      w="150px"
      h="150px"
      borderRadius="full"
      overflow="hidden"
      perspective="1000px" // Perspective for 3D effect
      onMouseEnter={() => setFlipped(true)} // Set flipped to true on hover
      onMouseLeave={() => setFlipped(false)} // Set flipped to false on mouse leave
      cursor="pointer"
    >
      <Box
        className="inner"
        position="absolute"
        top="0"
        left="0"
        w="100%"
        h="100%"
        transformStyle="preserve-3d"
        transition="transform 0.6s"
        transform={flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}
      >
        {/* Front Side */}
        <Box
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          backfaceVisibility="hidden"
          display={flipped ? 'none' : 'flex'}
          alignItems="center"
          justifyContent="center"
        >
          <Image
            borderRadius="full"
            boxSize="150px"
            src={`${process.env.PUBLIC_URL}/images/profile.jpg`}
            alt="Profile Picture"
          />
        </Box>
        {/* Back Side */}
        <Box
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          bg="gray.900"
          color="white"
          display={flipped ? 'flex' : 'none'}
          flexDir="column"
          alignItems="center"
          justifyContent="center"
          transform="rotateY(180deg)"
          backfaceVisibility="hidden"
        >
          <IconButton
            as="a"
            href="https://www.linkedin.com/in/abhishek-agrawal-8766931a5/"
            aria-label="LinkedIn"
            icon={<FaLinkedin />}
            mb={2}
            isRound
            size="lg"
            target="_blank"          // Open link in new tab
            rel="noopener noreferrer"
          />
          <IconButton
            as="a"
            href="mailto:abhishek.agrawal3101@gmail.com"
            aria-label="Email"
            icon={<FaEnvelope />}
            isRound
            size="lg"
            target="_blank"          // Open link in new tab
            rel="noopener noreferrer"
          />
        </Box>
      </Box>
    </Box>
  );
};

const CareerTimeline = () => {
  const timelineEvents = [
    {
      date: '2020 - 2024',
      title: 'Indian Institute of Technology Kharagpur',
      subtitle: 'Kharagpur, India',
      description: 'B.Tech in Aerospace Engineering and Micro-Specialization in Artificial Intelligence and Machine Learning (CGPA: 8.86/10)',
      logo: `${process.env.PUBLIC_URL}/images/iitkgp.png`, // Replace with the path to the logo image
    },
    {
      date: 'June - July, 2023',
      title: 'Management Consultant Intern at EVERSANA: APAC CONSULTING',
      subtitle: 'Mumbai, India',
      description: 'As a Management Consultant Intern at EVERSANA, I worked on digital omnichannel marketing strategies from June to July 2023. I collaborated closely with senior executives, including three Senior VPs and the CEO, to establish the foundation for the omnichannel marketing vertical. Through extensive secondary research on pharmaceutical omnichannel strategies in the APAC region, I compiled a comprehensive POV deck featuring over 15 case studies. Additionally, I conducted primary research by interviewing seven industry experts to gain valuable insights into the challenges of omnichannel adoption. Leveraging these insights, I developed a Profit-Promotional Effort model and a Marketing Mix Model, forecasting a 14% increase in ROI by rebalancing investments. This work culminated in presenting a detailed pitch deck to a pharmaceutical client company, proposing two profit-enhancing omnichannel marketing strategies.',
      logo: `${process.env.PUBLIC_URL}/images/eversana.jpg`, // Replace with the path to the logo image
    },
    {
      date: '2007 - 2020',
      title: "O. P. Jindal School Raigarh (PCM + Information Practices)",
      subtitle: 'Raigarh, Chhattisgarh',
      description: 'Class XII : 96.6% | Class X : 98.2%',
      logo: `${process.env.PUBLIC_URL}/images/opjs.jpg`, // Replace with the path to the logo image
    },
  ];

  return (
    <VerticalTimeline>
      {timelineEvents.map((event, index) => (
        <VerticalTimelineElement
          key={index}
          date={event.date}
          icon={
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="100%"
              height="100%"
              overflow="hidden"
              borderRadius="full"
            >
              <Image src={event.logo} boxSize="60px" objectFit="contain" />
            </Box>
          }
        >
          <Box>
            <Text as="h3" fontWeight="bold" fontSize="lg">{event.title}</Text>
            {event.subtitle && <Text as="h4" fontWeight="medium" fontSize="md">{event.subtitle}</Text>}
            <Text>{event.description}</Text>
          </Box>
        </VerticalTimelineElement>
      ))}
    </VerticalTimeline>
  );
};

export default About;
