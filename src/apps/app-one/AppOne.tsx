import React, { useState, useEffect, useCallback } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { 
  Container, Title, Button, Group, Text, Loader, Alert, Table, 
  Modal, TextInput, NumberInput, ActionIcon, Notification, Badge
} from '@mantine/core'
import { IconEdit, IconTrash, IconPlus, IconRefresh } from '@tabler/icons-react'
import { stockDb, type StockData } from '../../utils/stockDb'
import { stockPriceService } from '../../utils/stockPriceApi'

export default function AppOneLayout() {
    return (
        <Container style={{ paddingTop: 20 }}>
            <Title order={2}>Currency Converter</Title>
            <Group mb="md">
                <Button component={Link} to="/" size="sm">← Back to Hub</Button>
            </Group>
            <Outlet />
        </Container>
    )
}

export function AppOneHome() {
    const USD_AMOUNTS = [100, 200, 300, 500, 700, 1000]
    const CNY_AMOUNTS = [1000, 2000, 3000, 5000, 7000, 10000]

    // Currency state
    const [rate, setRate] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Stock data state
    const [stockData, setStockData] = useState<StockData[]>([])
    const [stockLoading, setStockLoading] = useState(false)
    const [priceUpdating, setPriceUpdating] = useState(false)
    const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null)
    const [modalOpened, setModalOpened] = useState(false)
    const [editingStock, setEditingStock] = useState<StockData | null>(null)
    const [notification, setNotification] = useState<string | null>(null)

    // Form state
    const [form, setForm] = useState({
        stock_name: '',
        stock_code: '',
        cost_price: 0,
        current_price: 0,
        shares: 0
    })

    // Initialize database and load data
    useEffect(() => {
        const initDB = async () => {
            try {
                await stockDb.initializeWithSampleData()
                await loadStocks()
            } catch (error) {
                console.error('Failed to initialize database:', error)
            }
        }
        initDB()
    }, [])

    const loadStocks = async () => {
        setStockLoading(true)
        try {
            const stocks = await stockDb.getAllStocks()
            setStockData(stocks)
        } catch (error) {
            console.error('Failed to load stocks:', error)
        } finally {
            setStockLoading(false)
        }
    }

    // Update stock prices
    const updateStockPrices = useCallback(async () => {
        if (stockData.length === 0) return
        
        setPriceUpdating(true)
        try {
            const stockCodes = stockData.map(stock => stock.stock_code)
            const priceUpdates = await stockPriceService.updateStockPrices(stockCodes)
            
            // Update each stock with new price
            for (const priceUpdate of priceUpdates) {
                const stock = stockData.find(s => s.stock_code === priceUpdate.symbol)
                if (stock) {
                    const updatedData = {
                        current_price: priceUpdate.price,
                        total_value: priceUpdate.price * stock.shares,
                        profit_loss: (priceUpdate.price - stock.cost_price) * stock.shares
                    }
                    await stockDb.updateStock(stock.id!, updatedData)
                }
            }
            
            // Reload stocks to reflect changes
            await loadStocks()
            setLastPriceUpdate(new Date())
            setNotification(`${priceUpdates.length} stocks updated successfully`)
        } catch (error) {
            console.error('Failed to update stock prices:', error)
            setNotification('Failed to update some stock prices')
        } finally {
            setPriceUpdating(false)
        }
    }, [stockData])

    // Auto-update prices every 5 minutes
    useEffect(() => {
        if (stockData.length === 0) return

        // Initial update
        updateStockPrices()

        // Set up interval for auto-updates
        const interval = setInterval(() => {
            updateStockPrices()
        }, 60 * 60 * 1000) // 60 minutes

        return () => clearInterval(interval)
    }, [stockData.length > 0 ? stockData.map(s => s.stock_code).join(',') : '']) // Re-run when stock codes change

    const handleAddStock = () => {
        setEditingStock(null)
        setForm({ stock_name: '', stock_code: '', cost_price: 0, current_price: 0, shares: 0 })
        setModalOpened(true)
    }

    const handleEditStock = (stock: StockData) => {
        setEditingStock(stock)
        setForm({
            stock_name: stock.stock_name,
            stock_code: stock.stock_code,
            cost_price: stock.cost_price,
            current_price: stock.current_price,
            shares: stock.shares
        })
        setModalOpened(true)
    }

    const handleDeleteStock = async (id: number) => {
        if (!confirm('确定要删除这只股票吗？')) return
        
        try {
            await stockDb.deleteStock(id)
            await loadStocks()
            setNotification('股票已删除')
        } catch (error) {
            console.error('Failed to delete stock:', error)
        }
    }

    const handleSubmit = async () => {
        try {
            const stockDataToSave = {
                ...form,
                total_value: form.current_price * form.shares,
                profit_loss: (form.current_price - form.cost_price) * form.shares
            }

            if (editingStock) {
                await stockDb.updateStock(editingStock.id!, stockDataToSave)
                setNotification('股票已更新')
            } else {
                await stockDb.addStock(stockDataToSave)
                setNotification('股票已添加')
            }

            await loadStocks()
            setModalOpened(false)
        } catch (error) {
            console.error('Failed to save stock:', error)
        }
    }

    // Currency exchange logic (existing code)
    const loadRate = useCallback(async (signal?: AbortSignal) => {
        setLoading(true)
        setError(null)
        try {
            const API_KEY = (import.meta.env.VITE_EXCHANGE_API_KEY as string) || '72c27d76daf2471ab3620d9dca48b832'
            const API_URL = (import.meta.env.VITE_EXCHANGE_API_URL as string) || 'https://api.currencyfreaks.com/v2.0/rates/latest'

            let baseUrl = ''
            let url = ''
            if (API_KEY) {
                baseUrl = API_URL || 'https://api.currencyfreaks.com/v2.0/rates/latest'
                url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}apikey=${API_KEY}&symbols=CNY&base=USD`
            } else {
                baseUrl = API_URL || 'https://api.exchangerate.host/latest'
                url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}base=USD&symbols=CNY`
            }

            const res = await fetch(url, { signal })
            const json = await res.json().catch(() => null)

            if (!res.ok) {
                const msg = json?.error?.info ?? json?.message ?? json?.info ?? `HTTP ${res.status}`
                if (typeof msg === 'string' && /access_key|missing_access_key|API Access Key/i.test(msg)) {
                    throw new Error('Missing API key: set VITE_EXCHANGE_API_KEY in your .env (or use exchangerate.host as fallback).')
                }
                throw new Error(`Failed to fetch rates: ${msg}`)
            }

            const rawRate = Number(json?.rates?.CNY ?? json?.CNY ?? json?.rate ?? json?.rates?.cny)
            if (!rawRate || Number.isNaN(rawRate)) throw new Error('Invalid response format from rate API')

            setRate(rawRate)
        } catch (e: any) {
            if (e.name === 'AbortError' || e.message?.includes('aborted')) {
                return
            }
            setError(e?.message ?? String(e))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const controller = new AbortController()
        loadRate(controller.signal)
        const id = setInterval(() => loadRate(), 5 * 60 * 1000)
        return () => {
            controller.abort()
            clearInterval(id)
        }
    }, [loadRate])

    const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    return (
        <div style={{ marginTop: 20 }}>
            {notification && (
                <Notification 
                    color="green" 
                    onClose={() => setNotification(null)}
                    style={{ marginBottom: 16 }}
                >
                    {notification}
                </Notification>
            )}

            <Title order={4}>Currency Presets — USD ↔ CNY</Title>

            {loading && <Loader size="sm" />}
            {error && <Alert title="Error" color="red" mt="sm">{error}</Alert>}
            {!loading && !error && <div style={{ height: '16px' }}></div>}

            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <Title order={5}>USD → CNY</Title>
                    <div style={{ marginTop: 12 }}>
                        {USD_AMOUNTS.map((usd) => (
                            <div key={usd} style={{ padding: '8px 12px', borderRadius: 6, marginBottom: 8 }}>
                                <Text><strong>${usd}</strong> → <strong>¥{rate ? fmt(usd * rate) : '—'}</strong></Text>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <Title order={5}>CNY → USD</Title>
                    <div style={{ marginTop: 12 }}>
                        {CNY_AMOUNTS.map((cny) => (
                            <div key={cny} style={{ padding: '8px 12px', borderRadius: 6, marginBottom: 8 }}>
                                <Text>¥{cny} → <strong>{rate ? `$${fmt(cny / rate)}` : '—'}</strong></Text>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 32 }}>
                <Group justify="space-between" mb="md">
                    <div>
                        <Title order={4}>Stock Portfolio</Title>
                        {lastPriceUpdate && (
                            <Text size="xs" c="dimmed">
                                Last updated: {lastPriceUpdate.toLocaleTimeString()}
                            </Text>
                        )}
                    </div>
                    <Group>
                        <Button 
                            leftSection={<IconRefresh size={16} />} 
                            onClick={updateStockPrices}
                            loading={priceUpdating}
                            size="sm"
                            variant="light"
                        >
                            Update Prices
                        </Button>
                        <Button leftSection={<IconPlus size={16} />} onClick={handleAddStock}>
                            Add Stock
                        </Button>
                    </Group>
                </Group>

                {stockLoading ? (
                    <Loader />
                ) : (
                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>股票名称</Table.Th>
                                <Table.Th>代码</Table.Th>
                                <Table.Th>成本价</Table.Th>
                                <Table.Th>现价</Table.Th>
                                <Table.Th>持股数</Table.Th>
                                <Table.Th>总价值</Table.Th>
                                <Table.Th>盈亏</Table.Th>
                                <Table.Th>跌幅价位</Table.Th>
                                <Table.Th>涨幅价位</Table.Th>
                                <Table.Th>操作</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {stockData.map((stock) => (
                                <Table.Tr key={stock.id}>
                                    <Table.Td>{stock.stock_name}</Table.Td>
                                    <Table.Td><Text fw={500}>{stock.stock_code}</Text></Table.Td>
                                    <Table.Td>${fmt(stock.cost_price)}</Table.Td>
                                    <Table.Td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Text fw={500}>${fmt(stock.current_price)}</Text>
                                            {priceUpdating && <Badge size="xs" color="blue">Updating...</Badge>}
                                        </div>
                                    </Table.Td>
                                    <Table.Td>{stock.shares}</Table.Td>
                                    <Table.Td><Text fw={500}>${fmt(stock.current_price * stock.shares)}</Text></Table.Td>
                                    <Table.Td>
                                        <Text c={stock.profit_loss >= 0 ? 'green' : 'red'} fw={500}>
                                            {stock.profit_loss >= 0 ? '+' : ''}${fmt(stock.profit_loss)} ({fmt(((stock.current_price - stock.cost_price) / stock.cost_price) * 100)}%)
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                            <div style={{ color: '#e03131' }}>-5%: ${fmt(stock.cost_price * 0.95)}</div>
                                            <div style={{ color: '#e03131' }}>-10%: ${fmt(stock.cost_price * 0.90)}</div>
                                            <div style={{ color: '#c92a2a' }}>-15%: ${fmt(stock.cost_price * 0.85)}</div>
                                            <div style={{ color: '#a61e1e' }}>-20%: ${fmt(stock.cost_price * 0.80)}</div>
                                        </div>
                                    </Table.Td>
                                    <Table.Td>
                                        <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                            <div style={{ color: '#2f9e44' }}>+5%: ${fmt(stock.cost_price * 1.05)}</div>
                                            <div style={{ color: '#2f9e44' }}>+10%: ${fmt(stock.cost_price * 1.10)}</div>
                                            <div style={{ color: '#2b8a3e' }}>+15%: ${fmt(stock.cost_price * 1.15)}</div>
                                            <div style={{ color: '#087f5b' }}>+20%: ${fmt(stock.cost_price * 1.20)}</div>
                                        </div>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <ActionIcon 
                                                size="sm" 
                                                color="blue"
                                                onClick={() => handleEditStock(stock)}
                                            >
                                                <IconEdit size={14} />
                                            </ActionIcon>
                                            <ActionIcon 
                                                size="sm" 
                                                color="red"
                                                onClick={() => handleDeleteStock(stock.id!)}
                                            >
                                                <IconTrash size={14} />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </div>

            {/* Add/Edit Stock Modal */}
            <Modal 
                opened={modalOpened} 
                onClose={() => setModalOpened(false)}
                title={editingStock ? "编辑股票" : "添加股票"}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <TextInput
                        label="股票名称"
                        value={form.stock_name}
                        onChange={(e) => setForm({ ...form, stock_name: e.currentTarget.value })}
                        required
                    />
                    <TextInput
                        label="股票代码"
                        value={form.stock_code}
                        onChange={(e) => setForm({ ...form, stock_code: e.currentTarget.value })}
                        required
                    />
                    <NumberInput
                        label="成本价"
                        value={form.cost_price}
                        onChange={(value) => setForm({ ...form, cost_price: Number(value) || 0 })}
                        decimalScale={2}
                        required
                    />
                    <NumberInput
                        label="现价"
                        value={form.current_price}
                        onChange={(value) => setForm({ ...form, current_price: Number(value) || 0 })}
                        decimalScale={2}
                        required
                    />
                    <NumberInput
                        label="持股数"
                        value={form.shares}
                        onChange={(value) => setForm({ ...form, shares: Number(value) || 0 })}
                        required
                    />
                    <Button onClick={handleSubmit} fullWidth>
                        {editingStock ? "更新" : "添加"}
                    </Button>
                </div>
            </Modal>
        </div>
    )
}