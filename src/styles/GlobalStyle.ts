import { createGlobalStyle, css } from "styled-components";

const GlobalStyle = createGlobalStyle`${({ theme })=> css`  
  main {
    padding: 1rem 0.5rem;
  }
  .App {
    font-family: 'Roboto', sans-serif;
    background-color: ${theme.background};
    width: 600px;
  }
  input, textarea, button, select {
    font-family: 'Roboto', sans-serif;
  }
`}`

export default GlobalStyle;