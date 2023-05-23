import {
  attrs,
  methods,
} from './constants';
import './styles/index.css'
import * as relay from './relay';
import { initManage } from './manage';
import { getQueryVariable } from './utils';

const hooks = [];
relay.init(hooks);


export function collectNFT({ url, title, description, onExit, autoCollect=true }) {
  if (typeof onExit === 'function') {
    hooks.push({
      eventName: methods.HIDE_RELAY,
      assetURL: url,
      fn: onExit,
    });
  }
  relay.collect({
    assetURL: url,
    assetTitle: title,
    assetDescription: description,
    autoCollect: autoCollect,
  });
}

// DEPRECATED
// Legacy method that inserts a clickable button in container.
// Use fully programmatic `collectNFT` OR pre-fabbed `button.ts`
export function createCollectButton (params, container) {
  function onClickHandler() {
    collectNFT({
      url: this.getAttribute(attrs.ASSET_URL),
      title: this.getAttribute(attrs.ASSET_TITLE),
      description: this.getAttribute(attrs.ASSET_DESCRIPTION),
      autoCollect: true,
    });
  }
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

function init() {
  const activateManager = getQueryVariable('collectManager');
  if (activateManager) {
    // Activate the manager and strip query string directive from the url.
    window.localStorage.setItem('collect-manager', 'true');
    const { location } = window;
    const qsFragments = location.search.substr(1).split('&').filter(key => key.indexOf('collectManager') !== 0);
    const newQs = qsFragments.length > 0 ? `?${qsFragments.join('&')}` : '';
    location.replace(`${location.origin}${location.pathname}${newQs}${location.hash}`);
    return;
  }
  const managerActivated = window.localStorage.getItem('collect-manager') === 'true';
  if (managerActivated) {
    initManage(relay, hooks);
  }
}

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  init();
}
else {
  window.addEventListener('DOMContentLoaded', init);
}
