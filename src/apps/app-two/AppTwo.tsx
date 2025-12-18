import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Container, Title, Button, Group, Text, TextInput, Stack } from '@mantine/core'

export default function AppTwoLayout() {
  return (
    <Container style={{ paddingTop: 20 }}>
      <Title order={2}>Todo List</Title>
      <Group mb="md">
        <Button component={Link} to="/" size="sm">← Back to Hub</Button>
      </Group>
      <Outlet />
    </Container>
  )
}

export function AppTwoHome() {
  const [items, setItems] = useState<string[]>([])
  const [text, setText] = useState('')

  const add = () => {
    if (!text.trim()) return
    setItems((s) => [...s, text.trim()])
    setText('')
  }

  return (
    <Stack mt="md">
      <TextInput placeholder="New todo" value={text} onChange={(e) => setText(e.target.value)} />
      <Button onClick={add}>Add</Button>
      <div>
        {items.length === 0 ? <Text color="dimmed">No items yet.</Text> : (
          <ul>
            {items.map((it, i) => <li key={i}>{it}</li>)}
          </ul>
        )}
      </div>
    </Stack>
  )
}
