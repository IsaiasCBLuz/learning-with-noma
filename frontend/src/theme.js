import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#4A5E3A',
      dark: '#2E3B24',
      light: '#6B7E59',
      contrastText: '#F5EFE4',
    },
    secondary: {
      main: '#C8881A',
      light: '#E5A82A',
      contrastText: '#F5EFE4',
    },
    background: {
      default: '#F5EFE4',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2E3B24',
      secondary: '#7A8A6A',
    },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500 },
    h2: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500 },
    h3: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500 },
    h4: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500 },
    h5: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500 },
    h6: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '100px',
          textTransform: 'none',
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 400,
          letterSpacing: '0.03em',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': { transform: 'translateY(-2px)' },
        },
        containedPrimary: {
          backgroundColor: '#4A5E3A',
          color: '#F5EFE4',
          '&:hover': { backgroundColor: '#2E3B24' },
        },
        outlinedPrimary: {
          borderColor: '#4A5E3A',
          color: '#4A5E3A',
          '&:hover': { backgroundColor: '#4A5E3A', color: '#F5EFE4' },
        },
        containedSecondary: {
          backgroundColor: '#C8881A',
          color: '#F5EFE4',
          '&:hover': { backgroundColor: '#E5A82A' },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#F5EFE4', color: '#2E3B24' },
      },
    },
  },
})

export default theme
