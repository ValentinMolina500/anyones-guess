import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Test from './Test';
import { ChakraProvider } from "@chakra-ui/react";

ReactDOM.render(
  <ChakraProvider>
    <React.StrictMode>
      <App />
      {/* <Test /> */}
    </React.StrictMode>
  </ChakraProvider>,
  document.getElementById('root')
);

