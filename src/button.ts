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


enum TcbButtonPosition {
  TOP_LEFT = 'TOP_LEFT',
  TOP_CENTER = 'TOP_CENTER',
  TOP_RIGHT = 'TOP_RIGHT',
  MIDDLE_LEFT = 'MIDDLE_LEFT',
  MIDDLE_CENTER = 'MIDDLE_CENTER',
  MIDDLE_RIGHT = 'MIDDLE_RIGHT',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  BOTTOM_CENTER = 'BOTTOM_CENTER',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT'
}

const getPixelValue = (value: number): string => {
  return Math.round(value) + 'px';
}

const BUTTON_STYLE_Y_AXIS_OFFSET = 7;
const BUTTON_STYLE_X_AXIS_OFFSET = 6;

const BUTTON_HEIGHT_PX = 34;
const BUTTON_WIDTH_PX = 72;

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
} else {
  window.addEventListener('DOMContentLoaded', init);
}

const getButtonPositionFromDisplayData = (displayData, image) => {
  const getTopPixelValue = () => getPixelValue(image.offsetTop + BUTTON_STYLE_Y_AXIS_OFFSET);
  const getYCenterPixelValue = () => getPixelValue(image.offsetTop + image.offsetHeight / 2 - BUTTON_HEIGHT_PX / 2);
  const getBottomPixelValue = () => getPixelValue(image.offsetTop + image.offsetHeight - BUTTON_HEIGHT_PX - BUTTON_STYLE_Y_AXIS_OFFSET);

  const getLeftPixelValue = () => getPixelValue(image.offsetLeft + BUTTON_STYLE_X_AXIS_OFFSET);
  const getXCenterPixelValue = () => getPixelValue(image.offsetLeft + image.offsetWidth / 2 - BUTTON_WIDTH_PX / 2);
  const getRightPixelValue = () => getPixelValue(image.offsetLeft + image.offsetWidth - BUTTON_WIDTH_PX - BUTTON_STYLE_X_AXIS_OFFSET);

  const getDefaultStyle = () => ({
    top: getTopPixelValue(),
    left: getLeftPixelValue()
  });

  if (!displayData || !displayData.tcb_button_position) {
    return getDefaultStyle();
  }

  switch (displayData.tcb_button_position) {
    case TcbButtonPosition.TOP_CENTER:
      return {
        top: getTopPixelValue(),
        left: getXCenterPixelValue()
      }
    case TcbButtonPosition.TOP_RIGHT:
      return {
        top: getTopPixelValue(),
        left: getRightPixelValue()
      }
    case TcbButtonPosition.MIDDLE_CENTER:
      return {
        top: getYCenterPixelValue(),
        left: getXCenterPixelValue()
      }
    case TcbButtonPosition.BOTTOM_LEFT:
      return {
        top: getBottomPixelValue(),
        left: getLeftPixelValue()
      }
    case TcbButtonPosition.BOTTOM_CENTER:
      return {
        top: getBottomPixelValue(),
        left: getXCenterPixelValue()
      }
    case TcbButtonPosition.BOTTOM_RIGHT:
      return {
        top: getBottomPixelValue(),
        left: getRightPixelValue()
      }
    case TcbButtonPosition.TOP_LEFT:
    default:
      return getDefaultStyle();
  }
};

function initCollect(relay, hooks) {
  const collectButtonMap = {
    /*
     key: {
       type: string,
       checked: boolean,
       registered: boolean,
       hidden: boolean,
       display_data: {},
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

            const buttonStyle = getButtonPositionFromDisplayData(collectButtonMap[src].displayData, image)
            button.style.top = buttonStyle.top;
            button.style.left = buttonStyle.left;
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
    callback: ({success, result}) => {
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
          collectButtonMap[r.assetURL].displayData = r.displayData;
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
  } else {
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

export function collectNFT({url, title, description, onExit, autoCollect, autoExit}) {
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
