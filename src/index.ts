import {
  attrs,
} from './constants';
import './styles/index.css'
import * as relay from './relay';

relay.init();

export function createCollectButton (params, container) {
  const button = document.createElement('button');
  button.setAttribute(attrs.ASSET_URL, params.assetURL);
  button.setAttribute(attrs.ASSET_TITLE, params.assetTitle);
  button.setAttribute(attrs.ASSET_DESCRIPTION, params.assetDescription);
  button.innerText = params.buttonText || 'Collect';
  button.className = 'collect-button';
  button.setAttribute('style', `
    position: relative;
    font-size: 1em;
    padding: .5em 1em;
    background-color: #000;
    color: #FFF;
    border: 1px solid black;
    border-radius: 6px;
    cursor: pointer;
  `);
  button.addEventListener('click', onClickHandler);
  container.appendChild(button);
}

function onClickHandler() {
  relay.collect(
    this.getAttribute(attrs.ASSET_URL),
    this.getAttribute(attrs.ASSET_TITLE),
    this.getAttribute(attrs.ASSET_DESCRIPTION)
  );
}