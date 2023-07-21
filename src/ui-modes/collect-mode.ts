import {
  attrs,
  methods,
  MIN_DIM,
} from '../constants';
import '../styles/index.css';
import {
  isTouchDevice,
  getMedia,
} from '../utils';

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

export function initCollectMode(relay) {
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
    const newAssetUrls = [];
    getMedia().forEach(image => {
      if (image.complete) {
        const rect = image.getBoundingClientRect();
        if (rect.width >= MIN_DIM && rect.height >= MIN_DIM) {
          const src = image.src;

          if (!collectButtonMap[src]) {
            newAssetUrls.push(src);
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

            const buttonStyle = getButtonPositionFromDisplayData(collectButtonMap[src].displayData, image);
            button.style.top = buttonStyle.top;
            button.style.left = buttonStyle.left;
          }
        }
      }
    });
    if (newAssetUrls.length > 0) {
      relay.private.lookupUrls(newAssetUrls);
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
    relay.public.collectNFT({
      url: this.getAttribute(attrs.ASSET_URL),
      title: this.getAttribute(attrs.ASSET_TITLE),
      description: this.getAttribute(attrs.ASSET_DESCRIPTION),
      autoCollect: false,
    });
  }

  relay.private.addListener({
    eventName: methods.ASSET_STATUS,
    callback: ({ result }) => {
      if (result) {
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
