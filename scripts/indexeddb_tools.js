// function exportStoreToJSON(dbName, storeName) {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.open(dbName);

//         request.onerror = reject;
//         request.onsuccess = () => {
//             const db = request.result;
//             const tx = db.transaction(storeName, "readonly");
//             const store = tx.objectStore(storeName);
//             const getAllReq = store.getAll();

//             getAllReq.onerror = reject;
//             getAllReq.onsuccess = () => {
//                 const data = getAllReq.result;
//                 const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
//                 const url = URL.createObjectURL(blob);

//                 const a = document.createElement("a");
//                 a.href = url;
//                 a.download = `${dbName}-${storeName}.json`;
//                 a.click();
//                 resolve(data);
//             };
//         };
//     });
// }

// // exportStoreToJSON("StockPortfolioDB", "stocks");

// function importJSONToIndexedDB(dbName, storeName, jsonArray) {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.open(dbName);

//         request.onerror = reject;
//         request.onsuccess = () => {
//             const db = request.result;
//             const tx = db.transaction(storeName, "readwrite");
//             const store = tx.objectStore(storeName);

//             jsonArray.forEach(item => store.put(item));

//             tx.oncomplete = () => resolve(true);
//             tx.onerror = reject;
//         };
//     });
// }

// // 例如导入
// // importJSONToIndexedDB("StockPortfolioDB", "stocks", jsonData);

