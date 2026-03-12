import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    // Show a subtle toast notification when a new version is available
    const toast = document.createElement("div");
    toast.id = "pwa-update-toast";
    toast.innerHTML = `
      <span>🚀 New version available!</span>
      <button id="pwa-update-btn">Update</button>
      <button id="pwa-dismiss-btn">✕</button>
    `;

    Object.assign(toast.style, {
      position: "fixed",
      bottom: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#0d9488",
      color: "#ffffff",
      padding: "12px 20px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      zIndex: "9999",
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
      fontWeight: "500",
      animation: "pwa-slide-up 0.3s ease",
    });

    // Inject keyframe animation
    if (!document.getElementById("pwa-toast-style")) {
      const style = document.createElement("style");
      style.id = "pwa-toast-style";
      style.textContent = `
        @keyframes pwa-slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        #pwa-update-btn {
          background: #ffffff;
          color: #0d9488;
          border: none;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
        }
        #pwa-dismiss-btn {
          background: transparent;
          color: #ffffff;
          border: none;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          padding: 0 4px;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    document.getElementById("pwa-update-btn").addEventListener("click", () => {
      updateSW(true);
      toast.remove();
    });

    document.getElementById("pwa-dismiss-btn").addEventListener("click", () => {
      toast.remove();
    });
  },

  onOfflineReady() {
    console.log("[PWA] App is ready to work offline.");
  },
});
