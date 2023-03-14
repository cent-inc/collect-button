import {
  attrs,
  methods,
} from './constants';
import * as relay from './relay';
import './styles/index.css';

const collectButtonMap = {
 /*
  key: {
    type: string,
    checked: boolean,
    registered: boolean,
    references: [{
      button: HTMLElement,
      media: HTMLElement,
    }, ...],
  },
  ...
 */
};

const manageButtonMap = {
 /*
  key: [{
    nonce: number,
    overlay: HTMLElement,
    media: HTMLElement
  }, ...],
  ...
 */
};
const MIN_DIM = 100;
const hooks = [];
relay.init(hooks);

const checkOverride = false;
function init() {
  const activateManager = getQueryVariable('collectManager');
  if (activateManager || window.localStorage.getItem('collect-manager') === 'true') {
    window.localStorage.setItem('collect-manager', 'true');
    if (activateManager) {
      const { location } = window;
      const qsFragments = location.search.substr(1).split('&').filter(key => key.indexOf('collectManager') !== 0);
      const newQs = qsFragments.length > 0 ? `?${qsFragments.join('&')}` : '';
      location.replace(`${location.origin}${location.pathname}${newQs}${location.hash}`);
    } else {
      newExitButton();
      initManage();
    }
  }
  else {
    initCollect();
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

function initCollect() {
  hooks.push({
    eventName: methods.ASSET_STATUS,
    callback: ({ success, result }) => {
      if (success) {
        result.forEach(r => {
          if (!collectButtonMap[r.assetURL]) {
            collectButtonMap[r.assetURL] = {
              checked: false,
              registered: false,
              references: [],
            };
          }
          collectButtonMap[r.assetURL].registered = r.registered;
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

function initManage() {
  hooks.push({
    eventName: methods.ASSET_STATUS,
    callback: ({ success, result }) => {
      if (success) {
        result.forEach(r => {
          if (
            manageButtonMap[r.assetURL] &&
            manageButtonMap[r.assetURL].registered === false &&
            r.registered === true
          ) {
            manageButtonMap[r.assetURL].references.forEach(ref => {
              ref.button.innerHTML = 'View';
              ref.button.className = 'cent-manage-button customize';
            });
          }
          if (!manageButtonMap[r.assetURL]) {
            manageButtonMap[r.assetURL] = {
              checked: false,
              registered: false,
              references: [],
            };
          }
          manageButtonMap[r.assetURL].registered = r.registered;
          manageButtonMap[r.assetURL].checked = true;
        });
      }
    }
  });
  setInterval(attachManageButtons, 250);
}

function newCollectButton(asset) {
  const span = document.createElement('span');
  span.innerHTML = 'Collect';
  span.className = 'cent-collect-button customize';
  span.addEventListener('click', onClickCollect);
  asset.parentNode.appendChild(span);
  return span;
}

function newManageButton(asset) {
  const span = document.createElement('span');
  span.innerHTML = 'View';
  span.className = 'cent-manage-button customize';
  span.addEventListener('click', onClickManage);
  asset.parentNode.appendChild(span);
  return span;
}

function newMintButton(asset) {
  const span = document.createElement('span');
  span.innerHTML = 'Setup';
  span.className = 'cent-mint-button customize';
  span.addEventListener('click', onClickManage);
  asset.parentNode.appendChild(span);
  return span;
}

function newExitButton() {
  const span = document.createElement('span');
  span.innerHTML = '<img src="data:image/png;base64,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" class="cent-exit-logo">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Exit';
  span.className = 'cent-exit-button customize';
  span.addEventListener('click', onClickExit);
  document.body.appendChild(span);
  return span;
}

function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}

function getMedia() {
  const images = Array.prototype.slice.call(document.querySelectorAll('img'));
  return images.filter(image => {
    const ext = (image.src || '')
    .split('/').slice(-1)[0]  // Get last part of the path
    .split('.').slice(-1)[0]  // Get file extension
    .split('?')[0]            // Strip query string
    .toLowerCase();           // Normalize casing
    return (ext === 'png' || ext === 'gif' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp');
  });
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
        } else if (collectButtonMap[src].registered) {
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

function attachManageButtons() {
  const nonce = parseInt(Math.random() * 2_000_000_000);
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  const newAssetURLs = [];
  getMedia().forEach(image => {
    if (image.complete) {
      const rect = image.getBoundingClientRect();
      if (rect.width >= MIN_DIM && rect.height >= MIN_DIM) {
        const src = image.src;
        if (!manageButtonMap[src]) {
          newAssetURLs.push(src);
          manageButtonMap[src] = {
            type: 'image',
            checked: checkOverride || false,
            registered: false,
            references: [],
          };
        } else if (manageButtonMap[src].checked) {
          if (manageButtonMap[src].registered) {
            let button = null;
            manageButtonMap[src].references.forEach(reference => {
              if (image === reference.media) {
                button = reference.button;
                reference.nonce = nonce;
              }
            });
            if (!button) {
              button = newManageButton(image);
              manageButtonMap[src].references.push({
                media: image,
                button,
                nonce,
              });
              button.setAttribute(attrs.ASSET_URL, src);
            }
            button.style.top = Math.round(image.offsetTop + 7) + 'px';
            button.style.left = Math.round(image.offsetLeft + 6) + 'px';
          } else {
            let button = null;
            manageButtonMap[src].references.forEach(reference => {
              if (image === reference.media) {
                button = reference.button;
                reference.nonce = nonce;
              }
            });
            if (!button) {
              button = newMintButton(image);
              manageButtonMap[src].references.push({
                media: image,
                button,
                nonce,
              });
              button.setAttribute(attrs.ASSET_URL, src);
            }
            button.style.top = Math.round(image.offsetTop + 7) + 'px';
            button.style.left = Math.round(image.offsetLeft + 6) + 'px';
          }
        }
      }
    }
  });
  if (newAssetURLs.length > 0) {
    relay.lookup(newAssetURLs);
  }
  Object.keys(manageButtonMap).forEach((key) => {
    const mb = manageButtonMap[key];
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
  relay.collect(
    this.getAttribute(attrs.ASSET_URL),
    this.getAttribute(attrs.ASSET_TITLE),
    this.getAttribute(attrs.ASSET_DESCRIPTION)
  );
}

function onClickManage(e) {
  e.stopPropagation();
  e.preventDefault();
  relay.manage(
    this.getAttribute(attrs.ASSET_URL)
  );
}

function onClickExit() {
  if (checkOverride) {
    window.alert('Disable plugin to exit');
  }
  else {
    window.localStorage.removeItem('collect-manager');
    window.location.href = window.location.href.replace('collectManager=', 'exit=');
  }
}

function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i += 1) {
    const pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return null;
}

export function collectNFT({ url, title, description }) {
  relay.collect(url, title, description);
}

function onClickHandler() {
  relay.collect(
    this.getAttribute(attrs.ASSET_URL),
    this.getAttribute(attrs.ASSET_TITLE),
    this.getAttribute(attrs.ASSET_DESCRIPTION),
  );
}
