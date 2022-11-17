import React, { ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import {
  Text,
  Icon,
  Button,
  TSButtonVariants,
} from './';

export type TModalSecondaryActionProps = {
  /**
   * Button OnClick handler
   */
  onClickCallback: () => void,

  /**
   * Button label
   */
  label: string,

  /**
   * If passed determines the style type of the secondary action
   */
   styleType?: TSButtonVariants,

   icon?: string,
}

export interface IModal extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Child components displayed in modal
   */
  children: ReactNode;

  /**
   * Indicates whether or not the modal is presented
   */
  presented: Boolean;

  /**
   * Title shown in upper left of modal
   */
  title?: string;
  /**
   * Text for on close secondary action button
   */
  cancelLabel?: string;

  /**
   * Text for primary confirm action button
   */
  confirmLabel?: string;

  /**
   * Definition for confirm action button type
   */
  confirmButtonType?: TSButtonVariants;

  /**
   * Function called on confirm click
   */
  onConfirm?: () => void;

  /**
   * Text for secondary button
   */
  secondaryActions?: TModalSecondaryActionProps[];

  /**
   * Icon for primary icon
   */
   confirmIcon?: string;

  /**
   * Callback function when modal is closed
   */
  onClose: () => void;
  loading?: boolean;
  containerClassname?: string;
  disabled?: boolean;
  /**
   * prevent modal from closing unless cancel / close clicked
   */
  preventCloseOnClick?: boolean;
  /**
   * hide footer action bar
   */
  hideButtons?: boolean;
}

export const Modal = ({
  children,
  cancelLabel,
  disabled,
  presented,
  preventCloseOnClick,
  title,
  confirmLabel,
  confirmButtonType,
  containerClassname,
  onConfirm,
  loading,
  hideButtons,
  secondaryActions,
  onClose,
  confirmIcon,
  ...props
}: IModal) => {
  const closeHandler = () => {
    if (!loading) onClose();
  };

  const escapeHandler = (e: any) => {
    if (e.key === 'Escape') {
      closeHandler();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', escapeHandler);
    document.body.style.overflow = presented ? 'hidden' : 'unset';

    return () => {
      document.removeEventListener('keydown', escapeHandler);
    };
  }, [escapeHandler, presented]);

  return (
    <SModalWrapper hidden={!presented} {...props}>
      <SModalBackground
        onClick={!preventCloseOnClick && closeHandler}
      />
      <SModalContainer className={containerClassname}>
        <SClose disabled={loading} className="fas fa-times" size="df" onClick={closeHandler} />
        {
          title &&
          <STitle styleType="headerTwo">{title}</STitle>
        }
        <SModalBody>
          {children}
        </SModalBody>
        {
          hideButtons
            ? null
            : (
              <SButtonsContainer>
                {
                  secondaryActions
                    && secondaryActions.map((actionProps) => (
                      <Button
                        key={`modal-secondary-action-${actionProps.label}`}
                        styleType={actionProps.styleType ?? 'secondary'}
                        onClick={actionProps.onClickCallback}
                        disabled={loading}
                      >
                        {actionProps.label}
                      </Button>
                    ))
                }
                {
                  cancelLabel
                    && (
                      <Button
                        styleType="secondary"
                        className="modal-close-btn"
                        disabled={loading}
                        onClick={onClose}
                      >
                        {cancelLabel}
                      </Button>
                    )
                }
                {
                  confirmLabel
                    && (
                      <Button
                        styleType={confirmButtonType ?? 'primary'}
                        className="modal-primary-btn"
                        iconClassName={confirmIcon}
                        disabled={disabled}
                        loading={loading}
                        onClick={onConfirm}
                      >
                        {confirmLabel}
                      </Button>
                    )
                }
              </SButtonsContainer>
            )
        }
      </SModalContainer>
    </SModalWrapper>
  );
};

export const SModalWrapper = styled.div`
  position: fixed;
  height: 100%;
  z-index: 1000;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
`;

export const SModalBackground = styled(SModalWrapper)`
  opacity: 90%;
  background-color: ${({ theme }) => theme.Colors.gray1000};
`;

  // border: ${({ theme }) => theme.Effects.border};
export const SModalContainer = styled.div`
  background-color: ${({ theme }) => theme.Colors.gray1000};
  box-shadow: 0 12px 56px rgb(119 118 122 / 25%);
  position: absolute;
  z-index: 1100;
  top: ${({ theme }) => theme.Spacing.widest};
  left: 50%;
  transform: translateX(-50%);
  border-radius: ${({ theme }) => theme.Radius.md};
  padding: 48px 48px 24px;
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 160px);
  @media (max-width: ${({ theme }) => theme.Spacing.smallFormatMax}) {
    width: 100%;
    padding: ${({ theme }) => theme.Spacing.wide};
    bottom: 0;
    top: auto;
    border-bottom-left-radius: unset;
    border-bottom-right-radius: unset;
  }
  @media (min-width: ${({ theme }) => theme.Spacing.desktopMin}) {
    width: ${({ theme }) => theme.Spacing.modalWidth};
  }
  @media (max-height: ${({ theme }) => theme.Spacing.heightMin}) {
    top: ${({ theme }) => theme.Spacing.wide};
    max-height: calc(100% - ${({ theme }) => theme.Spacing.wider});
  }
`;

export const SModalBody = styled.div`
  overflow-y: auto;
`;

export const SClose = styled(Icon)`
  color: ${({ theme }) => theme.Colors.gray0};
  position: absolute;
  top: ${({ theme }) => theme.Spacing.regular};
  right: ${({ theme }) => theme.Spacing.regular};
  cursor: pointer;
  font-size: 16px;
`;

export const STitle = styled(Text)`
  margin-bottom: ${({ theme }) => theme.Spacing.regular};
`;

const SButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: ${({ theme }) => theme.Spacing.regular};
  justify-content: flex-end;
  gap: ${({ theme }) => theme.Spacing.regular};
`;
