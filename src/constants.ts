export const methods = {
  RELAY_HEARTBEAT: 'relay-heartbeat',
  USER_STATUS: 'user-status',
  COLLECT_STATUS: 'collect-status',
  COLLECT_ASSET: 'collect-asset',
  LOGIN: 'login',
}
export const routes = {
  [methods.USER_STATUS]: 'api/_/user?sessionUser=1',
  [methods.COLLECT_STATUS]: 'api/_/collect-button/status',
  [methods.COLLECT_ASSET]: 'api/_/collect-button/collect',
  [methods.LOGIN]: 'magic-login.html',
};

export const collectStates = {
  INITIAL: 0,
  LOADING: 1,
  COLLECTED: 2,
  COLLECTABLE: 3
};
