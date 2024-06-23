import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from 'react-simple-maps';
import { Box, Heading, Text } from '@chakra-ui/react';
import indiaTopoJson from '../map/india.json'

// Tooltip component
const CustomTooltip = ({ x, y, visible, content }) => {
  return (
    visible && (
      <Box
        position="absolute"
        top={y + 10}
        left={x + 10}
        bg="gray.800"
        color="white"
        p={2}
        borderRadius="md"
        zIndex="tooltip"
      >
        <Text>{content}</Text>
      </Box>
    )
  );
};

const places = [
  { name: 'Kharagpur', coordinates: [87.3206, 22.346], description: 'Educational City' },
  { name: 'Kolkata', coordinates: [88.3639, 22.5726], description: 'Cultural Capital' },
  { name: 'Siliguri', coordinates: [88.435, 26.7271], description: 'Gateway to the Northeast' },
  { name: 'Kalimpong', coordinates: [88.4726, 27.0705], description: 'Hill Station' },
  { name: 'Raigarh', coordinates: [83.3963, 21.8974], description: 'Home Town' },
  { name: 'Pedong', coordinates: [88.7125, 27.3428], description: 'Scenic Hill Destination' },
  { name: 'Lava (West Bengal)', coordinates: [88.7119, 27.0338], description: 'Mountain Village' },
  { name: 'Darjeeling', coordinates: [88.2636, 27.0478], description: 'Tea Capital' },
  { name: 'Namchi', coordinates: [88.3686, 27.1674], description: 'Cultural Hub of Sikkim' },
  { name: 'Ravangla (West Sikkim)', coordinates: [88.3639, 27.3092], description: 'Tourist Town' },
  { name: 'Gangtok', coordinates: [88.6138, 27.3314], description: 'Capital of Sikkim' },
  { name: 'Lachung', coordinates: [88.7267, 27.6975], description: 'Mountain Village' },
  { name: 'Yumthang Valley', coordinates: [88.6853, 27.7856], description: 'Valley of Flowers' },
  { name: 'Zero Point', coordinates: [88.6404, 27.8833], description: 'High Altitude Point' },
  { name: 'Bilaspur', coordinates: [82.1409, 22.0797], description: 'City of Festivals' },
  { name: 'Raipur', coordinates: [81.6296, 21.2514], description: 'Capital of Chhattisgarh' },
  { name: 'Durg', coordinates: [81.2796, 21.1901], description: 'Industrial City' },
  { name: 'Rourkela', coordinates: [84.8547, 22.2604], description: 'Steel City' },
  { name: 'Jharsuguda', coordinates: [83.8638, 21.8644], description: 'Powerhouse City' },
  { name: 'Chennai', coordinates: [80.2707, 13.0827], description: 'Gateway to South India' },
  { name: 'Delhi', coordinates: [77.209, 28.6139], description: 'Capital City' },
  { name: 'Gurgaon', coordinates: [77.0266, 28.4595], description: 'Cyber City' },
  { name: 'Mumbai', coordinates: [72.8777, 19.076], description: 'Financial Capital' },
  { name: 'Goa', coordinates: [73.7289, 15.2993], description: 'Beach Paradise' },
  { name: 'Pune', coordinates: [73.8567, 18.5204], description: 'Oxford of the East' },
  { name: 'Shirdi', coordinates: [74.483, 19.7695], description: 'Spiritual Destination' },
  { name: 'Pondicherry', coordinates: [79.8083, 11.9416], description: 'French Colony' },
  { name: 'Puri', coordinates: [85.8315, 19.8133], description: 'Spiritual Capital' },
  { name: 'Bhubaneshwar', coordinates: [85.8245, 20.2961], description: 'Temple City' },
  { name: 'Konark Sun Temple', coordinates: [86.0886, 19.8876], description: 'Architectural Marvel' },
  { name: 'Chilika Lake', coordinates: [85.359, 19.7283], description: 'Lagoon' },
  { name: 'Varanasi', coordinates: [82.9739, 25.3176], description: 'Spiritual Capital of India' },
  { name: 'Mathura', coordinates: [77.6722, 27.4924], description: 'Birthplace of Lord Krishna' },
  { name: 'Vrindavan', coordinates: [77.7115, 27.5823], description: 'Land of Radha-Krishna' },
  { name: 'Elephanta Caves', coordinates: [72.9316, 18.9637], description: 'Historical Caves' },
  { name: 'Haridwar', coordinates: [78.1642, 29.9457], description: 'Gateway to Gods' },
  { name: 'Rishikesh', coordinates: [78.2676, 30.0868], description: 'Yoga Capital' },
  { name: 'Yamunotri', coordinates: [78.4497, 31.0076], description: 'Source of River Yamuna' },
  { name: 'Gangotri', coordinates: [78.9355, 30.994], description: 'Source of River Ganga' },
  { name: 'Kedarnath', coordinates: [79.0669, 30.7343], description: 'Holy Pilgrimage' },
  { name: 'Badrinath', coordinates: [79.4928, 30.7343], description: 'Char Dham Temple' },
  { name: 'Coimbatore', coordinates: [76.9558, 11.0168], description: 'Manchester of South India' },
  { name: 'Ooty', coordinates: [76.695, 11.4064], description: 'Queen of Hill Stations' },
  { name: 'Coonoor', coordinates: [76.8144, 11.353], description: 'Hill Station' },
  { name: 'Pilani', coordinates: [75.6039, 28.3625], description: 'Education Hub' },
  { name: 'Jhunjhunu', coordinates: [75.401, 28.1289], description: 'Historical City' },
  { name: 'Salasar', coordinates: [74.6873, 27.9857], description: 'Pilgrimage Centre' },
  { name: 'Khatu', coordinates: [75.9917, 27.5183], description: 'Religious Site' },
  { name: 'Mandarmani', coordinates: [87.7311, 21.6675], description: 'Beach Town' },
  { name: 'Panchmarhi', coordinates: [78.4338, 22.4679], description: 'Hill Station' },
  { name: 'Mandla', coordinates: [80.3896, 22.5986], description: 'Historical Town' },
  { name: 'Jabalpur', coordinates: [79.9414, 23.1815], description: 'City of Marbles' },
  { name: 'Satna', coordinates: [80.8329, 24.5773], description: 'City of Cement' },
  { name: 'Katni', coordinates: [80.3944, 23.8333], description: 'Marble City' },
  { name: 'Kanha National Park', coordinates: [80.6257, 22.3945], description: 'Tiger Reserve' },
  { name: 'Noida', coordinates: [77.391, 28.5355], description: 'IT Hub' },
  { name: 'Mysore', coordinates: [76.6394, 12.2958], description: 'Cultural Capital of Karnataka' },
  { name: 'Kalpakkam', coordinates: [80.1856, 12.5186], description: 'Nuclear Power Station' },
  { name: 'Lucknow', coordinates: [80.9462, 26.8467], description: 'City of Nawabs' },
  { name: 'Mainpat (Chhattisgarh)', coordinates: [83.0, 22.4], description: 'Mini Tibet of India' },
  { name: 'Hyderabad', coordinates: [78.4867, 17.385], description: 'City of Pearls' },
  { name: 'Tirupati', coordinates: [79.4192, 13.6288], description: 'Spiritual City' },
  { name: 'Srisailam', coordinates: [78.8686, 16.079], description: 'Pilgrimage Destination' },
  { name: 'Madurai', coordinates: [78.119, 9.9252], description: 'Temple City' },
  { name: 'Trichy', coordinates: [78.7047, 10.7905], description: 'City of Temples' },
  { name: 'Rameshwaram', coordinates: [79.3129, 9.2876], description: 'Pilgrimage Centre' },
  { name: 'Kanyakumari', coordinates: [77.5385, 8.0883], description: 'Southernmost Tip of India' },
  { name: 'Kerala Backwaters', coordinates: [76.3522, 9.4981], description: 'Scenic Waterways' },
  { name: 'Thiruvananthapuram', coordinates: [76.9366, 8.5241], description: 'Capital of Kerala' },
  { name: 'Visakhapatnam', coordinates: [83.2185, 17.6868], description: 'City of Destiny' },
  { name: 'Bangalore', coordinates: [77.5946, 12.9716], description: 'Tech Hub and Garden City of India'}
];

const Travel = () => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });

  const handleMarkerHover = (name, coordinates) => {
    const [x, y] = coordinates;
    setTooltip({ visible: true, x, y, content: name });
  };

  const handleMarkerLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  return (
    <Box id="travel" borderRadius="md" position="relative" mt={10}>
      <Heading as="h3" size="lg" color="gray.900" textAlign="center">
        Places I've Been
      </Heading>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 600,
          center: [78.9629, 23.5937],
        }}
        height={350}
      >
        <Geographies geography={indiaTopoJson}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#DEF4FC"
                stroke="#000000"
              />
            ))
          }
        </Geographies>
        {places.map((place, index) => (
          <Marker
            key={index}
            coordinates={place.coordinates}
            onMouseEnter={() => handleMarkerHover(place.name, place.coordinates)}
            onMouseLeave={handleMarkerLeave}
          >
            <circle
              cx={0}
              cy={0}
              r={3}
              fill="#FF5722"
              stroke="#FFF"
              strokeWidth={0.5}
              style={{ cursor: 'pointer' }}
            />
          </Marker>
        ))}
      </ComposableMap>
      <CustomTooltip {...tooltip} />
    </Box>
  );
};

export default Travel;
