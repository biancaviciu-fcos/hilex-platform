"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISSED_KEY = "hilex_install_modal_dismissed";

function isIosDevice() {
  if (typeof window === "undefined") return false;

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function HomeInstallAppModal() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (isStandalone() || window.sessionStorage.getItem(DISMISSED_KEY) === "true") return;

    const timer = window.setTimeout(() => setIsVisible(true), 900);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => closeModal();

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  function closeModal() {
    window.sessionStorage.setItem(DISMISSED_KEY, "true");
    setIsVisible(false);
  }

  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      closeModal();
      return;
    }

    setShowInstructions(true);
  }

  if (!isVisible) return null;

  return (
    <div className="home-install-overlay" role="dialog" aria-modal="true" aria-labelledby="home-install-title">
      <div className="home-install-modal">
        <button className="home-install-close" onClick={closeModal} type="button" aria-label="Închide pop-up-ul">
          ×
        </button>

        <div className="home-install-copy">
          <img className="home-install-icon" src="/icons/app-icon.png" alt="" />
          <h2 id="home-install-title">
            Salvează <span>HiLex</span>
            <br />
            pe ecranul tău
          </h2>
          <div className="home-install-mark" aria-hidden="true" />
          <p>Adaugă HiLex pe ecranul principal pentru acces rapid și o experiență ca într-o aplicație.</p>

          <div className="home-install-benefits">
            <div>
              <span aria-hidden="true">↯</span>
              <strong>Acces instant</strong>
              <p>Deschide HiLex cu un singur tap.</p>
            </div>
            <div>
              <span aria-hidden="true">□</span>
              <strong>Sigur și privat</strong>
              <p>Datele tale sunt mereu protejate.</p>
            </div>
            <div>
              <span aria-hidden="true">▯</span>
              <strong>Experiență ca o aplicație</strong>
              <p>Fără bara de browser, fără distrageri.</p>
            </div>
          </div>

          <button className="home-install-cta" onClick={installApp} type="button">
            <span aria-hidden="true">⇧</span>
            Salvează aplicația
          </button>
          <p className="home-install-secure">100% sigur. Nu îți accesăm datele personale.</p>
          {showInstructions ? (
            <p className="home-install-instructions">
              {isIosDevice()
                ? "Pe iPhone, apasă Share în browser, apoi Add to Home Screen / Adaugă pe ecranul principal."
                : "Dacă nu apare fereastra de instalare, deschide meniul browserului și alege Install app / Add to Home screen."}
            </p>
          ) : null}
        </div>

        <div className="home-install-phone" aria-hidden="true">
          <div className="home-install-phone-frame">
            <div className="home-install-phone-screen">
              <div className="home-install-phone-status">
                <span>9:41</span>
                <span>▮▮ ))) ▱</span>
              </div>
              <div className="home-install-phone-app">
                <img src="/icons/app-icon.png" alt="" />
                <span>HiLex</span>
              </div>
              <p>Acces rapid,<br />oriunde te-ai afla.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
