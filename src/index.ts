import {
  attrs,
  methods,
  legacyCollectButtonInlineCSS,
} from './constants';
import './styles/index.css'
import { activateManager, managerActivated } from './utils';
import { initManageMode } from './ui-modes/manage-mode';
import * as Relay from './relay';

let relay = {};
if (!activateManager()) {
  relay = Relay.init();
  if (managerActivated()) {
    initManageMode(relay);
  }
}

export const cent = { ...relay.public };

// Legacy standalone collect API
export const collectNFT = (...args) => relay.public.collectNFT(...args);

// Legacy method that inserts a clickable button in container.
export function createCollectButton ({ assetURL, assetTitle, assetDescription, buttonText }, container) {
  const button = document.createElement('button');
  button.setAttribute(attrs.ASSET_URL, assetURL);
  button.setAttribute(attrs.ASSET_TITLE, assetTitle);
  button.setAttribute(attrs.ASSET_DESCRIPTION, assetDescription);
  button.innerText = buttonText || 'Collect';
  button.className = 'collect-button';
  button.setAttribute('style', legacyCollectButtonInlineCSS);
  button.addEventListener('click', function() {
    relay.public.collectNFT({
      url: this.getAttribute(attrs.ASSET_URL),
      title: this.getAttribute(attrs.ASSET_TITLE),
      description: this.getAttribute(attrs.ASSET_DESCRIPTION)
    });
  });
  container.appendChild(button);
}
