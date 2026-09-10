export interface PwaRegistrationEnvironment {
  serviceWorkerSupported: boolean;
  protocol: string;
  hostname: string;
}

export interface StudentPwaRegistrationHooks {
  onReady?: (registration: ServiceWorkerRegistration) => void;
  onUpdateAvailable?: (registration: ServiceWorkerRegistration) => void;
}

export function canRegisterStudentPwa(environment: PwaRegistrationEnvironment): boolean {
  if (!environment.serviceWorkerSupported) return false;
  if (environment.protocol === "https:") return true;
  return environment.hostname === "localhost" || environment.hostname === "127.0.0.1";
}

export async function registerStudentServiceWorker(
  hooks: StudentPwaRegistrationHooks = {},
): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || typeof navigator === "undefined") return null;

  const environment: PwaRegistrationEnvironment = {
    serviceWorkerSupported: "serviceWorker" in navigator,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
  };
  if (!canRegisterStudentPwa(environment)) return null;

  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

  const reportWaitingUpdate = () => {
    if (registration.waiting && navigator.serviceWorker.controller) {
      hooks.onUpdateAvailable?.(registration);
    }
  };

  reportWaitingUpdate();
  registration.addEventListener("updatefound", () => {
    const installing = registration.installing;
    if (!installing) return;
    installing.addEventListener("statechange", () => {
      if (installing.state === "installed" && navigator.serviceWorker.controller) {
        hooks.onUpdateAvailable?.(registration);
      }
    });
  });

  hooks.onReady?.(registration);
  return registration;
}

export function activateWaitingServiceWorker(registration: ServiceWorkerRegistration): boolean {
  if (!registration.waiting) return false;
  registration.waiting.postMessage({ type: "SKIP_WAITING" });
  return true;
}
