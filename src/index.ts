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
            button.setAttribute(attrs.COLLECT_STATE, collectStates.COLLECTABLE);
            // getCollectStatus(button.getAttribute(attrs.ASSET_URL));
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
              loggedIn = result.userAuthenticated;
            }
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
          console.log('CENT RELAY >>>', message.data);
        });
        break;
      }
      case methods.REMOVE_FRAME: {
        centRelayIFrame.style.display = 'none';
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
  button.style.backgroundColor = '#000';
  button.style.color = '#FFF';
  button.style.border = '1px solid black';
  button.style.borderRadius = '6px';
  button.style.cursor = 'pointer';
  button.onclick = onClickHandler;
  container.appendChild(button);
};

function onClickHandler() {
  centRelayIFrame.style.display = 'block';
  collect(
    this.getAttribute(attrs.ASSET_URL),
    this.getAttribute(attrs.ASSET_TITLE),
    this.getAttribute(attrs.ASSET_DESCRIPTION)
  );
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

function sendPostMessage (method, params) {
  centRelayIFrame.contentWindow.postMessage({ method, params }, '*');
};
