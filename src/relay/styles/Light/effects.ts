/* eslint-disable import/prefer-default-export */
import { css } from 'styled-components';

export const Effects = {
  border: '1px solid rgba(128, 128, 128, 0.65)',
  borderLight: '0.5px solid rgba(128, 128, 128, 0.65)',
  hover: css`
    box-shadow: 0px 0px 4px 1px rgba(238, 238, 238, .65);
  `,
  dropShadow: css`
    box-shadow: 4px 0px 8px rgba(175, 175, 175, 0.65);
  `,
};
