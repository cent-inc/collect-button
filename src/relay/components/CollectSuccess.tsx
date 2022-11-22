import React, { useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import {
  Text,
  Icon,
} from './generic';

export interface ICollectSuccess {
  className: string;
  onClose: () => void;
}

function CollectSuccess({
  className,
  onClose,
}: ICollectSuccess) {
  const timerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onCloseSuccess();
    }, 5000);
  }, []);

  const onCloseSuccess = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onClose();
  };

  return (
    <SToastContainer className={className}>
      <SIcon className="fas fa-check" size="lg" />
      <div>
        <STitle styleType="headerThree">
          Congrats, you've just collected an NFT!
        </STitle>
        <SMessage styleType="text">
          We've sent you an email with a link to your collectible.
        </SMessage>
        <SLink
          href={`${process.env.CENT_APP_ROOT}/account/collection`}
          target="_blank"
        >
          View your NFT now
          <SOpenLink className="fa-solid fa-arrow-up-right-from-square" size="sm" />
        </SLink>
      </div>
      <SClose onClick={onCloseSuccess}>
        <SCloseIcon className="fa-regular fa-xmark"/>
      </SClose>
    </SToastContainer>
  );
}

const SToastContainer = styled.div`
  position: fixed;
  width: 100%;
  max-width: 448px;
  z-index: 101;
  display: flex;
  background-color: ${({ theme }) => theme.Colors.gray1000};
  border-radius: 28px;
  align-items: center;
  padding: 24px;
  top: ${({ theme }) => theme.Spacing.regular};
  right: ${({ theme }) => theme.Spacing.regular};

  @keyframes fadeinRight {
    from { right: 0; opacity: 0; }
    to { right: ${({ theme }) => theme.Spacing.regular}; opacity: 100%; }
  }

  @keyframes fadeinTop {
    from { top: 0; opacity: 0; }
    to { top: ${({ theme }) => theme.Spacing.wide}; opacity: 100%; }
  }
`;

const STitle = styled(Text)`
  flex-grow: 1;
  color: ${({ theme }) => theme.Colors.gray0};
  margin-bottom: ${({ theme }) => theme.Spacing.tight};
`;

const SMessage = styled(STitle)`
  font-size: 14px;
`;

const SIcon = styled(Icon)<Pick<ICollectSuccess, 'iconColor'>>`
  margin-right: ${({ theme }) => theme.Spacing.tight};
  color: ${({ theme }) => theme.Colors.gray0};
  &.fa-check {
    color: ${({ theme }) => theme.Colors.mint600};
  }
`;

const SLink = styled.a`
  color: ${({ theme }) => theme.Colors.mint600};
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const SOpenLink = styled(Icon)`
  color: ${({ theme }) => theme.Colors.mint600};
  margin-left: ${({ theme }) => theme.Spacing.condensed};
`;

const SClose = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.Spacing.regular};
  right: ${({ theme }) => theme.Spacing.regular};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.Radius.rounded};
  width: 24px;
  height: 24px;
  background-color: ${({ theme }) => theme.Colors.gray900};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SCloseIcon = styled(Icon)`
`;

export default CollectSuccess;
