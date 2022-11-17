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
  Icon,
  Input,
  Button,
  Modal,
  IModal,
} from './generic';
import CollectSuccess from './CollectSuccess';

export function App(props) {

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [waitingOnMagic, setWaitingOnMagic] = useState(false);
  const [showSuccess, setShowSuccess] = useState(true);

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
        setShowSuccess(true);
      }
      else if (message.data === 'magic-login-failure') {
        api.finishLogin(false);
        setShowLoginModal(false);
        setWaitingOnMagic(false);
      }
    }
  };

  const onCloseSuccess = () => {
    api.removeFrame(true);
    setShowSuccess(false)
  }

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
          onClose={() => {
            api.finishLogin(false);
            setShowLoginModal(false);
            setWaitingOnMagic(false);
          }}
        >
          <SSignupContainer>
            <STitle styleType="text">
              Enter your email address to start collecting NFTs
            </STitle>
            <SText styleType="fieldLabel">
              You’ll unlock a Cent web3 wallet that your newly minted NFT will go to.
              Discover what you can do with your new wallet and collection
              {' '}
              <SLink
                href="https://www.cent.co/"
                target="_blank"
              >
                here.
              </SLink>
            </SText>
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
            <SButton
              styleType="primary"
              onClick={() => {
                setWaitingOnMagic(true);
                api.startLogin(email);
              }}
              loading={waitingOnMagic}
              disabled={waitingOnMagic}
            >
              Collect
            </SButton>
            <STerms styleType="fieldLabel">
              By clicking "Collect" you agree to our
              {' '}
              <SLink
                href="https://www.cent.co/-/legal/terms"
                target="_blank"
              >
                Terms of Use
              </SLink>
            </STerms>
            <SCentSignature
              styleType="smallText"
              onClick={() => {
                window.open('https://www.cent.co', '_blank');
              }}
            >
              <Icon className="fa-solid fa-hexagon" size="sm"/>
              {' '}
              Powered by Cent Pages
            </SCentSignature>
          </SSignupContainer>
        </Modal>
        {
          showSuccess &&
          <CollectSuccess
            onClose={onCloseSuccess}
          />
        }
      </ThemeProvider>
    </React.StrictMode>
  );
};

const SSignupContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SLink = styled.a`
  color: ${({ theme }) => theme.Colors.gray0};
  text-decoration: underline;
  cursor: pointer;
`;

const SButton = styled(Button)`
  width: 100%;
`;

const SText = styled(Text)`
  text-align: center;
`;

const STitle = styled(SText)`
  font-size: 20px;
  margin-bottom: ${({ theme }) => theme.Spacing.regular};
`;

const STerms = styled(SText)`
  margin: 24px 0;
  color: ${({ theme }) => theme.Colors.gray0};
`;

const SCentSignature = styled(SText)`
  font-weight: 400;
  text-transform: none;
  color: ${({ theme }) => theme.Colors.gray600};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.Colors.mint600};
  }
`;

const SEmailInput = styled(Input)`
  margin: ${({ theme }) => theme.Spacing.wide} 0 ${({ theme }) => theme.Spacing.regular};
`;
