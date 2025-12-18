import React from 'react'
import { Container, Title, Text, Stack, Button, Card } from '@mantine/core'
import { Link } from 'react-router-dom'

export default function MainPage() {
  return (
    <Container style={{ paddingTop: 40 }}>
      <Title order={2}>Main Page — App Hub</Title>
      <Text mt="sm" mb="md">Select an app to open its dedicated web-app page.</Text>

      <Stack spacing="md" sx={{ maxWidth: 480 }}>
        <Card shadow="sm">
          <Title order={4}>App One</Title>
          <Text size="sm" mt="xs">A small counter app with its own nested pages.</Text>
          <Button component={Link} to="/apps/app-one" mt="sm">Open App One</Button>
        </Card>

        <Card shadow="sm">
          <Title order={4}>App Two</Title>
          <Text size="sm" mt="xs">A todo-style app (demo state inside this page).</Text>
          <Button component={Link} to="/apps/app-two" mt="sm">Open App Two</Button>
        </Card>

        <Card shadow="sm">
          <Title order={4}>App Three</Title>
          <Text size="sm" mt="xs">A small info app that demonstrates independent UI.</Text>
          <Button component={Link} to="/apps/app-three" mt="sm">Open App Three</Button>
        </Card>

      </Stack>
    </Container>
  )
}
