import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body,
  #root {
    min-height: 100%;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.md};
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4 {
    line-height: 1.25;
    font-weight: 600;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font: inherit;
    cursor: pointer;
    border: none;
    background: none;
    color: inherit;
  }

  input, select, textarea {
    font: inherit;
    color: inherit;
  }

  img {
    max-width: 100%;
    display: block;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.borderStrong};
    border-radius: 8px;
  }
`;
