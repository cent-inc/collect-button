import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';

export type TSTextVariants = 'bigTitle' | 'title' | 'headerOne' | 'headerTwo' | 'headerThree' | 'text' | 'fieldLabel' | 'smallText' | 'error';

export interface IText extends React.HTMLAttributes<HTMLDivElement> {
  // children displayed within text component
  children: ReactNode;

  // determines type of text component
  styleType: TSTextVariants;
}

export const Text = ({
  children,
  ...props
}: IText) => <SText {...props}>{children}</SText>;

export const bigTitleStyle = css`
  ${({ theme }) => theme.Typography.bigTitleStyle};
  color: ${({ theme }) => theme.Colors.gray0};
`;

export const titleStyle = css`
  ${({ theme }) => theme.Typography.titleStyle};
  color: ${({ theme }) => theme.Colors.gray0};
`;

export const headerOneStyle = css`
  ${({ theme }) => theme.Typography.headerOneStyle};
  color: ${({ theme }) => theme.Colors.gray0};
`;

export const headerTwoStyle = css`
  ${({ theme }) => theme.Typography.headerTwoStyle};
  color: ${({ theme }) => theme.Colors.gray0};
`;

export const headerThreeStyle = css`
  ${({ theme }) => theme.Typography.headerThreeStyle};
  color: ${({ theme }) => theme.Colors.gray0};
`;

export const textStyle = css`
  ${({ theme }) => theme.Typography.textStyle};
  color: ${({ theme }) => theme.Colors.gray0};
`;

export const fieldLabelStyle = css`
  ${({ theme }) => theme.Typography.fieldLabelStyle};
  color: ${({ theme }) => theme.Colors.gray100};
`;

export const smallTextStyle = css`
  ${({ theme }) => theme.Typography.smallTextStyle};
  color: ${({ theme }) => theme.Colors.gray100};
`;

const errorTextStyle = css`
  ${({ theme }) => theme.Typography.errorTextStyle};
  color: ${({ theme }) => theme.Colors.red600};
`;

const SText = styled.div<IText>`
  ${({ styleType }) => ({
    bigTitle: bigTitleStyle,
    title: titleStyle,
    headerOne: headerOneStyle,
    headerTwo: headerTwoStyle,
    headerThree: headerThreeStyle,
    text: textStyle,
    fieldLabel: fieldLabelStyle,
    smallText: smallTextStyle,
    error: errorTextStyle,
  })[styleType]}
`;
