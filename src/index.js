import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';
import './Scrollbar.css';

// Define the custom theme
const theme = extendTheme({
  colors: {
    primary: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
    gray: {
      50: '#F7F7F7',
      100: '#E0E0E0',
      200: '#DDDDDD',
      300: '#CCCCCC',
      400: '#BBBBBB',
      500: '#AAAAAA',
      600: '#999999',
      700: '#888888',
      800: '#777777',
      900: '#333333',
    },
    accent: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#4A90E2',
      600: '#5A9BD4',
      700: '#4A90E2',
      800: '#1976D2',
      900: '#1565C0',
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
);
