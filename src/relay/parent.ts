export const createSingleton = () => {
  if (!window.centRelayIFrame) {
    window.centRelayIFrame = document.createElement('iframe');
    window.centRelayIFrame.src = `${process.env.CENT_RELAY_ROOT}/relay.html?origin=${encodeURIComponent(window.location.origin)}`;
    window.centRelayIFrame.style.display = 'none';
    window.centRelayIFrame.style.width = '100%';
    window.centRelayIFrame.style.height = '100%';
    window.centRelayIFrame.style.position = 'fixed';
    window.centRelayIFrame.style.top = '0';
    window.centRelayIFrame.style.left = '0';
    window.centRelayIFrame.style.zIndex = '2147483647';
    window.centRelayIFrame.style.border = '0';
    window.centRelayIFrame.style.padding = '0';
    window.centRelayIFrame.style.margin = '0';
    document.body.appendChild(window.centRelayIFrame);
  }
};

export const sendPostMessage = (method, params) => {
  window.centRelayIFrame.contentWindow.postMessage({ method, params }, '*');
};

export const showOverlay = () => window.centRelayIFrame.style.display = 'block';
export const hideOverlay = () => window.centRelayIFrame.style.display = 'none';
