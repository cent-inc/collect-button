import axios from 'axios';
import {
  methods,
  routes,
} from '../constants';

axios.defaults.withCredentials = true;

export function heartbeat() {
  parent.postMessage({
    method: methods.RELAY_HEARTBEAT,
    success: true,
  }, '*');
}

function getCentLoginContainers() {
  return document.querySelectorAll('iframe.cent-login-container');
}

export function onMagicLoginFinish() {
  getCentLoginContainers().forEach((e) => e.remove());
}

export function removeFrame(success) {
  parent.postMessage({
    method: methods.REMOVE_FRAME,
    success,
  }, '*');
}

export function createFrame() {
  const containers = getCentLoginContainers();
  if (containers.length === 0) {
    const iframe = document.createElement('iframe');
    iframe.className = 'cent-login-container';
    iframe.src = `${process.env.CENT_APP_ROOT}/${routes[methods.LOGIN]}?origin=${encodeURIComponent(window.location.origin)}`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.zIndex = '10001';
    iframe.style.border = '0';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }
}

export function startMagicLogin(email) {
  const iframe = getCentLoginContainers()[0];
  iframe.style.display = 'block';
  iframe.contentWindow.postMessage({
    method: methods.LOGIN,
    params: {
      email,
      backend: process.env.CENT_API_ROOT,
      magicKey: process.env.CENT_MAGIC_SDK_KEY,
    }
  }, process.env.CENT_APP_ROOT);
}

export function checkLoginStatus() {
  getCentLoginContainers()[0].contentWindow.postMessage({
    method: methods.LOGIN_STATUS,
    params: {
      magicKey: process.env.CENT_MAGIC_SDK_KEY,
    }
  }, process.env.CENT_APP_ROOT);
}

export function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
}

export function POST(method, params) {
  return axios.post(`${process.env.CENT_API_ROOT}/${routes[method]}`, params);
}

export function GET(method, params) {
  return axios.get(`${process.env.CENT_API_ROOT}/${routes[method]}`, { params })
}
