import { css } from 'styled-components';

const primaryFont = 'Helvetica';

const baseTextStyle = css`
  font-family: ${primaryFont};
  font-weight: 500;
`;

const boldTextStyle = css`
  ${baseTextStyle};
  font-weight: 700;
`;

const Typography = {
  primaryFont,

  bigTitleStyle: css`
    ${boldTextStyle};
    font-size: 48px;
  `,

  titleStyle: css`
    ${boldTextStyle};
    font-size: 28px;
  `,

  headerOneStyle: css`
    ${boldTextStyle};
    font-size: 24px;
  `,

  headerTwoStyle: css`
    ${boldTextStyle};
    font-size: 20px;
  `,

  headerThreeStyle: css`
    ${boldTextStyle};
    font-size: 18px;
    line-height: 150%;
  `,

  textStyle: css`
    ${baseTextStyle};
    font-size: 18px;
    line-height: 150%;
  `,

  fieldLabelStyle: css`
    ${baseTextStyle};
    font-size: 16px;
  `,

  smallTextStyle: css`
    ${boldTextStyle};
    font-size: 12px;
    text-transform: uppercase;
  `,

  errorTextStyle: css`
    ${baseTextStyle};
    font-size: 16px;
  `,
};

export default Typography;
