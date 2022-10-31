import React from 'react';
import ReactDOM from 'react-dom';
import { CollectButton } from './components/CollectButton';

window.createCollectButton = window.createCollectButton || function (params, element) {
  ReactDOM.render(
    <CollectButton {...params} />,
    element,
  );
};
