import { ThemeOptions, createTheme } from '@mui/material/styles/';
// https://highlightjs.tiddlyhost.com/
const themeOptions: ThemeOptions = {
    palette: {
        mode: 'dark',
        primary: {
            main: '#4587a4',
            contrastText: '#fafafa',
        },
        info: {
            main: '#148acc',
            contrastText: '#fff',
        },
        secondary: {
            main: '#4dd856',
        },
        background: {
            default: '#161d3a',
            paper: '#163754',
        },
        warning: {
            main: '#ff9800'
        },
        error: {
            main: '#f44336'
        }
    },
};

export const theme = createTheme(themeOptions);