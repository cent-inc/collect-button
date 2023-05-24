import {
  attrs,
  methods,
  MIN_DIM,
} from './constants';
import * as relay from './relay';
import { initManage } from './manage';
import './styles/index.css';
import {
  getQueryVariable,
  isTouchDevice,
  getMedia,
} from './utils';
const hooks = [];
relay.init(hooks);

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
  } else {
    initCollect(relay, hooks);
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

function initCollect(relay, hooks) {
  const collectButtonMap = {
   /*
    key: {
      type: string,
      checked: boolean,
      registered: boolean,
      hidden: boolean,
      references: [{
        button: HTMLElement,
        media: HTMLElement,
      }, ...],
    },
    ...
   */
  };

  function newCollectButton(asset) {
    const span = document.createElement('span');
    span.innerHTML = 'Collect';
    span.className = 'cent-collect-button customize';
    span.addEventListener('click', onClickCollect);
    asset.parentNode.appendChild(span);
    return span;
  }

  function attachCollectButtons() {
    const nonce = parseInt(Math.random() * 2_000_000_000);
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const newAssetURLs = [];
    getMedia().forEach(image => {
      if (image.complete) {
        const rect = image.getBoundingClientRect();
        if (rect.width >= MIN_DIM && rect.height >= MIN_DIM) {
          const src = image.src;
          if (!collectButtonMap[src]) {
            newAssetURLs.push(src);
            collectButtonMap[src] = {
              type: 'image',
              registered: false,
              references: [],
            };
          } else if (collectButtonMap[src].registered && !collectButtonMap[src].hidden) {
            let button = null;
            collectButtonMap[src].references.forEach(reference => {
              if (image === reference.media) {
                button = reference.button;
                reference.nonce = nonce;
              }
            });
            if (!button) {
              button = newCollectButton(image);
              collectButtonMap[src].references.push({
                media: image,
                button,
                nonce,
              });
              button.setAttribute(attrs.ASSET_URL, src);
              button.setAttribute(attrs.ASSET_TITLE, `${src.split('/').slice(-1)}`);
              button.setAttribute(attrs.ASSET_DESCRIPTION, `Collected on ${window.location.href}`);
            }
            button.style.top = Math.round(image.offsetTop + 7) + 'px';
            button.style.left = Math.round(image.offsetLeft + 6) + 'px';
          }
        }
      }
    });
    if (newAssetURLs.length > 0) {
      relay.lookup(newAssetURLs);
    }
    Object.keys(collectButtonMap).forEach((key) => {
      const mb = collectButtonMap[key];
      const index = mb.references.length - 1;
      for (let i = index; i >= 0; i--) {
        if (mb.references[i].nonce !== nonce) {
          const button = mb.references[i].button;
          button.parentNode.removeChild(button);
          mb.references.splice(i, 1);
        }
      }
    });
  }

  function onClickCollect(e) {
    e.stopPropagation();
    e.preventDefault();
    relay.collect({
      assetURL: this.getAttribute(attrs.ASSET_URL),
      assetTitle: this.getAttribute(attrs.ASSET_TITLE),
      assetDescription: this.getAttribute(attrs.ASSET_DESCRIPTION),
      autoCollect: false,
    });
  }


  hooks.push({
    eventName: methods.ASSET_STATUS,
    callback: ({ success, result }) => {
      if (success) {
        result.forEach(r => {
          if (!collectButtonMap[r.assetURL]) {
            collectButtonMap[r.assetURL] = {
              checked: false,
              registered: false,
              hidden: r.hidden,
              references: [],
            };
          }
          collectButtonMap[r.assetURL].registered = r.registered;
          collectButtonMap[r.assetURL].hidden = r.hidden;
          collectButtonMap[r.assetURL].checked = true;
        });
      }
    }
  });
  if (isTouchDevice()) {
    const touch = {
      isTouching: false,
      lastScrollX: window.scrollX,
      lastScrollY: window.scrollY,
    };
    window.addEventListener('touchstart', function (e) {
      if (!e.target.getAttribute(attrs.ASSET_URL)) {
        touch.isTouching = true;
      }
    });
    window.addEventListener('touchend', function (e) {
      touch.isTouching = false;
    });
    setInterval(() => {
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      if (!touch.isTouching && touch.lastScrollY == scrollY && touch.lastScrollX == scrollX) {
        attachCollectButtons();
      }
      touch.lastScrollY = scrollY;
      touch.lastScrollX = scrollX;
    }, 250);
  }
  else {
    const click = {
      clientX: -1,
      clientY: -1,
      lastScrollX: window.scrollX,
      lastScrollY: window.scrollY,
    };
    setInterval(() => {
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      if (click.lastScrollY == scrollY && click.lastScrollX == scrollX) {
        attachCollectButtons();
      }
      click.lastScrollY = scrollY;
      click.lastScrollX = scrollX;
    }, 250);
  }
}

export function collectNFT({ url, title, description, onExit, autoCollect, autoExit }) {
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
    autoExit: autoExit,
  });
}
