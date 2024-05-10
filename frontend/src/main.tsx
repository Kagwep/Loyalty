import { UseInkathonProvider } from "@scio-labs/use-inkathon"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import { TooltipProvider } from "./components/ui/tooltip"
import { getDeployments } from "./deployments/deployments.ts"
import "./global.css"
import { Toaster } from "react-hot-toast"
import { BrowserRouter,Route,Routes } from 'react-router-dom'

const queryClient = new QueryClient()
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <UseInkathonProvider
              appName="link!"
              connectOnInit={false}
              defaultChain={import.meta.env.VITE_DEFAULT_CHAIN}
              deployments={Promise.resolve(getDeployments())}
            >
              <>
                <App />
                <Toaster position="top-center" reverseOrder={false} />
              </>
            </UseInkathonProvider>
          
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
