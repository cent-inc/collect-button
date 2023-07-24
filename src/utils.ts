export function getMedia() {
  const images = Array.prototype.slice.call(document.querySelectorAll('img'));
  return images.filter(image => {
    const ext = (image.src || '')
    .split('/').slice(-1)[0]  // Get last part of the path
    .split('.').slice(-1)[0]  // Get file extension
    .split('?')[0]            // Strip query string
    .toLowerCase();           // Normalize casing
    return (ext === 'png' || ext === 'gif' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp');
  });
}

export function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}

export function activateManager() {
  if (getQueryVariable('collectManager')) {
    // Activate the manager and strip query string directive from the url.
    window.localStorage.setItem('collect-manager', 'true');
    window.location.replace(window.location.href.replace('collectManager=1', ''));
    return true;
  }
  return false;
}

export function deactivateManager() {
  window.localStorage.removeItem('collect-manager');
  window.location.href = window.location.href.replace('collectManager=', 'exit=');
}

export function managerActivated() {
  return window.localStorage.getItem('collect-manager') === 'true';
}

export function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i += 1) {
    const pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return null;
}

export function showPreRelease() {
	return !!getQueryVariable('preRelease');
}
