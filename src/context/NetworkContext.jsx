import { createContext, useContext, useState, useEffect } from "react";
import { indexedDBService } from "../services/indexedDBService";
import { syncEngine } from "../services/syncEngine";
import toast from "react-hot-toast";

const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Ping check to confirm true backend reachability
  const checkReachability = async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }
    try {
      // Small fast HEAD/GET request to a static file or ping route
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch("/favicon.svg", {
        method: "HEAD",
        signal: controller.signal
      });
      clearTimeout(id);
      setIsOnline(response.ok);
    } catch (e) {
      setIsOnline(false);
    }
  };

  const updatePendingCount = async () => {
    const queue = await indexedDBService.getSyncQueue();
    const pending = queue.filter(op => op.syncStatus === "PENDING_SYNC" || op.syncStatus === "SYNC_FAILED").length;
    setPendingCount(pending);
  };

  useEffect(() => {
    const handleOnline = () => {
      checkReachability();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    checkReachability();
    updatePendingCount();

    // Periodic ping and sync queue size audit (every 10 seconds)
    const interval = setInterval(() => {
      checkReachability();
      updatePendingCount();
    }, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Automatic synchronization trigger when transition back to online occurs
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !syncing) {
      triggerSync();
    }
  }, [isOnline, pendingCount]);

  const triggerSync = async () => {
    if (syncing) return;
    if (!isOnline) {
      toast.error("You are currently offline. Synchronization will start when the connection is restored.");
      return;
    }
    setSyncing(true);
    try {
      await syncEngine.syncQueue((progressMsg) => {
        // Option to display toast progress
      });
      await updatePendingCount();
    } catch (e) {
      console.error("Auto sync failed:", e);
    } finally {
      setSyncing(false);
    }
  };

  const value = {
    isOnline,
    syncing,
    pendingCount,
    triggerSync,
    updatePendingCount
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}

      {/* Global floating offline banner */}
      {!isOnline && (
        <div 
          className="fixed top-14 left-0 right-0 z-50 bg-red-600 text-white py-1.5 px-4 text-center text-xs font-semibold shadow-md flex items-center justify-center gap-2 select-none animate-[slideDown_200ms_ease]"
          role="alert"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>🔴 OFFLINE MODE — Your inspection data is saved locally and will auto-sync when connection is restored.</span>
        </div>
      )}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}
