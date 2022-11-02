import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { Icon } from './Icon';

export type TSButtonVariants = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'primaryBlue' | 'custom';

export interface IButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  /**
   * Child components rendered within the button
   */
  children: ReactNode

  /**
   * Defines which variant of button this is
   */
  styleType: TSButtonVariants

  /**
   * Disables button
   */
  disabled?: boolean

  /**
   * Sets loading state for button
   */
  loading?: boolean

  /**
   * Sets success state for button
   */
  success?: boolean

  /**
   * Defines if an icon is displayed in the btn
   */
  iconClassName?: string

  /**
   * Defines where the icon is placed
   */
  iconFirst?: boolean

  /**
   * if passed, button will act as a link pointing to this url
   */
  url?: string

  /**
   * If passed, color the button accordingly
   */
  backgroundColor?: string

  /**
   * If passed, color the text and icon accordingly
   */
  textColor?: string

  /**
   * Provides custom styling for buttons
   */
  className?: string
}

export const Button = (
  {
    children,
    styleType,
    disabled,
    loading,
    success,
    iconClassName,
    iconFirst,
    backgroundColor,
    textColor,
    url,
    className,
    ...props
  }: IButtonProps,
) => {
  const getIcon = () => {
    if (success) {
      return <SIcon className="fas fa-check" size="df" iconFirst={iconFirst} />;
    }
    if (loading) {
      return <SIcon className="fa-solid fa-spinner-third fa-spin" size="df" iconFirst={iconFirst} />;
    }
    if (iconClassName) {
      return <SIcon className={iconClassName} size="df" iconFirst={iconFirst} />;
    }
    return null;
  };

  const buttonComponent = (
    <SButton
      disabled={disabled}
      loading={loading}
      styleType={styleType}
      backgroundColor={backgroundColor}
      textColor={textColor}
      className={className}
      {...props}
    >
      {iconFirst && getIcon()}
      <SText>
        {children}
      </SText>
      {!iconFirst && getIcon()}
    </SButton>
  );

  return url ? (
    <SLink href={url} target="_blank" rel="noreferrer">
      {buttonComponent}
    </SLink>
  ) : buttonComponent;
};

const primaryButtonStyle = css`
  background-color: ${({ theme }) => theme.Colors.mint600};
  color: ${({ theme }) => theme.Colors.gray1000};
  &:hover {
    background-color: ${({ theme }) => theme.Colors.mint500};
    &:disabled {
      background-color: ${({ theme }) => theme.Colors.mint600};
    }
  }
`;

const secondaryButtonStyle = css`
  background-color: ${({ theme }) => theme.Colors.gray700};
  border: ${({ theme }) => theme.Effects.border};
  &:hover {
    background-color: ${({ theme }) => theme.Colors.gray600};
    &:disabled {
      background-color: ${({ theme }) => theme.Colors.gray700};
    }
  }
`;

const tertiaryButtonStyle = css<Pick<IButtonProps, 'backgroundColor' | 'textColor'>>`
  background-color: transparent;
`;

const dangerButtonStyle = css<Pick<IButtonProps, 'textColor'>>`
  background-color: transparent;
  color: ${({ theme }) => theme.Colors.red600};
  border: 1px solid ${({ theme }) => theme.Colors.red600};
  &:hover {
    background-color: rgba(210, 66, 66, .1);
  }
`;

const loadingButtonStyle = css`
  cursor: default;
  drop-shadow: none;
  box-shadow: none;
  pointer-events: none;
`;

const primaryBlueButtonStyle = css<Pick<IButtonProps, 'textColor'>>`
  background-color: ${({ theme }) => theme.Colors.blue600};
  color: ${({ theme, textColor }) => (textColor || theme.Colors.gray0)};
  border: none;
  &:hover {
    background-color: ${({ theme }) => theme.Colors.blue500};
    &:disabled {
      background-color: ${({ theme }) => theme.Colors.blue600};
    }
  }
`;

const customButtonStyle = css<Pick<IButtonProps, 'backgroundColor' | 'textColor'>>`
  color: ${({ textColor }) => textColor};
  background-color: ${({ backgroundColor }) => backgroundColor};
  &:hover {
    filter: brightness(120%);
    &:disabled {
      filter: none;
    }
  }
`;

const SText = styled.div`
  ${({ theme }) => theme.Typography.headerThreeStyle};
  line-height: 100%;
`;

const SIcon = styled(Icon)<Pick<IButtonProps, 'iconFirst'>>`
  ${({ theme, iconFirst }) => (iconFirst ? `margin-right: ${theme.Spacing.regular}` : `margin-left: ${theme.Spacing.regular}`)};
`;

const SButton = styled.button<Pick<IButtonProps, 'styleType' | 'loading' | 'backgroundColor' | 'textColor'>>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.Radius.md};
  cursor: pointer;
  outline: none;
  padding: ${({ theme }) => theme.Spacing.tight} ${({ theme }) => theme.Spacing.regular};
  cursor: pointer;
  color: ${({ theme }) => theme.Colors.gray0};
  height: 42px;
  transition-duration: 100ms;

  // Styling for button type
  ${({ styleType }) => ({
    primary: primaryButtonStyle,
    secondary: secondaryButtonStyle,
    tertiary: tertiaryButtonStyle,
    danger: dangerButtonStyle,
    primaryBlue: primaryBlueButtonStyle,
    custom: customButtonStyle,
  }[styleType])}

  // Styling for disabled button
  &:disabled {
    opacity: 50%;
    cursor: default;
    drop-shadow: none;
    box-shadow: none;
  }

  // Styling when button is in loading state
  ${({ loading }) => (loading ? loadingButtonStyle : '')};

`;

const SLink = styled.a`
  text-decoration: none;
`;
