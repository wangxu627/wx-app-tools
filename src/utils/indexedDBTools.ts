function exportStoreToJSON<T = any>(dbName: string, storeName: string): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
        const request: IDBOpenDBRequest = indexedDB.open(dbName);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db: IDBDatabase = request.result;
            const tx: IDBTransaction = db.transaction(storeName, "readonly");
            const store: IDBObjectStore = tx.objectStore(storeName);
            const getAllReq: IDBRequest<T[]> = store.getAll();

            getAllReq.onerror = () => reject(getAllReq.error);
            getAllReq.onsuccess = () => {
                const data: T[] = getAllReq.result;
                // 不再创建下载，直接返回数据
                resolve(data);
            };
        };
    });
}

function importJSONToIndexedDB<T = any>(dbName: string, storeName: string, jsonArray: T[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const request: IDBOpenDBRequest = indexedDB.open(dbName);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db: IDBDatabase = request.result;
            const tx: IDBTransaction = db.transaction(storeName, "readwrite");
            const store: IDBObjectStore = tx.objectStore(storeName);

            jsonArray.forEach(item => store.put(item));

            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        };
    });
}

// 添加导出语句
export { exportStoreToJSON, importJSONToIndexedDB };

