import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import './styles/index.css';
import CollectButton from './components/CollectButton';
import { LightTheme } from './styles';

window.createCollectButton = window.createCollectButton || function (params, element) {
  ReactDOM.render(
    <React.StrictMode>
      <ThemeProvider theme={LightTheme}>
        <CollectButton {...params} />
      </ThemeProvider>
    </React.StrictMode>,
    element,
  );
};
