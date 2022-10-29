import React from 'react';
import styled, { css } from 'styled-components';
import { Text } from './Text';

export type TSInputVariants = 'title' | 'text';

export interface IInput extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Determines how to render the input (text size and interaction)
   */
  styleType: TSInputVariants;

  /**
   * Adds a subtitle beneath input.
   */
  subtitle?: string;

  /**
   * isError returns true if there is an error
  */
  isError?: boolean;

  /**
   * errorMessage contains message to be displayed if there is an error
   */
  errorMessage?: string;
}

export const Input = ({
  styleType,
  subtitle,
  isError,
  errorMessage,
  ...props
}: IInput) => {
  const getSubtitle = () => {
    if (isError) {
      return <SText className="error-message" styleType="smallText">{errorMessage}</SText>;
    }
    if (subtitle) {
      return <SText className="subtitle" styleType="smallText">{subtitle}</SText>;
    }
    return null;
  };

  return (
    <SInputWrapper>
      <SInput className="input" styleType={styleType} isError={isError} {...props} />
      { getSubtitle() }
    </SInputWrapper>
  );
};

const textStyle = css`
  ${({ theme }) => theme.Typography.textStyle};
  line-height: 100%;
  border-radius: ${({ theme }) => theme.Radius.md};
  padding: 12px ${({ theme }) => theme.Spacing.regular};
  height: 42px;
`;

const titleStyle = css`
  ${({ theme }) => theme.Typography.titleStyle};
  border: none;
  &:focus,
  &:hover {
    border: none;
  }
`;

const SInputWrapper = styled.div`
  width: 100%;
  position: relative;
  width: 100%;
`;

const SInput = styled.input<Pick<IInput, 'styleType' | 'isError'>>`
  width: 100%;
  border: 1px solid ${(props) => (props.isError ? props.theme.Colors.red600 : props.theme.Colors.gray500)};
  border-radius: ${({ theme }) => theme.Radius.md};
  background-color: ${({ theme }) => theme.Colors.gray1000};
  color: ${({ theme }) => theme.Colors.gray0};

  &::placeholder {
    color: ${({ theme }) => theme.Colors.gray200};
  }

  &:hover,
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.Colors.gray200};
  }

  &:disabled {
    color: ${({ theme }) => theme.Colors.gray200};
    opacity: 50%;
    pointer-events: none;
  }

  &:invalid {
    border: 1px solid ${({ theme }) => theme.Colors.red600};
  }

  ${({ styleType }) => ({
    text: textStyle,
    title: titleStyle,
  }[styleType])}
`;

const SText = styled(Text)`
  margin-top: ${({ theme }) => theme.Spacing.tight};
  &.error-message {
    color: ${({ theme }) => theme.Colors.red600};
  }
`;
