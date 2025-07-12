import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import Dashboard from "./components/Dashboard";
import Chatbot from "./components/Chatbot";
import WalletStatus from "./components/WalletStatus";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="sticky top-0 z-50 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Agent Payment Rails
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Authenticated>
              <WalletStatus />
              <SignOutButton />
            </Authenticated>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Authenticated>
          <Dashboard />
          <Chatbot />
        </Authenticated>
        
        <Unauthenticated>
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="max-w-md w-full">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Welcome to the Future
                </h2>
                <p className="text-gray-400 text-lg">
                  Decentralized payment infrastructure for autonomous AI agents
                </p>
              </div>
              <SignInForm />
            </div>
          </div>
        </Unauthenticated>
      </main>
      
      <Toaster theme="dark" />
    </div>
  );
}
