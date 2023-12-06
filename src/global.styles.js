import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
    html, body {
        display: flex;
        font-family: 'Roboto', sans-serif;
        font-size: 1rem;
        width: 100%;
        margin: 0;
        padding: 0;
        scroll-behavior: smooth;
    }
    h1, h2, h3, h4, h5, h6 {
        font-family: Anton;
    }
    #root {
        display: flex;
        flex: 1;
        width: 100%;
    }
`;
