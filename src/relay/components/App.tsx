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
  routes,
  collectStates,
} from '../../constants';

import {
  Text,
  Icon,
  Input,
  Button,
  Modal,
  SModalBackground,
  IModal,
} from './generic';

const PARENT_ORIGIN = api.getQueryVariable('origin');

const VIEWS = {
  LOADING: 'loading',
  LOGIN: 'login',
  CONFIRM: 'confirm',
  SUCCESS: 'success',
  ERROR: 'error',
  NONE: 'none'
};

export function App(props) {
  const [loading, setLoading] = useState(false);
  const [checkedLoginStatus, setCheckedLoginStatus] = useState(false);
  const [view, setView] = useState(VIEWS.NONE);
  const [DIDToken, setDIDToken] = useState(null);
  const [assetURL, setAssetURL] = useState(null);
  const [assetTitle, setAssetTitle] = useState(null);
  const [assetDescription, setAssetDescription] = useState(null);

  const [email, setEmail] = useState('');

  useEffect(() => {
    setInterval(api.heartbeat, 100);
    api.createFrame();
  }, []);

  const onApiUpdate = async (message) => {
    if (message.origin === PARENT_ORIGIN) {
      if (message.data.method === methods.COLLECT_ASSET) {
        const { params } = message.data;
        setLoading(false);
        setView(VIEWS.LOADING);
        setAssetURL(params.assetURL);
        setAssetTitle(params.assetTitle);
        setAssetDescription(params.assetDescription);
        const response = await api.GET(methods.COLLECT_STATUS, {
          assetURL: params.assetURL,
          DIDToken,
          origin: PARENT_ORIGIN,
        });
        const result = response.data.results;
        if (result.userAuthenticated) {
          if (result.userCollected) {
            setView(VIEWS.SUCCESS);
          }
          else if (result.userEligible) {
            setView(VIEWS.CONFIRM);
            await collect(
              DIDToken,
              params.assetURL,
              params.assetTitle,
              params.assetDescription,
            );
          }
          else {
            // User cannot collect this. Define this state
            setView(VIEWS.ERROR);
          }
        }
        else {
          setView(VIEWS.LOGIN);
        }
      }
    }
    else if (message.origin === process.env.CENT_APP_ROOT) {
      if (message.data.method === methods.LOGIN) {
        api.onMagicLoginFinish();
        const loginSuccessful = message.data.success;
        if (loginSuccessful) {
          const DIDToken = message.data.result.DIDToken;
          setDIDToken(DIDToken);
          const response = await api.GET(methods.COLLECT_STATUS, {
            assetURL,
            DIDToken,
            origin: PARENT_ORIGIN,
          });
          const result = response.data.results;
          if (result.assetEligible && result.userAuthenticated) {
            if (result.userCollected) {
              setView(VIEWS.SUCCESS);
            }
            else if (result.userEligible) {
              await collect(
                DIDToken,
                assetURL,
                assetTitle,
                assetDescription,
              );
            }
            else {
              setView(VIEWS.ERROR);
            }
          }
          else {
            setView(VIEWS.ERROR);
          }
        }
        setLoading(false);
      }
      else if (message.data.method === methods.LOGIN_STATUS) {
        const checkSuccessful = message.data.success;
        if (checkSuccessful) {
          if (message.data.result.loggedIn) {
            setDIDToken(message.data.result.DIDToken);
          }
        }
      }
      else if (message.data.method === methods.RELAY_HEARTBEAT) {
        if (!checkedLoginStatus) {
          setCheckedLoginStatus(true);
          api.checkLoginStatus();
        }
      }
    }
  };

  const onCloseModal = () => {
    setLoading(false);
    setView(VIEWS.NONE);
    api.onMagicLoginFinish();
    api.removeFrame(true);
  }

  const onApiUpdateRef = useRef(onApiUpdate);
  const onApiUpdateRefCallback = (e) => onApiUpdateRef.current(e);
  onApiUpdateRef.current = onApiUpdate;

  const collect = async (DIDToken, assetURL, assetTitle, assetDescription) => {
    setLoading(true);
    try {
      await api.POST(methods.COLLECT_ASSET, {
        assetURL,
        assetTitle,
        assetDescription,
        DIDToken,
        origin: PARENT_ORIGIN,
      });
      setView(VIEWS.SUCCESS);
      setLoading(false);
    }
    catch (e) {
      console.log('TCB', e);
      setView(VIEWS.ERROR);
      setLoading(false);
    }
  };

  useEffect(() => {
    window.addEventListener('message', onApiUpdateRefCallback);
    return () => window.removeEventListener('message', onApiUpdateRefCallback);
  }, []);

  return (
    <React.StrictMode>
      <ThemeProvider theme={LightTheme}>
        <Modal
          presented={view === VIEWS.LOGIN}
          loading={+loading}
          onClose={onCloseModal}
        >
          <SSignupContainer>
            <STitle styleType="headerOne">
              Create your NFT
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
                  setLoading(true);
                  api.startMagicLogin(email);
                }
              }}
            />
            <SButton
              styleType="primary"
              onClick={() => {
                setLoading(true);
                api.startMagicLogin(email);
              }}
              loading={+loading}
              disabled={loading}
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
              By clicking Collect you agree to our
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
        {
          view === VIEWS.CONFIRM &&
          <SLoadingModal />
        }
        <Modal
          presented={view === VIEWS.SUCCESS}
          onClose={onCloseModal}
        >
            <STitle styleType="headerOne">
              Collected <SIcon className="fa fa-solid fa-hexagon-check" />
            </STitle>
            <SSuccessLink
              href={`${process.env.CENT_API_ROOT}/${routes[methods.VIEW_COLLECTION]}?DIDToken=${encodeURIComponent(DIDToken)}`}
              target="_blank"
            >
              View it in your collection
              <SSuccessOpenLink className="fa-solid fa-arrow-up-right-from-square" size="sm" />
            </SSuccessLink>
            <SBody styleType="text">
              We also sent you an email with instructions for how to access your NFT.
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
        <Modal
          presented={view === VIEWS.ERROR}
          onClose={onCloseModal}
        >
            <STitle styleType="headerOne">
              Unable to Collect NFT
            </STitle>
            <SBody styleType="text">
              Minting is currently unavailable. Please check back soon.
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

const SLoadingModal = styled(SModalBackground)`
  background-image: url('/loading-mint.gif');
  background-position: center;
  background-repeat: no-repeat;
`;

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
  font-size: 12px;
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

const SIcon = styled.i`
  color: ${({ theme }) => theme.Colors.mint600};
`;

const SSuccessOpenLink = styled(Icon)`
  color: ${({ theme }) => theme.Colors.mint600};
  margin-left: ${({ theme }) => theme.Spacing.condensed};
`;

