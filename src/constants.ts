export const methods = {
  RELAY_HEARTBEAT: 'relay-heartbeat',
  USER_STATUS: 'user-status',
  COLLECT_STATUS: 'collect-status',
  COLLECT_ASSET: 'collect-asset',
  LOGIN: 'login',
  LOGIN_STATUS: 'login-status',
  VIEW_COLLECTION: 'login-and-nav',
  HIDE_RELAY: 'hide-relay',
}
export const routes = {
  [methods.USER_STATUS]: 'api/_/user?sessionUser=1',
  [methods.COLLECT_STATUS]: 'api/_/collect-button/status',
  [methods.COLLECT_ASSET]: 'api/_/collect-button/collect',
  [methods.VIEW_COLLECTION]: 'api/_/collect-button/login-and-nav',
  [methods.LOGIN]: 'sdk-login.html',
};

export const collectStates = {
  LOADING: '1',
  COLLECTABLE: '2',
  COLLECTING: '3',
  COLLECTED: '4',
};

export const attrs = {
  COLLECT_STATE: 'data-collect-state',
  ASSET_URL: 'data-asset-url',
  ASSET_TITLE: 'data-asset-title',
  ASSET_DESCRIPTION: 'data-asset-description',
};
