import React from 'react';
import styled, { css } from 'styled-components';

export type TSIconSize = 'sm' | 'df' | 'lg';

export interface IIcon extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Size of icon
   */
  size: TSIconSize;

  /**
   * Color of icon
   */
   color?: string;

  /**
   * If passed, styles the icon as clickable
   */
  clickable?: boolean;

  /**
   * Flag for styling clickable icon as disabled
   */
   disabled?: boolean;

   /**
   * Flag for allowing click when disabled
   */
   allowActionOnDisabled?: boolean;
}

export const Icon = ({
  allowActionOnDisabled,
  className,
  size,
  color,
  clickable,
  disabled,
  onClick,
  ...props
}: IIcon) => (
  <SIcon
    className={className}
    clickable={clickable}
    disabled={disabled}
    color={color}
    size={size}
    onClick={(e) => {
      if (disabled && !allowActionOnDisabled) return;
      if (onClick) onClick(e);
    }}
    {...props}
  />
);

Icon.defaultProps = {
  size: 'df',
};

const clickableStyle = css<Pick<IIcon, 'disabled' | 'color'>>`
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  color: ${({ theme, color }) => (color ?? theme.Colors.gray0)};
  opacity: ${({ disabled }) => disabled ? '.65' : '1'}
`;

const SIcon = styled.span<IIcon>`
  font-size: ${({ size }) => ({
    sm: '12px',
    df: '16px',
    lg: '24px',
  }[size])};
  color: ${({ color }) => color && color};
  ${({ clickable }) => clickable && clickableStyle};
`;
