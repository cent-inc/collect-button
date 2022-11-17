import axios from 'axios';
import {
  methods,
  routes,
} from '../constants';

axios.defaults.withCredentials = true;

export function call(method, params) {
  switch (method) {
    case methods.USER_STATUS:
      return GET(method, params);
    case methods.COLLECT_STATUS:
      console.log(params);
      return GET(method, params);
    case methods.COLLECT_ASSET:
      return POST(method, params);
    default:
      break;
  }
}

export function heartbeat() {
  parent.postMessage({
    method: methods.RELAY_HEARTBEAT,
    success: true,
  }, '*');
}

export function finishLogin(success) {
  document.querySelectorAll('.magic-login-frame').forEach((e) => e.remove());
  parent.postMessage({
    method: methods.LOGIN,
    success,
  }, '*');
}

export function removeFrame(success) {
  parent.postMessage({
    method: methods.REMOVE_FRAME,
    success,
  }, '*');
}

export function startLogin(email) {
  const params = [
    `email=${encodeURIComponent(email)}`,
    `backend=${encodeURIComponent(process.env.CENT_API_ROOT)}`,
    `magicKey=${encodeURIComponent(process.env.CENT_MAGIC_SDK_KEY)}`,
  ];
  const iframe = document.createElement('iframe');
  iframe.className = 'magic-login-frame';
  iframe.src = `${process.env.CENT_APP_ROOT}/${routes[methods.LOGIN]}?${params.join('&')}`;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.zIndex = '10001';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
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

function POST(method, params) {
  return axios.post(`${process.env.CENT_API_ROOT}/${routes[method]}`, params)
  .then((response) => {
    parent.postMessage({
      success: true,
      method,
      params,
      result: response.data.results,
    }, '*');
  })
  .catch((e) => {
    parent.postMessage({
      success: false,
      method,
      params,
      result: e.response.data,
    }, '*');
  });
}

function GET(method, params) {
  return axios.get(`${process.env.CENT_API_ROOT}/${routes[method]}`, { params })
  .then((response) => {
    parent.postMessage({
      success: true,
      method,
      params,
      result: response.data.results,
    }, '*');
  })
  .catch((e) => {
    parent.postMessage({
      success: false,
      method,
      params,
      result: e.response.data,
    }, '*');
  });
}
