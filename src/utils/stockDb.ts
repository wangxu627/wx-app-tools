// Stock Database Helper using IndexedDB
export interface StockData {
  id?: number
  stock_name: string
  stock_code: string
  cost_price: number
  current_price: number
  shares: number
  total_value: number
  profit_loss: number
  created_at?: string
  updated_at?: string
}

class StockDatabase {
  private dbName = 'StockPortfolioDB'
  private version = 1
  private storeName = 'stocks'

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true })
          store.createIndex('stock_code', 'stock_code', { unique: true })
          store.createIndex('stock_name', 'stock_name', { unique: false })
        }
      }
    })
  }

  async getAllStocks(): Promise<StockData[]> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async addStock(stock: Omit<StockData, 'id'>): Promise<StockData> {
    const db = await this.openDB()
    const stockWithTimestamp = {
      ...stock,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.add(stockWithTimestamp)

      request.onsuccess = () => {
        resolve({ ...stockWithTimestamp, id: request.result as number })
      }
      request.onerror = () => reject(request.error)
    })
  }

  async updateStock(id: number, updates: Partial<StockData>): Promise<StockData> {
    const db = await this.openDB()
    const existing = await this.getStockById(id)
    if (!existing) throw new Error('Stock not found')

    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(updated)

      request.onsuccess = () => resolve(updated)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteStock(id: number): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getStockById(id: number): Promise<StockData | undefined> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

//   async initializeWithSampleData(): Promise<void> {
//     const existing = await this.getAllStocks()
//     if (existing.length === 0) {
//       // Initialize with sample data
//       await this.addStock({
//         stock_name: "特斯拉",
//         stock_code: "TSLA",
//         cost_price: 623.31,
//         current_price: 709.74,
//         shares: 2,
//         total_value: 1419.48,
//         profit_loss: 172.86
//       })
//     }
//   }
}

export const stockDb = new StockDatabase()