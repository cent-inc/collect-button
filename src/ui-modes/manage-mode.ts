import {
  attrs,
  methods,
  MIN_DIM,
} from '../constants';
import {
  deactivateManager,
  showPreRelease,
  getMedia,
} from '../utils';

export function initManageMode(relay) {
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

  function newManageButton(asset) {
    const span = document.createElement('span');
    span.innerHTML = 'View';
    span.className = 'cent-manage-button customize';
    span.addEventListener('click', onClickManage);
    asset.parentNode.appendChild(span);
    return span;
  }

  function newSetupButton(asset) {
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

  function attachManageButtons() {
    const nonce = parseInt(Math.random() * 2_000_000_000);
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const newAssetUrls = [];
    getMedia().forEach(image => {
      if (image.complete) {
        const rect = image.getBoundingClientRect();
        if (rect.width >= MIN_DIM && rect.height >= MIN_DIM) {
          const src = image.src;
          if (!manageButtonMap[src]) {
            newAssetUrls.push(src);
            manageButtonMap[src] = {
              type: 'image',
              checked: false,
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
                button = newSetupButton(image);
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
    if (newAssetUrls.length > 0) {
      relay.internal.lookupUrls(newAssetUrls);
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

  function onClickManage(e) {
    e.stopPropagation();
    e.preventDefault();
    relay.internal.manageNFT(
      this.getAttribute(attrs.ASSET_URL),
      showPreRelease(),
    );
  }

  function onClickExit() {
    deactivateManager();
  }

  newExitButton();
  relay.internal.addListener({
    eventName: methods.ASSET_STATUS,
    callback: ({ result }) => {
      if (result) {
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
