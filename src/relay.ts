import {
  methods,
  centIFrameInlineCSS,
} from './constants';

let centIFrame = null;
let centIFrameLoaded = false;
const listeners = [];

const messageCent = (method, params) => centIFrame.contentWindow.postMessage(
  { method, params }, process.env.CENT_RELAY_ROOT
);

const showCent = () => centIFrame.style.display = 'block';

const hideCent = () => centIFrame.style.display = 'none';

const loadCent = (resolve, reject) => {
  if (!resolve) {
    // First invocation, create the Promise and check immediately
    return new Promise((res, rej) => setTimeout(() => loadCent(res, rej), 0));
  } else if (centIFrameLoaded) {
    resolve(centIFrameLoaded);
  } else {
    // TODO? Should we reject after a while?
    setTimeout(() => loadCent(resolve, reject), 30); // Check every 30ms
  }
};

const createCentRelay = () => {
  document.querySelectorAll('iframe').forEach(iframe => {
    if ((iframe.src || '').indexOf(process.env.CENT_RELAY_ROOT) === 0) {
      centIFrame = iframe;
    }
  });
  if (!centIFrame) {
    centIFrame = document.createElement('iframe');
    centIFrame.src = `${process.env.CENT_RELAY_ROOT}/relay?origin=${encodeURIComponent(window.location.origin)}`;
    centIFrame.setAttribute('style', centIFrameInlineCSS);
    document.body.appendChild(centIFrame);
    window.addEventListener('message', (message) => {
      if (message.origin === process.env.CENT_RELAY_ROOT) {
        const {
          method,
          params,
          result,
          error,
        } = message.data;
        switch (method) {
          case methods.ASSET_STATUS:
            listeners
            .filter(listener => listener.eventName === methods.ASSET_STATUS)
            .forEach(listener => listener.callback({ result }));
            break;
          case methods.RELAY_HEARTBEAT:
            centIFrameLoaded = true;
            break;
          case methods.CLOSE_SDK: {
            hideCent();
            for (let i = listeners.length - 1; i >= 0; i--) {
              if (listeners[i].eventName === methods.CLOSE_SDK && listeners[i].assetURL === params.assetURL) {
                listeners.pop().callback(result);
              }
            }
            break;
          }
          case methods.GET_USER_COLLECTION: {
            for (let i = listeners.length - 1; i >= 0; i--) {
              if (listeners[i].eventName === methods.GET_USER_COLLECTION) {
                listeners.pop().callback({ result, error });
              }
            }
            break;
          }
          case methods.LOGIN_USER: {
            for (let i = listeners.length - 1; i >= 0; i--) {
              if (listeners[i].eventName === methods.LOGIN_USER) {
                listeners.pop().callback({ result, error });
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
};

export function init() {
  // Kick off initialization once the page is loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createCentRelay();
  } else {
    window.addEventListener('DOMContentLoaded', createCentRelay);
  }

  return {
    internal: {
      manageNFT: async (assetURL, showPreRelease) => {
        await loadCent();
        showCent();
        messageCent(methods.MANAGE_ASSET, {
          assetURL,
          showPreRelease,
        });
      },
      lookupUrls: async (assetURLs) => {
        await loadCent();
        messageCent(methods.ASSET_STATUS, {
          assetURLs
        });
      },
      addListener: ({ eventName, callback }) => {
        listeners.push({ eventName, callback });
      },
    },
    public: {
      getUserCollection: async ({ email, limit=20, offset=0 }) => {
        await loadCent();
        return new Promise(async (resolve, reject) => {
          listeners.push({
            eventName: methods.GET_USER_COLLECTION,
            callback: ({ result, error }) => error ? reject(error) : resolve(result),
          });
          messageCent(methods.GET_USER_COLLECTION, {
            email,
            limit,
            offset,
          });
        });
      },
      loginUser: async () => {
        await loadCent();
        return new Promise(async (resolve, reject) => {
          listeners.push({
            eventName: methods.LOGIN_USER,
            callback: ({ result, error }) => error ? reject(error) : resolve(result),
          });
          showCent();
          messageCent(methods.LOGIN_USER);
        });
      },
      getUser: async () => {
        await loadCent();
        return new Promise(async (resolve, reject) => {
          listeners.push({
            eventName: methods.GET_USER,
            callback: ({ result, error }) => error ? reject(error) : resolve(result),
          });
          messageCent(methods.GET_USER);
        });
      },
      signMessage: async ({ message }) => {
        await loadCent();
        return new Promise(async (resolve, reject) => {
          listeners.push({
            eventName: methods.SIGN_MESSAGE,
            callback: ({ result, error }) => error ? reject(error) : resolve(result),
          });
          messageCent(methods.SIGN_MESSAGE, {
            message,
          });
        });
      },
      collectNFT: async ({ url, title, description, onExit, autoCollect=true, autoExit=false }) => {
        await loadCent();
        if (typeof onExit === 'function') {
          listeners.push({
            eventName: methods.CLOSE_SDK,
            assetURL: url,
            callback: onExit,
          });
        }
        showCent();
        messageCent(methods.COLLECT_ASSET, {
          assetURL: url,
          assetTitle: title,
          assetDescription: description,
          autoCollect,
          autoExit,
        });
      },
    },
  }
}
