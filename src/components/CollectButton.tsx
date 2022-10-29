import React, {
  useState,
  useEffect,
  useRef,
} from 'react';

import styled from 'styled-components';

import * as relay from '../relay/parent';

import {
  methods,
  collectStates,
} from '../constants';

import {
  Text,
  Input,
  Modal,
  IModal,
} from './generic';

export interface CollectButtonParams {
  centPage: string;
  assetURL: string;
  assetTitle: string;
  assetDescription: string;
  buttonStyles?: object;
  buttonText?: string;
}

export default function CollectButton({
  centPage,
  assetURL,
  assetTitle,
  assetDescription,
  buttonStyles,
  buttonText,
  ...props
}: CollectButtonParams) {

  const text = buttonText || 'Collect';
  const styles = Object.assign({}, buttonStyles, {
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: '#02fcac',
    color: 'black',
    border: '1px solid black',
    borderRadius: '12px',
    padding: '.5em 1em',
    fontSize: '1em',
  });

  const [galleryID, setGalleryID] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [waitingOnMagic, setWaitingOnMagic] = useState(false);
  const [callCollect, setCallCollect] = useState(false);
  const [email, setEmail] = useState('');
  const [collectState, setCollectState] = useState(collectStates.INITIAL);

  useEffect(() => {
    relay.createSingleton();
  }, []);

  const onApiUpdate = async (message) => {
    if (message.origin === process.env.CENT_RELAY_ROOT) {
      const {
        success,
        method,
        params,
        result
      } = message.data;
      switch (method) {
        case methods.RELAY_HEARTBEAT: {
          if (collectState === collectStates.INITIAL) {
            setCollectState(collectStates.LOADING);
            getCollectStatus();
          }
          break;
        }
        case methods.COLLECT_ASSET: {
          if (assetURL === params.assetURL) {
            if (success) {
              setCollectState(collectStates.COLLECTED);
            }
            console.log('CENT RELAY >>>', message.data);
          }
          break;
        }
        case methods.COLLECT_STATUS: {
          if (assetURL === params.assetURL) {
            if (success) {
              setLoggedIn(result.userAuthenticated);
              setCollectState(result.userCollected === 0 ? collectStates.COLLECTABLE : collectStates.COLLECTED);
            }
            console.log('CENT RELAY >>>', message.data);
          }
          break;
        }
        case methods.LOGIN: {
          relay.hideOverlay();
          setWaitingOnMagic(false);
          if (success) {
            setLoggedIn(true);
            setShowLoginModal(false);
            if (callCollect) {
              collect();
              setCallCollect(false);
            }
          }
          console.log('CENT RELAY >>>', message.data);
          break;
        }
        default:
          break;
      }
    }
  };
  const onApiUpdateRef = useRef(onApiUpdate);
  const onApiUpdateRefCallback = (e) => onApiUpdateRef.current(e);
  onApiUpdateRef.current = onApiUpdate;

  useEffect(() => {
    window.addEventListener('message', onApiUpdateRefCallback);
    return () => window.removeEventListener('message', onApiUpdateRefCallback);
  }, []);

  const getCollectStatus = async () => {
    relay.sendPostMessage(methods.COLLECT_STATUS, {
      assetURL,
    }, '*');
  };

  const collect = async () => {
    relay.sendPostMessage(methods.COLLECT_ASSET, {
      assetURL,
      assetTitle,
      assetDescription,
    }, '*');
  };

  const login = async () => {
    setWaitingOnMagic(true);
    relay.showOverlay();
    relay.sendPostMessage(methods.LOGIN, {
      email,
    });
  };

  const renderButton = () => {
    switch (collectState) {
      case collectStates.COLLECTABLE:
        return (
          <button
            style={styles}
            onClick={() => {
              if (!loggedIn) {
                setCallCollect(true);
                setShowLoginModal(true);
              }
              else {
                collect();
              }
            }}
          >
            {
              showLoginModal &&
              <span><i class='fa-solid fa-spinner-third fa-spin' />&nbsp;</span>
            }
            Collect
          </button>
        );
      case collectStates.COLLECTED:
        return (
          <button
            style={Object.assign({}, styles, {})}
            onClick={() => window.open(`${process.env.CENT_APP_ROOT}/account/collection`, '_blank')}
          >
            <i className='fa-solid fa-check' />&nbsp;Collected
          </button>
        );
      default:
        return (
          <button
            style={Object.assign({}, styles, { visibility: 'hidden' })}
          >
            Collect
          </button>
        );
    }
  };

  return (
    <span>
      {renderButton()}
      <Modal
        presented={showLoginModal}
        loading={waitingOnMagic}
        title='Collect this NFT'
        confirmLabel='Collect'
        onConfirm={login}
        onClose={() => {
          setCallCollect(false);
          setShowLoginModal(false);
        }}
      >
        <Text styleType="text">
          Verify your email to collect this NFT.
        </Text>
        <SEmailInput
          id="email-input"
          className="login-email-input"
          styleType="text"
          type="email"
          value={email}
          placeholder="Enter email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          onKeyDown={(e) => {
            const code = e.keyCode || e.which;
            if (code === 13) {
              e.preventDefault();
              login();
            }
          }}
        />
      </Modal>
    </span>
  );
};

const SEmailInput = styled(Input)`
  margin: ${({ theme }) => theme.Spacing.regular} 0;
`;
