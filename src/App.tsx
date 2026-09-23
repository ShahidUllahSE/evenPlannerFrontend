import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import AppRouter from '@/routes/AppRouter';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { theme } from '@/styles/theme';

const App = () => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <AuthProvider>
      <DataProvider>
        <AppRouter />
      </DataProvider>
    </AuthProvider>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSizes.md,
          borderRadius: theme.radii.md,
          boxShadow: theme.shadows.md,
        },
        success: { iconTheme: { primary: theme.colors.primary, secondary: '#fff' } },
      }}
    />
  </ThemeProvider>
);

export default App;
