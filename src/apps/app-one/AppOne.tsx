import { useState } from 'react'
import { Title, Button, Collapse, Paper, Container } from '@mantine/core'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import CurrencyConverter from '../../components/CurrencyConverter'
import StockPortfolio from '../../components/StockPortfolio'

export default function AppOneLayout() {
    return (
        // <Container style={{ paddingTop: 20 }}>
        //     <div>Currency Converter</div>
        //     <Outlet />
        // </Container>

        <></>
    )
}

export function AppOneHome() {
    const [currencyOpened, setCurrencyOpened] = useState(true)

    return (
        <Container fluid p={{ base: 'xs', sm: 'md' }} style={{ marginTop: 20 }}>
            <Paper withBorder radius="md" mb="lg">
                <Button
                    variant="subtle"
                    fullWidth
                    leftSection={currencyOpened ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                    onClick={() => setCurrencyOpened(!currencyOpened)}
                    styles={{
                        root: { justifyContent: 'flex-start' },
                        inner: { justifyContent: 'flex-start' }
                    }}
                >
                    <Title order={4}>Currency Converter</Title>
                </Button>
                <Collapse in={currencyOpened}>
                    <div style={{ padding: '0 16px 16px' }}>
                        <CurrencyConverter />
                    </div>
                </Collapse>
            </Paper>
            <div style={{ marginTop: 32, overflowX: 'scroll' }}>
                <StockPortfolio />
            </div>
        </Container>
    )
}