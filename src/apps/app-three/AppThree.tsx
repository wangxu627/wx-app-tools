import React from 'react'
import { Outlet, Link, useLoaderData } from 'react-router-dom'
import { Container, Title, Button, Group, Text } from '@mantine/core'

export default function AppThreeLayout() {
  return (
    <Container style={{ paddingTop: 40 }}>
      <Title order={2}>App Three</Title>
      <Text mb="sm">An information-style small app demonstrating independent UI and routes.</Text>
      <Group>
        <Button component={Link} to="">Overview</Button>
        <Button component={Link} to="/">Back to Hub</Button>
      </Group>
      <Outlet />
    </Container>
  )
}

// Loader used by RouterProvider demo — fetches a post from JSONPlaceholder
export async function appThreeLoader() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts/1')
  if (!res.ok) {
    throw new Response('Failed to load post', { status: res.status })
  }
  return res.json()
}

export function AppThreeOverview() {
  // useLoaderData reads the value returned by the route's loader
  const data = useLoaderData() as { title?: string; body?: string }

  return (
    <div style={{ marginTop: 20 }}>
      <Title order={4}>Overview</Title>
      <Text mt="sm">App Three is a self-contained info app — good for demos or microsites.</Text>

      <div style={{ marginTop: 16 }}>
        <Title order={5}>{data?.title ?? 'No title'}</Title>
        <Text mt="sm">{data?.body ?? 'No content'}</Text>
      </div>
    </div>
  )
}
