import { ThemeProvider } from "@/components/ui/theme-provider";
import { RootLayout } from "./layout";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RootLayout />
    </ThemeProvider>
  );
};

export default App;
