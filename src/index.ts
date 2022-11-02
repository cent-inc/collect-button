import {
  attrs,
  methods,
  collectStates,
} from './constants';
import './styles/index.css'

let centRelayIFrame = null;
const matchedIFrames = document.querySelectorAll('iframe.cent-relay');
if (matchedIFrames.length > 0) {
  centRelayIFrame = matchedIFrames[0];
}
else {
  centRelayIFrame = document.createElement('iframe');
  centRelayIFrame.src = `${process.env.CENT_RELAY_ROOT}/relay.html?origin=${encodeURIComponent(window.location.origin)}`;
  centRelayIFrame.className = 'cent-relay';
  centRelayIFrame.style.display = 'none';
  document.body.appendChild(centRelayIFrame);
}

let loggedIn = false;
window.addEventListener('message', function (message) {
  if (message.origin === process.env.CENT_RELAY_ROOT) {
    const {
      success,
      method,
      params,
      result
    } = message.data;
    const buttons = document.querySelectorAll('.collect-button');
    switch (method) {
      case methods.RELAY_HEARTBEAT: {
        buttons.forEach(button => {
          if (!button.getAttribute(attrs.COLLECT_STATE) && button.getAttribute(attrs.ASSET_URL)) {
            console.log('here');
            button.setAttribute(attrs.COLLECT_STATE, collectStates.LOADING);
            getCollectStatus(button.getAttribute(attrs.ASSET_URL));
            renderButton(button);
          }
        });
        break;
      }
      case methods.COLLECT_STATUS: {
        buttons.forEach(button => {
          if (button.getAttribute(attrs.ASSET_URL) === params.assetURL) {
            if (success) {
              button.setAttribute(attrs.COLLECT_STATE,
                result.userCollected === 0 ? collectStates.COLLECTABLE : collectStates.COLLECTED
              );
            }
            renderButton(button);
          }
        });
        console.log('CENT RELAY >>>', message.data);
        break;
      }
      case methods.COLLECT_ASSET: {
        buttons.forEach(button => {
          if (button.getAttribute(attrs.ASSET_URL) === params.assetURL) {
            if (success) {
              button.setAttribute(attrs.COLLECT_STATE, collectStates.COLLECTED);
            }
            else {
              getCollectStatus(button.getAttribute(attrs.ASSET_URL));
            }
          }
          renderButton(button);
          console.log('CENT RELAY >>>', message.data);
        });
        break;
      }
      case methods.LOGIN: {
        centRelayIFrame.style.display = 'none';
        loggedIn = success;
        if (!success) {
          buttons.forEach(button => {
            button.removeAttribute(attrs.COLLECT_QUEUED);
            renderButton(button);
          });
        }
        else {
          buttons.forEach(button => {
            if (button.getAttribute(attrs.COLLECT_QUEUED)) {
              button.removeAttribute(attrs.COLLECT_QUEUED);
              button.setAttribute(attrs.COLLECT_STATE, collectStates.COLLECTING);
              collect(
                button.getAttribute(attrs.ASSET_URL),
                button.getAttribute(attrs.ASSET_TITLE),
                button.getAttribute(attrs.ASSET_DESCRIPTION)
              );
            }
            else {
              getCollectStatus(button.getAttribute(attrs.ASSET_URL));
            }
            renderButton(button);
          });
        }
        console.log('CENT RELAY >>>', message.data);
        break;
      }
      default:
        break;
    }
  }
});

export function createCollectButton (params, container) {
  const button = document.createElement('button');
  button.setAttribute(attrs.ASSET_URL, params.assetURL);
  button.setAttribute(attrs.ASSET_TITLE, params.assetTitle);
  button.setAttribute(attrs.ASSET_DESCRIPTION, params.assetDescription);
  button.className = 'collect-button';
  button.style.position = 'relative';
  button.style.fontSize = '1em';
  button.style.padding = '.5em 1em';
  button.style.backgroundColor = '#00D893';
  button.style.border = '1px solid black';
  button.style.borderRadius = '6px';
  button.style.cursor = 'pointer';
  button.onclick = onClickHandler;
  renderButton(button);
  container.appendChild(button);
};

function renderButton(button) {
  switch (button.getAttribute(attrs.COLLECT_STATE)) {
    case collectStates.COLLECTED: {
      break;
    }
    case collectStates.COLLECTING: {
      break;
    }
    case collectStates.COLLECTABLE: {
      break;
    }
    default: {
      break;
    }
  }
}

function onClickHandler() {
  const state = this.getAttribute(attrs.COLLECT_STATE);
  if (state === collectStates.COLLECTABLE) {
    if (loggedIn) {
      this.setAttribute(attrs.COLLECT_STATE, collectStates.COLLECTING);
      collect(
        this.getAttribute(attrs.ASSET_URL),
        this.getAttribute(attrs.ASSET_TITLE),
        this.getAttribute(attrs.ASSET_DESCRIPTION)
      )
    }
    else {
      this.setAttribute(attrs.COLLECT_QUEUED, '1');
      login();
    }
  }
  else if (state === collectStates.COLLECTED) {
    window.open(`${process.env.CENT_APP_ROOT}/account/collection`, '_blank');
  }
}

const getCollectStatus = (assetURL) => {
  sendPostMessage(methods.COLLECT_STATUS, {
    assetURL,
  });
};

const collect = (assetURL, assetTitle, assetDescription) => {
  sendPostMessage(methods.COLLECT_ASSET, {
    assetURL,
    assetTitle,
    assetDescription,
  });
};

const login = () => {
  centRelayIFrame.style.display = 'block';
  sendPostMessage(methods.LOGIN, {});
};

function sendPostMessage (method, params) {
  centRelayIFrame.contentWindow.postMessage({ method, params }, '*');
};
