export class IndexedDBManager {
    constructor(dbName, storeName) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
    }

    init(version = 1) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, version);

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                if (!this.db.objectStoreNames.contains(this.storeName)) {
                    this.db.createObjectStore(this.storeName, { keyPath: "id", autoIncrement: true });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    add(data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.add(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    get(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    update(data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    delete(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    getAll() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            request.onsuccess = () => {
                // Sort the results in descending order
                const sortedResult = request.result.sort((a, b) => b.id - a.id); // Replace 'id' with your sorting property
                resolve(sortedResult);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Export data from IndexedDB to CSV
    async exportToCSV() {
        try {
            const data = await this.getAll();  // Wait for the promise to resolve

            // Check if there is data
            if (data.length === 0) {
                return;
            }

            // Convert to CSV format
            const headers = Object.keys(data[0]);
            const rows = data.map(item => {
                return headers.map(header => `"${item[header]}"`).join(',');
            });

            // Prepare CSV string
            const csvContent = [headers.join(','), ...rows].join('\n');

            // Create a Blob from the CSV string
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${this.storeName}_data_PWA-Gym.csv`;
            link.click();

            // Clean up after download
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Error exporting to CSV:', error);
        }
    }
}
