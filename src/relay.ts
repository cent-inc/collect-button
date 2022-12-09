import {
  methods,
} from './constants';

let relayIFrame = null;
let relayIFrameLoaded = false;
export function init() {
  document.querySelectorAll('iframe').forEach(iframe => {
    const src = iframe.src || '';
    if (src.indexOf(process.env.CENT_RELAY_ROOT) === 0) {
      relayIFrame = iframe;
    }
  });

  if (!relayIFrame) {
    relayIFrame = document.createElement('iframe');
    relayIFrame.src = `${process.env.CENT_RELAY_ROOT}/relay.html?origin=${encodeURIComponent(window.location.origin)}`;
    relayIFrame.className = 'cent-relay';
    relayIFrame.setAttribute('style', `
      width: 100% !important;
      height: 100% !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      z-index: 2147483647 !important;
      border: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      display: none;
    `)
    document.body.appendChild(relayIFrame);
  }

  window.addEventListener('message', function (message) {
    if (message.origin === process.env.CENT_RELAY_ROOT) {
      const {
        success,
        method,
        params,
        result
      } = message.data;
      switch (method) {
        case methods.RELAY_HEARTBEAT:
          relayIFrameLoaded = true;
          break;
        case methods.HIDE_RELAY: {
          hideRelayIFrame()
          break;
        }
        default:
          break;
      }
    }
  });
}


function showRelayIFrame() {
  relayIFrame.style.display = 'block';
}

function hideRelayIFrame() {
  relayIFrame.style.display = 'none';
}

function waitForLoaded (resolve, reject) {
  if (relayIFrameLoaded) {
    resolve(relayIFrameLoaded);
  }
  else {
    setTimeout(waitForLoaded.bind(this, resolve, reject), 30);
  }
}

export async function collect (assetURL, assetTitle, assetDescription) {
  await new Promise(waitForLoaded);
  showRelayIFrame();
  sendPostMessage(methods.COLLECT_ASSET, {
    assetURL,
    assetTitle,
    assetDescription,
  });
}

function sendPostMessage (method, params) {
  relayIFrame.contentWindow.postMessage({ method, params }, process.env.CENT_RELAY_ROOT);
}
