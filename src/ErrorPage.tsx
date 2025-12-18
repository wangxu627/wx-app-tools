import React from 'react'
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { Container, Title, Text, Button } from '@mantine/core'

export default function ErrorPage() {
  const error = useRouteError()

  return (
    <Container style={{ paddingTop: 40 }}>
      <Title order={2}>Oops — something went wrong</Title>
      {isRouteErrorResponse(error) ? (
        <Text mt="sm">Error {error.status}: {error.statusText}</Text>
      ) : (
        <Text mt="sm">{String(error ?? 'Unknown error')}</Text>
      )}
      <Button component={Link} to="/" mt="md">Back to Home</Button>
    </Container>
  )
}
