import { QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline, StyledEngineProvider, ThemeProvider } from "@mui/material";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from './Router'
import Router from "./Router";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StyledEngineProvider injectFirst>
          <CssBaseline />
          <ReactQueryDevtools />
          <Router />
      </StyledEngineProvider>
    </QueryClientProvider>
  );
}

export default App;
