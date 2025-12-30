declare module './indexedDBTools' {
    export function exportStoreToJSON<T = any>(dbName: string, storeName: string): Promise<T[]>;
    export function importJSONToIndexedDB<T = any>(dbName: string, storeName: string, jsonArray: T[]): Promise<boolean>;
}
