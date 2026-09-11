import { describe, expect, it, vi } from "vitest";
import { activateWaitingServiceWorker, canRegisterStudentPwa } from "./pwa";

describe("Student PWA registration policy", () => {
  it("allows HTTPS and local development but rejects insecure remote origins", () => {
    expect(
      canRegisterStudentPwa({ serviceWorkerSupported: true, protocol: "https:", hostname: "student.example.test" }),
    ).toBe(true);
    expect(
      canRegisterStudentPwa({ serviceWorkerSupported: true, protocol: "http:", hostname: "localhost" }),
    ).toBe(true);
    expect(
      canRegisterStudentPwa({ serviceWorkerSupported: true, protocol: "http:", hostname: "127.0.0.1" }),
    ).toBe(true);
    expect(
      canRegisterStudentPwa({ serviceWorkerSupported: true, protocol: "http:", hostname: "student.example.test" }),
    ).toBe(false);
    expect(
      canRegisterStudentPwa({ serviceWorkerSupported: false, protocol: "https:", hostname: "student.example.test" }),
    ).toBe(false);
  });

  it("activates only an explicitly waiting worker", () => {
    const postMessage = vi.fn();
    const registration = {
      waiting: { postMessage },
    } as unknown as ServiceWorkerRegistration;

    expect(activateWaitingServiceWorker(registration)).toBe(true);
    expect(postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });

    const currentRegistration = { waiting: null } as unknown as ServiceWorkerRegistration;
    expect(activateWaitingServiceWorker(currentRegistration)).toBe(false);
  });
});
