import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NetworkProvider } from "./context/NetworkContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NetworkProvider>
            <AppRoutes />
          </NetworkProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1e293b",
                color: "#f8fafc",
                fontSize: "13px",
                borderRadius: "8px",
                padding: "10px 14px",
              },
              success: {
                iconTheme: { primary: "#22c55e", secondary: "#f8fafc" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#f8fafc" },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
