"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isIosDevice() {
  if (typeof window === "undefined") return false;

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    setIsInstalled(isStandalone());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowInstructions(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }

      setInstallPrompt(null);
      return;
    }

    setShowInstructions(true);
  }

  if (isInstalled) {
    return (
      <div className="install-app-status">
        <strong>HiLex este instalată</strong>
        <span>Poți deschide platforma direct din telefon, ca o aplicație.</span>
      </div>
    );
  }

  return (
    <div className="install-app-box">
      <button className="btn primary install-app-btn" onClick={installApp} type="button">
        Instalează aplicația HiLex
      </button>
      {showInstructions ? (
        <p className="install-app-help">
          {isIosDevice()
            ? "Pe iPhone, apasă Share în browser, apoi Add to Home Screen / Adaugă pe ecranul principal."
            : "Dacă nu apare fereastra de instalare, deschide meniul browserului și alege Install app / Add to Home screen."}
        </p>
      ) : (
        <p className="install-app-help">Adaugă HiLex pe telefon sau desktop și accesează platforma mai rapid.</p>
      )}
    </div>
  );
}
