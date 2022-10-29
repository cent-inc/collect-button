/* eslint-disable import/prefer-default-export */
import { css } from 'styled-components';
import { Colors } from './colors';

export const Effects = {
  border: `1px solid ${Colors.gray500}`,
  borderLight: `0.5px solid ${Colors.gray600}`,
  hover: css`
    box-shadow: 0px 0px 4px 1px rgba(238, 238, 238, .65);
  `,
  dropShadow: css`
    box-shadow: 4px 4px 8px rgba(16, 16, 16, 0.65);
  `,
};
