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

export function App(props) {

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [waitingOnMagic, setWaitingOnMagic] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
            <STitle styleType="headerOne">
              Enter your email to start collecting
            </STitle>
            <SEmailInput
              id="email-input"
              className="login-email-input"
              styleType="text"
              type="email"
              value={email}
              placeholder="Email address"
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
            <SBody styleType="text">
              You’ll unlock a web3 wallet for your new collection.
              {' '}
              <SLink
                href="https://www.cent.co/"
                target="_blank"
              >
                Discover what you can do
              </SLink>
              {' '}
              with your wallet.
            </SBody>
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
              styleType="fieldLabel"
              onClick={() => {
                window.open('https://www.cent.co', '_blank');
              }}
            >
              <Icon className="fa-solid fa-hexagon" size="sm"/>
              {' '}
              Powered by Cent
            </SCentSignature>
          </SSignupContainer>
        </Modal>
        <Modal
          presented={showSuccess}
          onClose={onCloseSuccess}
        >
            <STitle styleType="headerOne">
              Congrats, you've just collected an NFT!
            </STitle>
            <SSuccessLink
              href={`${process.env.CENT_APP_ROOT}/account/collection`}
              target="_blank"
            >
              View your NFT now
              <SSuccessOpenLink className="fa-solid fa-arrow-up-right-from-square" size="sm" />
            </SSuccessLink>
            <SBody styleType="text">
              We've also sent you an email with a link to your collectible.
            </SBody>
            <SCentSignature
              styleType="fieldLabel"
              onClick={() => {
                window.open('https://www.cent.co', '_blank');
              }}
            >
              <Icon className="fa-solid fa-hexagon" size="sm"/>
              {' '}
              Powered by Cent
            </SCentSignature>
        </Modal>
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

const SBody = styled(SText)`
  margin-top: 32px;
`;

const STitle = styled(SText)`
  font-weight: 400;
  margin-bottom: ${({ theme }) => theme.Spacing.regular};
`;

const STerms = styled(SText)`
  margin: 24px 0 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.Colors.gray0};

`;

const SCentSignature = styled(SText)`
  margin-top: 24px;
  font-weight: 400;
  text-transform: none;
  color: ${({ theme }) => theme.Colors.gray600};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.Colors.mint600};
  }
`;

const SEmailInput = styled(Input)`
  margin: ${({ theme }) => theme.Spacing.regular} 0;
`;

// Success Modal
const SSuccessLink = styled.a`
  margin-top: 24px;
  color: ${({ theme }) => theme.Colors.mint600};
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SSuccessOpenLink = styled(Icon)`
  color: ${({ theme }) => theme.Colors.mint600};
  margin-left: ${({ theme }) => theme.Spacing.condensed};
`;

