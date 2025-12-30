import { useState, useEffect } from 'react'
import { AppShell, Tabs, Box, Burger, Drawer, Title } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
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
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)
  
  // 检测是否为移动端（小于768px）
  const isMobile = useMediaQuery('(max-width: 767px)')

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
      // 移动端选择后关闭抽屉
      if (isMobile) {
        closeDrawer()
      }
    }
  }

  return (
    <AppShell
      navbar={isMobile ? undefined : { width: 250, breakpoint: 'sm' }}
      header={isMobile ? { height: 60 } : undefined}
      padding={0}
      style={{ height: '100vh', width: '100vw' }}
    >
      {/* 移动端头部汉堡菜单 */}
      {isMobile && (
        <AppShell.Header p="md" style={{ display: 'flex', alignItems: 'center' }}>
          <Burger opened={drawerOpened} onClick={openDrawer} />
          <Title order={4} style={{ marginLeft: 16 }}>App Tools</Title>
        </AppShell.Header>
      )}

      {/* PC端左侧导航栏 */}
      {!isMobile && (
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
      )}

      <AppShell.Main style={{ height: '100vh', overflow: 'hidden' }}>
        <Box p={isMobile ? 'sm' : 'md'} h="100%" style={{ overflow: 'auto' }}>
          {activeTab === 'app-one' && <AppOneHome />}
          {activeTab === 'app-two' && <AppTwoHome />}
          {activeTab === 'app-three' && <AppThreeOverview />}
        </Box>
      </AppShell.Main>

      {/* 移动端抽屉导航菜单 */}
      {isMobile && (
        <Drawer
          opened={drawerOpened}
          onClose={closeDrawer}
          title="Navigation"
          size="250px"
          padding="md"
        >
          <Tabs value={activeTab} onChange={handleTabChange} orientation="vertical" variant="pills">
            <Tabs.List>
              <Tabs.Tab 
                value="app-one" 
                leftSection={<IconCurrencyDollar size={16} />}
                style={{ justifyContent: 'flex-start', width: '100%' }}
                mb="xs"
              >
                Currency Converter
              </Tabs.Tab>
              <Tabs.Tab 
                value="app-two" 
                leftSection={<IconListCheck size={16} />}
                style={{ justifyContent: 'flex-start', width: '100%' }}
                mb="xs"
              >
                Todo List
              </Tabs.Tab>
              <Tabs.Tab 
                value="app-three" 
                leftSection={<IconInfoCircle size={16} />}
                style={{ justifyContent: 'flex-start', width: '100%' }}
                mb="xs"
              >
                Info App
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Drawer>
      )}
    </AppShell>
  )
}