import React, {
  useState,
  useEffect,
  useRef,
} from 'react';
import { ThemeProvider } from 'styled-components';
import { LightTheme } from '../styles';

import styled from 'styled-components';

import * as api from '../api';

import {
  methods,
  collectStates,
} from '../../constants';

import {
  Text,
  Input,
  Modal,
  IModal,
} from './generic';

export function App(props) {

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [waitingOnMagic, setWaitingOnMagic] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setInterval(api.heartbeat, 100);
  }, []);

  const onApiUpdate = async (message) => {
    const parentOrigin = api.getQueryVariable('origin');
    if (message.origin === parentOrigin) {
      if (message.data.method == methods.LOGIN) {
        setShowLoginModal(true);
      }
      else {
        api.call(message.data.method, Object.assign(message.data.params || {}, {
          origin: parentOrigin
        }));
      }
    }
    else if (message.origin === process.env.CENT_APP_ROOT) {
      if (message.data === 'magic-login-success') {
        api.finishLogin(true);
        setShowLoginModal(false);
        setWaitingOnMagic(false);
      }
      else if (message.data === 'magic-login-failure') {
        api.finishLogin(false);
        setShowLoginModal(false);
        setWaitingOnMagic(false);
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


  return (
    <React.StrictMode>
      <ThemeProvider theme={LightTheme}>
        <Modal
          presented={showLoginModal}
          loading={waitingOnMagic}
          title='Collect this NFT'
          confirmLabel='Collect'
          onConfirm={() => {
            setWaitingOnMagic(true);
            api.startLogin(email);
          }}
          onClose={() => {
            api.finishLogin(false);
            setShowLoginModal(false);
            setWaitingOnMagic(false);
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
                setWaitingOnMagic(true);
                api.startLogin(email);
              }
            }}
          />
        </Modal>
      </ThemeProvider>
    </React.StrictMode>
  );
};

const SEmailInput = styled(Input)`
  margin: ${({ theme }) => theme.Spacing.regular} 0;
`;
