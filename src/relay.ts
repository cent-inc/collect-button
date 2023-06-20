import {
  methods,
} from './constants';

let relayIFrame = null;
let relayIFrameLoaded = false;
export function init(hooks) {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    _init(hooks);
  }
  else {
    window.addEventListener('DOMContentLoaded', function () {
      _init(hooks);
    });
  }
}
function _init(hooks) {
  document.querySelectorAll('iframe').forEach(iframe => {
    const src = iframe.src || '';
    if (src.indexOf(process.env.CENT_RELAY_ROOT) === 0) {
      relayIFrame = iframe;
    }
  });

  if (!relayIFrame) {
    relayIFrame = document.createElement('iframe');
    relayIFrame.src = `${process.env.CENT_RELAY_ROOT}/relay?origin=${encodeURIComponent(window.location.origin)}`;
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
        result,
        error,
      } = message.data;
      switch (method) {
        case methods.ASSET_STATUS:
          hooks
          .filter(hook => hook.eventName === methods.ASSET_STATUS)
          .forEach(hook => hook.callback({ result, success }));
          break;
        case methods.RELAY_HEARTBEAT:
          relayIFrameLoaded = true;
          break;
        case methods.HIDE_RELAY: {
          hideRelayIFrame();
          for (let i = hooks.length - 1; i >= 0; i--) {
            if (hooks[i].eventName === methods.HIDE_RELAY && hooks[i].assetURL === params.assetURL) {
              hooks.pop().fn(result);
            }
          }
          break;
        }
        case methods.RESOLVE_COLLECTION: {
          for (let i = hooks.length - 1; i >= 0; i--) {
            if (hooks[i].eventName === methods.RESOLVE_COLLECTION) {
              hooks.pop().fn({ result, success, error });
            }
          }
          break;
        }
        case methods.RESOLVE_LOGIN: {
          for (let i = hooks.length - 1; i >= 0; i--) {
            if (hooks[i].eventName === methods.RESOLVE_LOGIN) {
              hooks.pop().fn({ result, success, error });
            }
          }
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

function waitForLoaded(resolve, reject) {
  if (relayIFrameLoaded) {
    resolve(relayIFrameLoaded);
  }
  else {
    setTimeout(waitForLoaded.bind(this, resolve, reject), 30);
  }
}

export async function lookup(assetURLs) {
  await new Promise(waitForLoaded);
  sendPostMessage(methods.ASSET_STATUS, {
    assetURLs
  });
}

export async function getUserCollection({ email, limit=20, offset=0 }) {
  await new Promise(waitForLoaded);
  sendPostMessage(methods.GET_USER_COLLECTION, {
    email,
    limit,
    offset,
  });
}

export async function loginUser() {
  await new Promise(waitForLoaded);
  showRelayIFrame();
  sendPostMessage(methods.USER_LOGIN);
}

export async function collect({ assetURL, assetTitle, assetDescription, autoCollect=true, autoExit=false }) {
  await new Promise(waitForLoaded);
  showRelayIFrame();
  sendPostMessage(methods.COLLECT_ASSET, {
    assetURL,
    assetTitle,
    assetDescription,
    autoCollect,
    autoExit,
  });
}

export async function manage(assetURL, showPreRelease) {
  await new Promise(waitForLoaded);
  showRelayIFrame();
  sendPostMessage(methods.MANAGE_ASSET, {
    assetURL,
    showPreRelease,
  });
}

function sendPostMessage(method, params) {
  relayIFrame.contentWindow.postMessage({ method, params }, process.env.CENT_RELAY_ROOT);
}
