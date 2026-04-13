"use client";

import { useEffect, useRef, useState } from "react";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdConfiguration = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  ux_mode?: "popup" | "redirect";
  cancel_on_tap_outside?: boolean;
  use_fedcm_for_prompt?: boolean;
  use_fedcm_for_button?: boolean;
};

type GoogleButtonConfiguration = {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: number;
  logo_alignment?: "left" | "center";
  locale?: string;
};

interface GoogleAccountsId {
  initialize(configuration: GoogleIdConfiguration): void;
  renderButton(target: HTMLElement, options: GoogleButtonConfiguration): void;
  cancel(): void;
}

type GoogleWindow = Window & {
  google?: {
    accounts?: {
      id?: GoogleAccountsId;
    };
  };
};

let googleIdentityScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  const currentWindow = window as GoogleWindow;
  if (currentWindow.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleIdentityScriptPromise) {
    return googleIdentityScriptPromise;
  }

  googleIdentityScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById("google-identity-services") as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Không tải được Google Identity script.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "google-identity-services";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Không tải được Google Identity script."));
    document.head.appendChild(script);
  });

  return googleIdentityScriptPromise;
}

type GoogleLoginButtonProps = {
  clientId: string;
  disabled?: boolean;
  onCredential: (idToken: string) => void;
  onError?: (message: string) => void;
};

export function GoogleLoginButton({ clientId, disabled = false, onCredential, onError }: GoogleLoginButtonProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const missingClientIdMessage = "Thiếu cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID.";

  useEffect(() => {
    if (!clientId) {
      return;
    }

    let cancelled = false;

    void loadGoogleIdentityScript()
      .then(() => {
        if (cancelled) {
          return;
        }

        const currentWindow = window as GoogleWindow;
        const googleId = currentWindow.google?.accounts?.id;
        if (!googleId || !hostRef.current) {
          setInitError("Không khởi tạo được Google Sign-In.");
          onError?.("Không khởi tạo được Google Sign-In.");
          return;
        }

        googleId.initialize({
          client_id: clientId,
          ux_mode: "popup",
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
          use_fedcm_for_button: false,
          callback: (response) => {
            const credential = response.credential;
            if (!credential) {
              onError?.("Google không trả về ID token hợp lệ.");
              return;
            }
            onCredential(credential);
          },
        });

        hostRef.current.innerHTML = "";
        const width = Math.max(220, Math.min(380, hostRef.current.offsetWidth || 320));
        googleId.renderButton(hostRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "signin_with",
          logo_alignment: "left",
          locale: "vi",
          width,
        });

        setInitError(null);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : "Không tải được Google Sign-In.";
        setInitError(message);
        onError?.(message);
      });

    return () => {
      cancelled = true;
      const currentWindow = window as GoogleWindow;
      currentWindow.google?.accounts?.id?.cancel();
    };
  }, [clientId, onCredential, onError]);

  const visibleError = !clientId ? missingClientIdMessage : initError;

  return (
    <div className="space-y-2">
      <div className={disabled ? "pointer-events-none opacity-60" : ""}>
        <div ref={hostRef} className="flex min-h-11 items-center justify-center" />
      </div>
      {visibleError ? <p className="text-xs text-rose-500">{visibleError}</p> : null}
    </div>
  );
}
