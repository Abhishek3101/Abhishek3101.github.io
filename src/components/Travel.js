import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from 'react-simple-maps';
import { Box, Heading, Text } from '@chakra-ui/react';
import indiaTopoJson from '../map/india.json'
import worldTopoJson from '../map/world.json';
import vietnamTopoJson from '../map/vietnam.json';

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
  { name: 'Bangalore', coordinates: [77.5946, 12.9716], description: 'Tech Hub and Garden City of India'},
  { name: 'Guwahati', coordinates: [91.7362, 26.1445], description: 'Gateway to Northeast India' },
  { name: 'Kaziranga National Park', coordinates: [93.3630, 26.5775], description: 'Famous for One-Horned Rhinos' },
  { name: 'Tezpur', coordinates: [92.7984, 26.6338], description: 'Cultural and Historical Hub' },
  { name: 'Bomdila', coordinates: [92.4065, 27.2644], description: 'Scenic Himalayan Town' },
  { name: 'Dirang Valley', coordinates: [92.2510, 27.3509], description: 'Serene Valley with Monasteries' },
  { name: 'Thembang', coordinates: [92.2911, 27.4591], description: 'Heritage Village in Arunachal Pradesh' },
  { name: 'Sela Pass', coordinates: [92.2511, 27.5079], description: 'High Altitude Himalayan Pass' },
  { name: 'Tawang', coordinates: [91.8668, 27.5860], description: 'Monasteries and Snow-Capped Mountains' },
  { name: 'Shillong', coordinates: [91.8838, 25.5788], description: 'Scotland of the East' },
  { name: 'Cherrapunji', coordinates: [91.7312, 25.2866], description: 'One of the Wettest Places on Earth' },
  { name: 'Dawki', coordinates: [91.6970, 25.2003], description: 'Crystal Clear River and Indo-Bangladesh Border' },
  { name: 'Shnonpedong', coordinates: [91.7191, 25.1992], description: 'Scenic Riverside Camping Destination' },
  { name: 'Coorg', coordinates: [75.7397, 12.3375], description: 'Coffee Plantations and Scenic Hills' },
  { name: 'Udupi', coordinates: [74.7462, 13.3409], description: 'Famous for Temples and Cuisine' },
  { name: 'Mysore', coordinates: [76.6394, 12.2958], description: 'City of Palaces' },
  { name: 'Mangalore', coordinates: [74.8560, 12.9141], description: 'Coastal City with Beautiful Beaches' },
  { name: 'Gokarna', coordinates: [74.3144, 14.5503], description: 'Pristine Beaches and Pilgrimage Site' },
  { name: 'Ayodhya', coordinates: [82.1946, 26.7994], description: 'Birthplace of Lord Rama and Spiritual Hub' },
  { name: 'Barsana', coordinates: [77.3779, 27.6435], description: 'Birthplace of Radha and Famous for Lathmar Holi' },
  { name: 'Surat', coordinates: [72.8311, 21.1702], description: 'Diamond City of India' },
  { name: 'Ahmedabad', coordinates: [72.5714, 23.0225], description: 'Heritage City of India' },
  { name: 'Manali', coordinates: [77.1887, 32.2396], description: 'Gateway to the Himalayas' },
  { name: 'Jibhi', coordinates: [77.3374, 31.5744], description: 'Hidden Himalayan Hamlet' },
  { name: 'Sangla Valley', coordinates: [78.4482, 31.4194], description: 'Beautiful Baspa Valley' },
  { name: 'Kalpa Valley', coordinates: [78.2518, 31.5381], description: 'Apple Orchards and Kinnaur Kailash' },
  { name: 'Kaza', coordinates: [78.2232, 32.2266], description: 'Heart of Spiti Valley' },
  { name: 'Chandratal', coordinates: [77.6151, 32.4754], description: 'Moon Lake of Spiti' },
  { name: 'Nako', coordinates: [78.6289, 31.8837], description: 'Lake Village on Indo-Tibet Highway' },
  { name: 'Tabo', coordinates: [78.3915, 32.0964], description: 'Ancient Monastery Town' },
  { name: 'Dhankar', coordinates: [78.2172, 32.0983], description: 'Cliffside Monastery Village' },
  { name: 'Hikkim', coordinates: [78.0065, 32.2432], description: 'Home to World’s Highest Post Office' },
  { name: 'Komic', coordinates: [78.0451, 32.2461], description: 'Highest Village with Motorable Road' },
  { name: 'Langza', coordinates: [77.9935, 32.2812], description: 'Fossil Village with Giant Buddha Statue' },
  { name: 'Losar', coordinates: [77.7545, 32.6036], description: 'Last Village before Kunzum Pass' },
  { name: 'Kunzum Pass', coordinates: [77.6101, 32.5512], description: 'High Mountain Pass to Spiti' },
  { name: 'Rohtang Pass', coordinates: [77.2485, 32.3664], description: 'Snowy Gateway to Lahaul-Spiti' },
  { name: 'Key Monastery', coordinates: [78.0566, 32.2854], description: 'Iconic Buddhist Monastery of Spiti' },
  { name: 'Wayanad', coordinates: [76.1320, 11.6854], description: 'Lush Green Hills and Wildlife Sanctuaries' },
  { name: 'Satish Dhawan Space Centre', coordinates: [80.228, 13.732], description: 'Indian Satellite Launch Site' },
  { name: 'Chikmagalur', coordinates: [75.7720, 13.3161], description: 'Coffee Land of Karnataka' },
  { name: 'Jamnagar', coordinates: [70.0667, 22.4707], description: 'Brass City of India' },
  { name: 'Dwarka', coordinates: [68.9685, 22.2394], description: 'Ancient City of Lord Krishna' },
  { name: 'Bet Dwarka', coordinates: [69.0889, 22.4278], description: 'Island of Lord Krishna' },
  { name: 'Nageshwar', coordinates: [68.9758, 22.3297], description: 'Jyotirlinga Temple' },
  { name: 'Somnath', coordinates: [70.4013, 20.8880], description: 'First Jyotirlinga Temple' },
  { name: 'Bhavnagar', coordinates: [72.1519, 21.7645], description: 'Cultural City of Gujarat' },
  { name: 'Nashik', coordinates: [73.7898, 19.9975], description: 'Wine Capital of India' },
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

      {/* India Map */}
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
      geographies.map((geo) => {
        const stateName = geo.properties.ST_NM; // Get state name from the GeoJSON
        
        // List of states you've visited (based on your places)
        const visitedStates = [
          'West Bengal', 'Sikkim', 'Chhattisgarh', 'Odisha',
          'Tamil Nadu', 'Delhi', 'Maharashtra', 'Goa', 'Uttar Pradesh', 'Uttarakhand', 'Rajasthan',
          'Madhya Pradesh', 'Karnataka', 'Andhra Pradesh', 'Kerala',
          'Assam', 'Arunachal Pradesh', 'Meghalaya', 'Himachal Pradesh',
          'Gujarat', 'Telangana'
        ];
        
        const isVisited = visitedStates.includes(stateName);
        
        return (
          <Geography
            key={geo.rsmKey}
            geography={geo}
            fill={isVisited ? "#138808" : "#FF9933"}  // Saffron for visited, light saffron for not visited
            stroke="#000000"
            strokeWidth={1}
          />
        );
      })
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
              r={2.7}
              fill="#FFFFFF"
              stroke="#000080"
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
