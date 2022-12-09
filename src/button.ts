import {
  attrs,
} from './constants';
import * as relay from './relay';

const mediaButtonMap = {
 /*
  key: [{
    nonce: number,
    button: HTMLElement,
    media: HTMLElement
  }, ...],
  ...
 */
};
const MIN_DIM = 150;

relay.init();

if (isTouchDevice()) {
  let isTouching = false;
  let lastScrollY = window.scrollY;
  let lastScrollX = window.scrollX;
  window.addEventListener('touchstart', function (e) {
    isTouching = true;
    detachButtons();
  });
  window.addEventListener('touchend', function (e) {
    isTouching = false;
  });
  setInterval(() => {
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    if (!isTouching && lastScrollY == scrollY && lastScrollX == scrollX) {
      attachButtons();
    }
    lastScrollY = scrollY;
    lastScrollX = scrollX;
  }, 250);
}
else {
  const button = newButton();
  button.addEventListener('mouseover', showButtonBorderDesktop);
  button.addEventListener('mouseout', hideButtonBorderDesktop);
  let clientY = -1;
  let clientX = -1;
  window.addEventListener('mousemove', function (e) {
    clientY = e.clientY;
    clientX = e.clientX;
    if (e.target.nodeName === 'IMG') {
      const rect = e.target.getBoundingClientRect();
      if (rect.width >= MIN_DIM && rect.height >= MIN_DIM) {
        button.style.top = Math.round(rect.top + window.scrollY + 8) + 'px';
        button.style.left = Math.round(rect.left + window.scrollX + 6) + 'px';
        button.setAttribute(attrs.ASSET_URL, e.target.src);
        button.setAttribute(attrs.ASSET_TITLE, `${e.target.src.split('/').slice(-1)}`);
        button.setAttribute(attrs.ASSET_DESCRIPTION, `Collected at ${window.location.href}`);
        showButtonDesktop(button);
      }
    }
    else if (e.target !== button) {
      hideButtonDesktop(button);
    }
  });
  window.addEventListener('scroll', function (e) {
    if (clientY > -1) {
      const elt = document.elementFromPoint(clientX, clientY);
      if (elt.nodeName === 'IMG') {
        const rect = elt.getBoundingClientRect();
        if (rect.width >= MIN_DIM && rect.height >= MIN_DIM) {
          button.style.top = Math.round(rect.top + window.scrollY + 8) + 'px';
          button.style.left = Math.round(rect.left + window.scrollX + 6) + 'px';
          showButtonDesktop(button);
        }
      }
      else if (e.target !== button) {
        hideButtonDesktop(button);
      }
    }
  });
}

function newButton(mobile) {
  const span = document.createElement('span');
  span.innerHTML = 'Collect';
  span.setAttribute('style', `
    font-family: Helvetica !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    background-color: white !important;
    color: black !important;
    cursor: pointer !important;
    padding: 4px 8px !important;
    border-radius: 500px !important;
    background-clip: padding-box;
    border: 2px solid transparent !important;
    transition: border .5s, opacity .5s !important;
    position: absolute !important;
    z-index: 8675310 !important;
    opacity: ${mobile ? '0' : '1'};
    display: ${mobile ? 'block' : 'none'};
  `);
  span.addEventListener('click', onClickHandler);
  document.body.appendChild(span);
  return span;
}

function showButtonMobile(button) {
  button.style.opacity = '1';
}

function hideButtonMobile(button) {
  button.style.opacity = '0';
}

function showButtonDesktop(button) {
  button.style.display = 'block';
}

function hideButtonDesktop(button) {
  button.style.display = 'none';
}

function showButtonBorderDesktop(e) {
  e.target.style.border = '2px solid black';
}

function hideButtonBorderDesktop(e) {
  e.target.style.border = '2px solid transparent';
}

function isTouchDevice () {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}

function attachButtons () {
  const nonce = parseInt(Math.random() * 2_000_000_000);
  const images = document.querySelectorAll('img');
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  images.forEach(image => {
    if (image.complete) {
      const rect = image.getBoundingClientRect();
      if (rect.width >= MIN_DIM && rect.height >= MIN_DIM) {
        const src = image.src;
        let button = null;
        if (!mediaButtonMap[src]) {
          button = newButton(true);
          mediaButtonMap[src] = [{
            nonce,
            button,
            media: image
          }];
        }
        else {
          mediaButtonMap[src].forEach(mb => {
            if (image === mb.media) {
              button = mb.button;
              mb.nonce = nonce;
            }
          });
          if (!button) {
            button = newButton(true);
            mediaButtonMap[src].push({
              nonce,
              button,
              media: image
            });
          }
        }
        button.setAttribute(attrs.ASSET_URL, src);
        button.setAttribute(attrs.ASSET_TITLE, `${e.target.src.split('/').slice(-1)}`);
        button.setAttribute(attrs.ASSET_DESCRIPTION, `Collected at ${window.location.href}`);
        button.style.top = Math.round(rect.top + scrollY + 8) + 'px';
        button.style.left = Math.round(rect.left + scrollX + 6) + 'px';
        showButtonMobile(button);
      }
    }
  });
  // Cleanup
  Object.keys(mediaButtonMap).forEach((key) => {
    const mediaButtons = mediaButtonMap[key];
    const index = mediaButtons.length - 1;
    for (let i = index; i >= 0; i--) {
      if (mediaButtons[i].nonce !== nonce) {
        const button = mediaButtons[i].button;
        button.parentNode.removeChild(button);
        mediaButtons.splice(i, 1);
      }
    }
    if (mediaButtons.length === 0) {
      delete mediaButtonMap[key];
    }
  });
}

function detachButtons () {
  Object.keys(mediaButtonMap).forEach((key) => {
    mediaButtonMap[key].forEach(mb => {
      hideButtonMobile(mb.button);
    });
  });
}

function onClickHandler() {
  relay.collect(
    this.getAttribute(attrs.ASSET_URL),
    this.getAttribute(attrs.ASSET_TITLE),
    this.getAttribute(attrs.ASSET_DESCRIPTION)
  );
}
