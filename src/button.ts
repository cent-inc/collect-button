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

function init() {
  const activateManager = getQueryVariable('collectManager');
  if (activateManager || window.localStorage.getItem('collect-manager') === 'true') {
    window.localStorage.setItem('collect-manager', 'true');
    if (activateManager) {
      window.location.replace(window.location.href.replace(`?collectManager${activateManager === 'undefined' ? '' : `=${activateManager}`}`, ''));
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
  span.innerHTML = '<img src="https://cent.co/favicon.ico" class="cent-exit-logo">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Exit';
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
  window.localStorage.removeItem('collect-manager');
  window.location.href = window.location.href.replace('collectManager=', 'exit=');
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
