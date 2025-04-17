"use client";

import { useEffect, useState } from "react";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { AskAgentButton, Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { QueryProvider } from "~~/components/providers/QueryProvider";
import { WalletProvider } from "~~/components/providers/WalletProvider";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-screen w-screen flex justify-center items-center">{/* Loading UI */}</div>;
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="relative flex flex-col flex-1">
          {children}
        </main>
        <Footer />
      
      </div>
      <Toaster toastOptions={{ duration: 7000 }} position="top-right" />
      <ProgressBar
        height="4px"
        color={resolvedTheme === "dark" ? "#8B5CF6" : "#6366F1"}
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
};

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <WalletProvider>
        <ScaffoldEthApp>{children}</ScaffoldEthApp>
      </WalletProvider>
    </QueryProvider>
  );
};