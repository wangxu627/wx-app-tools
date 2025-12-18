import React, { useState, useEffect } from 'react'
import { AppShell, Tabs, Box } from '@mantine/core'
import { IconCurrencyDollar, IconListCheck, IconInfoCircle } from '@tabler/icons-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppOneHome } from '../apps/app-one/AppOne'
import { AppTwoHome } from '../apps/app-two/AppTwo'
import { AppThreeOverview } from '../apps/app-three/AppThree'

const tabRoutes = {
  'app-one': '/apps/app-one',
  'app-two': '/apps/app-two',
  'app-three': '/apps/app-three'
}

const routeTabs: Record<string, string> = {
  '/apps/app-one': 'app-one',
  '/apps/app-two': 'app-two', 
  '/apps/app-three': 'app-three'
}

export default function MainPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('app-one')

  useEffect(() => {
    // Sync tab with current route
    const tabFromRoute = routeTabs[location.pathname]
    if (tabFromRoute && tabFromRoute !== activeTab) {
      setActiveTab(tabFromRoute)
    }
  }, [location.pathname, activeTab])

  const handleTabChange = (value: string | null) => {
    if (value && tabRoutes[value as keyof typeof tabRoutes]) {
      setActiveTab(value)
      navigate(tabRoutes[value as keyof typeof tabRoutes])
    }
  }

  return (
    <AppShell
      navbar={{ width: 250, breakpoint: 'sm' }}
      padding={0}
      style={{ height: '100vh', width: '100vw' }}
    >
      <AppShell.Navbar>
        <Tabs value={activeTab} onChange={handleTabChange} orientation="vertical" variant="pills" h="100%">
          <Tabs.List p="md" h="100%">
            <Tabs.Tab 
              value="app-one" 
              leftSection={<IconCurrencyDollar size={16} />}
              style={{ justifyContent: 'flex-start', width: '100%' }}
            >
              Currency Converter
            </Tabs.Tab>
            <Tabs.Tab 
              value="app-two" 
              leftSection={<IconListCheck size={16} />}
              style={{ justifyContent: 'flex-start', width: '100%' }}
            >
              Todo List
            </Tabs.Tab>
            <Tabs.Tab 
              value="app-three" 
              leftSection={<IconInfoCircle size={16} />}
              style={{ justifyContent: 'flex-start', width: '100%' }}
            >
              Info App
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </AppShell.Navbar>

      <AppShell.Main style={{ height: '100vh', overflow: 'hidden' }}>
        <Box p="md" h="100%" style={{ overflow: 'auto' }}>
          {activeTab === 'app-one' && <AppOneHome />}
          {activeTab === 'app-two' && <AppTwoHome />}
          {activeTab === 'app-three' && <AppThreeOverview />}
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}