import { createGlobalStyle, css } from "styled-components";

const GlobalStyle = createGlobalStyle`${({ theme })=> css`
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .App {
    padding: 1rem 0.5rem;
    font-family: 'Roboto', sans-serif;
    background-color: ${theme.background};
  }
  input, textarea, button, select {
    font-family: 'Roboto', sans-serif;
  }
  .center-flex {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .flex-1 {
    flex: 1;
  }
  .text-center {
    text-align: center;
  }
  .group-field {
    display: flex;
    gap: 10px;
  }

  .w-40 {
    width: 40%;
  }
`}`

export default GlobalStyle;