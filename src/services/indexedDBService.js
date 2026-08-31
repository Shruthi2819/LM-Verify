const DB_NAME = "LMVerifyOfflineDB";
const DB_VERSION = 1;

export const indexedDBService = {
  db: null,

  async openDB() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 1. inspections store
        if (!db.objectStoreNames.contains("inspections")) {
          db.createObjectStore("inspections", { keyPath: "inspectionId" });
        }
        
        // 2. sync_queue store
        if (!db.objectStoreNames.contains("sync_queue")) {
          db.createObjectStore("sync_queue", { keyPath: "operationId" });
        }

        // 3. evidence store
        if (!db.objectStoreNames.contains("evidence")) {
          db.createObjectStore("evidence", { keyPath: "evidenceId" });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(new Error(`Failed to open IndexedDB: ${event.target.error?.message}`));
      };
    });
  },

  async getStore(storeName, mode = "readonly") {
    const db = await this.openDB();
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  },

  // --- Inspections ---
  async saveInspection(inspection) {
    try {
      const store = await this.getStore("inspections", "readwrite");
      const record = {
        ...inspection,
        inspectionId: inspection.inspectionId || inspection.id,
        id: inspection.id || inspection.inspectionId
      };
      return new Promise((resolve) => {
        const request = store.put(record);
        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          console.warn("IndexedDB saveInspection error", request.error);
          resolve(false);
        };
      });
    } catch (e) {
      console.warn("IndexedDB saveInspection failed", e);
      return false;
    }
  },

  async getInspection(inspectionId) {
    try {
      const store = await this.getStore("inspections", "readonly");
      return new Promise((resolve) => {
        const request = store.get(inspectionId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
    } catch (e) {
      console.warn("IndexedDB getInspection failed", e);
      return null;
    }
  },

  async getAllInspections() {
    try {
      const store = await this.getStore("inspections", "readonly");
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (e) {
      console.warn("IndexedDB getAllInspections failed", e);
      return [];
    }
  },

  async deleteInspection(inspectionId) {
    try {
      const store = await this.getStore("inspections", "readwrite");
      return new Promise((resolve) => {
        const request = store.delete(inspectionId);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch (e) {
      console.warn("IndexedDB deleteInspection failed", e);
      return false;
    }
  },

  // --- Sync Queue ---
  async addToSyncQueue(operation) {
    try {
      const store = await this.getStore("sync_queue", "readwrite");
      const record = {
        ...operation,
        operationId: operation.operationId || operation.id || `OP-${Date.now()}`
      };
      return new Promise((resolve) => {
        const request = store.put(record);
        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          console.warn("IndexedDB addToSyncQueue error", request.error);
          resolve(false);
        };
      });
    } catch (e) {
      console.warn("IndexedDB addToSyncQueue failed", e);
      return false;
    }
  },

  async getSyncQueue() {
    try {
      const store = await this.getStore("sync_queue", "readonly");
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (e) {
      console.warn("IndexedDB getSyncQueue failed", e);
      return [];
    }
  },

  async deleteSyncOperation(operationId) {
    try {
      const store = await this.getStore("sync_queue", "readwrite");
      return new Promise((resolve) => {
        const request = store.delete(operationId);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch (e) {
      console.warn("IndexedDB deleteSyncOperation failed", e);
      return false;
    }
  },

  // --- Evidence files ---
  async saveEvidence(evidenceId, fileBlob, metadata = {}) {
    try {
      const store = await this.getStore("evidence", "readwrite");
      const record = {
        evidenceId,
        blob: fileBlob,
        name: fileBlob.name || "evidence.jpg",
        type: fileBlob.type,
        size: fileBlob.size,
        ...metadata
      };
      return new Promise((resolve, reject) => {
        const request = store.put(record);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error("IndexedDB saveEvidence failed", e);
      throw new Error("Unable to save photo locally. Device storage may be full.");
    }
  },

  async getEvidence(evidenceId) {
    try {
      const store = await this.getStore("evidence", "readonly");
      return new Promise((resolve, reject) => {
        const request = store.get(evidenceId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error("IndexedDB getEvidence failed", e);
      return null;
    }
  },

  async deleteEvidence(evidenceId) {
    try {
      const store = await this.getStore("evidence", "readwrite");
      return new Promise((resolve, reject) => {
        const request = store.delete(evidenceId);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error("IndexedDB deleteEvidence failed", e);
      throw e;
    }
  }
};
export default indexedDBService;
