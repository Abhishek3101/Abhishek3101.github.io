import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const DUMMY_DATA = {
  achievements: [
    {
      title: 'Launched Antigravity',
      category: 'Milestone',
      date: '2025-08-15',
      description: 'Successfully launched the v1 of my new AI agent framework after 6 months of hard work.',
      link: 'https://antigravity.dev',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80',
      createdAt: new Date().toISOString()
    },
    {
      title: 'Best Developer Award',
      category: 'Award',
      date: '2024-12-01',
      description: 'Awarded the employee of the year for shipping 3 core products ahead of schedule.',
      link: '',
      image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=500&q=80',
      createdAt: new Date().toISOString()
    }
  ],
  horizon: [
    {
      title: 'Brain-Computer Interfaces',
      category: 'Thought',
      date: '2026-01-10',
      tags: 'tech, neuroscience, future',
      description: 'I believe the next major platform shift will not be spatial computing, but direct neural interfaces. The bandwidth constraint of typing is the last bottleneck in human-AI collaboration.',
      link: '',
      image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&q=80',
      createdAt: new Date().toISOString()
    },
    {
      title: 'Open Source Robotics',
      category: 'Startup',
      date: '2026-03-20',
      tags: 'robotics, open-source',
      description: 'A platform providing modular, open-source robotic arms for home automation. Focus on affordable actuators and standardizing the software layer.',
      link: '',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&q=80',
      createdAt: new Date().toISOString()
    }
  ],
  curations: [
    {
      title: 'Dune',
      category: 'Book',
      author: 'Frank Herbert',
      review: 'A masterpiece of world-building and political intrigue. It profoundly changed how I view ecology and religion in sci-fi.',
      link: '',
      image: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?w=500&q=80',
      createdAt: new Date().toISOString()
    },
    {
      title: 'Interstellar',
      category: 'Movie',
      author: 'Christopher Nolan',
      review: 'The ultimate space epic. The score by Hans Zimmer alone makes it a 10/10.',
      link: 'https://youtube.com/watch?v=zSWdZVtXT7E',
      image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500&q=80',
      createdAt: new Date().toISOString()
    }
  ],
  athletics: [
    {
      date: '2026-06-16',
      gym: 'Yes',
      cycling: '15',
      swimming: '0',
      running: '5',
      racketSport: 'None',
      water: '3',
      sleep: '7.5',
      createdAt: new Date().toISOString()
    },
    {
      date: '2026-06-15',
      gym: 'No',
      cycling: '0',
      swimming: '0',
      running: '0',
      racketSport: 'Squash',
      water: '4',
      sleep: '8',
      createdAt: new Date().toISOString()
    },
    {
      date: '2026-06-14',
      gym: 'No',
      cycling: '40',
      swimming: '1500',
      running: '0',
      racketSport: 'None',
      water: '4.5',
      sleep: '6.5',
      createdAt: new Date().toISOString()
    },
    {
      date: '2026-05-20',
      gym: 'Yes',
      cycling: '0',
      swimming: '2000',
      running: '10',
      racketSport: 'Tennis',
      water: '3.5',
      sleep: '8',
      createdAt: new Date().toISOString()
    }
  ],
  journal: [
    {
      topic: 'Finding Balance',
      date: '2026-06-10',
      mood: 'Reflective',
      text: 'Today I realized the importance of disconnecting. The constant barrage of information is exhausting. I need to schedule at least one hour of device-free time every evening.',
      createdAt: new Date().toISOString()
    },
    {
      topic: 'New Ideas',
      date: '2026-06-12',
      mood: 'Energetic',
      text: 'Woke up with an incredible surge of energy. Wrote down 5 new ideas for the dashboard. It feels amazing to be in a flow state.',
      createdAt: new Date().toISOString()
    }
  ],
  conversations: [
    {
      prompt: "What's a startup idea you abandoned and why?",
      category: "Startup",
      isActive: "Yes",
      createdAt: new Date().toISOString()
    },
    {
      prompt: "If you could only read one book for the rest of your life, what would it be?",
      category: "Personal",
      isActive: "Yes",
      createdAt: new Date().toISOString()
    },
    {
      prompt: "Do you believe we are living in a simulation?",
      category: "Philosophy",
      isActive: "Yes",
      isActive: "Yes",
      createdAt: new Date().toISOString()
    }
  ],
  socials: [
    {
      platform: "Email",
      value: "hello@example.com",
      isActive: "Yes",
      createdAt: new Date().toISOString()
    },
    {
      platform: "WhatsApp",
      value: "1234567890",
      isActive: "Yes",
      createdAt: new Date().toISOString()
    },
    {
      platform: "Twitter",
      value: "twitter_handle",
      isActive: "Yes",
      createdAt: new Date().toISOString()
    }
  ]
};

export const seedCMSData = async () => {
  for (const [collectionName, records] of Object.entries(DUMMY_DATA)) {
    // Clear existing data (optional, but good for pure seeding)
    const querySnapshot = await getDocs(collection(db, collectionName));
    const deletePromises = querySnapshot.docs.map(document => deleteDoc(doc(db, collectionName, document.id)));
    await Promise.all(deletePromises);

    // Insert new data
    for (const record of records) {
      await addDoc(collection(db, collectionName), record);
    }
  }
};
