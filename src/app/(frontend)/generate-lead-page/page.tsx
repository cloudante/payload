'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

export default function GenerateLeadPage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ message: string; pageUrl: string } | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/generate-lead-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate page')
      }

      setSuccess({
        message: data.message,
        pageUrl: data.pageUrl,
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleViewPage = () => {
    if (success?.pageUrl) {
      router.push(success.pageUrl)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">AI Lead Page Generator</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Generate a Lead Generation Page</CardTitle>
          <CardDescription>
            Enter a prompt describing the business and services. For example: "Create a lead
            generation page for a company that sells custom furniture".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                Prompt
              </label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Sell Teddy Bears with 3PL Services"
                rows={4}
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-4 text-sm">
                {success.message}
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
            className="w-full mr-2"
          >
            {loading ? 'Generating...' : 'Generate Lead Page'}
          </Button>

          {success && (
            <Button
              type="button"
              onClick={handleViewPage}
              variant="outline"
              className="w-full ml-2"
            >
              View Generated Page
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
