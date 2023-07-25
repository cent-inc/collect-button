import {
  attrs,
  methods,
} from './constants';
import './styles/index.css'
import { activateManager, managerActivated } from './utils';
import { initManageMode } from './ui-modes/manage-mode';
import { initCollectMode } from './ui-modes/collect-mode';
import * as Relay from './relay';

let relay = {};
if (!activateManager()) {
  relay = Relay.init();
  if (managerActivated()) {
    initManageMode(relay);
  } else {
    initCollectMode(relay);
  }
}

export const cent = { ...relay.public };
