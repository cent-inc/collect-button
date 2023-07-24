export const methods = {
  RELAY_HEARTBEAT: 'relay-heartbeat',
  ASSET_STATUS: 'asset-status',
  COLLECT_ASSET: 'collect-asset',
  CLOSE_SDK: 'close-sdk',
  SIGN_MESSAGE: 'sign-message',
  MANAGE_ASSET: 'manage-asset',
  GET_USER_COLLECTION: 'get-user-collection',
  GET_USER: 'get-user',
  LOGIN_USER: 'login-user',
}

export const attrs = {
  ASSET_URL: 'data-asset-url',
  ASSET_TITLE: 'data-asset-title',
  ASSET_DESCRIPTION: 'data-asset-description',
};

export const MIN_DIM = 100;

export const centIFrameInlineCSS = `
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
`;

export const legacyCollectButtonInlineCSS = `
  position: relative;
  font-size: 1em;
  padding: .5em 1em;
  background-color: #000;
  color: #FFF;
  border: 1px solid black;
  border-radius: 6px;
  cursor: pointer;
`;
