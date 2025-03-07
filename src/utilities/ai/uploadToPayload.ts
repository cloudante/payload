/**
 * Utility for uploading generated content to Payload CMS
 */

import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import os from 'os'
import { fileURLToPath } from 'url'
import payload from 'payload'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Function to upload an image to Payload CMS Media collection
export async function uploadImageToPayload(
  imageBuffer: Buffer,
  filename: string,
  alt: string,
): Promise<string> {
  try {
    // Create a temporary file
    const tempDir = path.join(os.tmpdir(), 'payload-uploads')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Add a unique identifier to prevent filename conflicts
    const uniqueFilename = `${path.parse(filename).name}-${uuidv4()}${path.parse(filename).ext}`
    const tempFilePath = path.join(tempDir, uniqueFilename)

    // Write the buffer to a temporary file
    fs.writeFileSync(tempFilePath, imageBuffer)

    // Get the Payload admin URL
    const adminURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

    console.log('Attempting to upload image to:', `${adminURL}/api/media`)

    // First attempt using FormData
    try {
      // Create a form for file upload
      const form = new FormData()

      // Create a file-like object that FormData can handle
      const blob = new Blob([imageBuffer], { type: 'image/png' })
      form.append('file', blob, uniqueFilename)

      // For Payload, also include alt text
      form.append('alt', alt)

      // Upload using the REST API
      const response = await fetch(`${adminURL}/api/media`, {
        method: 'POST',
        headers: {
          Authorization: `JWT ${process.env.PAYLOAD_SECRET}`,
        },
        body: form,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('First attempt failed. Error details:', {
          status: response.status,
          statusText: response.statusText,
          responseBody: errorText,
        })

        // Let it fall through to the second attempt
        throw new Error('First upload attempt failed')
      }

      const result = await response.json()
      console.log('Image upload successful:', result.doc.id)

      // Clean up the temporary file
      fs.unlinkSync(tempFilePath)

      // Return the ID of the uploaded media
      return result.doc.id
    } catch (firstAttemptError) {
      console.log('Trying alternative upload method...')

      // Second attempt: Use direct fetch with file path
      // This creates a Node.js readable stream from the file
      const fileStream = fs.createReadStream(tempFilePath)

      // Create a form data object using form-data package
      const FormData = require('form-data')
      const formData = new FormData()
      formData.append('file', fileStream)
      formData.append('alt', alt)

      const response = await fetch(`${adminURL}/api/media`, {
        method: 'POST',
        headers: {
          Authorization: `JWT ${process.env.PAYLOAD_SECRET}`,
          ...formData.getHeaders(),
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Second attempt failed. Error details:', {
          status: response.status,
          statusText: response.statusText,
          responseBody: errorText,
        })
        throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      // Clean up the temporary file
      fs.unlinkSync(tempFilePath)

      // Return the ID of the uploaded media
      return result.doc.id
    }
  } catch (error: unknown) {
    console.error('Error uploading image to Payload:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to upload image: ${errorMessage}`)
  }
}

// Define a type for the payload for the lead gen page
// This helps manage the specific collection and data structure
interface LeadGenPagePayload {
  title: string
  slug: string
  heroSection: {
    headline: string
    subheadline: string
    image: string // Media ID
    ctaText: string
  }
  benefits: Array<{
    title: string
    description: string
  }>
  featuresSection: {
    title: string
    features: Array<{
      title: string
      description: string
      image: string | null // Media ID or null
    }>
  }
  contentSection: {
    title: string
    content: string
  }
  leadForm: {
    title: string
    description: string
    fields: Array<{
      label: string
      type: string
      required: boolean
    }>
    submitButtonText: string
  }
  generatedBy: string
  aiPrompt: string
  meta: {
    title: string
    description: string
  }
}

// Function to create a lead generation page in Payload CMS
export async function createLeadGenPage(
  content: {
    title: string
    heroSection: {
      headline: string
      subheadline: string
      ctaText: string
    }
    benefits: Array<{
      title: string
      description: string
    }>
    featuresSection: {
      title: string
      features: Array<{
        title: string
        description: string
      }>
    }
    contentSection: {
      title: string
      content: string
    }
    leadForm: {
      title: string
      description: string
      submitButtonText: string
    }
    meta: {
      title: string
      description: string
    }
  },
  images: {
    heroImage: { filename: string; buffer: Buffer }
    featureImages: Array<{ filename: string; buffer: Buffer }>
  },
  prompt: string,
): Promise<string> {
  try {
    // Upload hero image
    const heroImageId = await uploadImageToPayload(
      images.heroImage.buffer,
      images.heroImage.filename,
      `Hero image for ${content.title}`,
    )

    // Upload feature images
    const featureImageIds = await Promise.all(
      images.featureImages.map((img, index) =>
        uploadImageToPayload(
          img.buffer,
          img.filename,
          `Feature image ${index + 1} for ${content.title}`,
        ),
      ),
    )

    // Create form fields for lead capture
    const formFields = [
      {
        label: 'Name',
        type: 'text',
        required: true,
      },
      {
        label: 'Email',
        type: 'email',
        required: true,
      },
      {
        label: 'Phone',
        type: 'tel',
        required: false,
      },
      {
        label: 'Message',
        type: 'textarea',
        required: false,
      },
    ]

    // Generate a slug from the title
    const slug = content.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')

    // Get the Payload admin URL
    const adminURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

    // Create the lead gen page data
    const leadGenPageData = {
      title: content.title,
      slug,
      heroSection: {
        headline: content.heroSection.headline,
        subheadline: content.heroSection.subheadline,
        image: heroImageId,
        ctaText: content.heroSection.ctaText,
      },
      benefits: content.benefits.map((benefit) => ({
        title: benefit.title,
        description: benefit.description,
      })),
      featuresSection: {
        title: content.featuresSection.title,
        features: content.featuresSection.features.map((feature, index) => ({
          title: feature.title,
          description: feature.description,
          image: featureImageIds[index] || null,
        })),
      },
      contentSection: {
        title: content.contentSection.title,
        content: content.contentSection.content,
      },
      leadForm: {
        title: content.leadForm.title,
        description: content.leadForm.description,
        fields: formFields,
        submitButtonText: content.leadForm.submitButtonText,
      },
      generatedBy: 'AI Agent',
      aiPrompt: prompt,
      meta: {
        title: content.meta.title,
        description: content.meta.description,
      },
    }

    // Create the lead gen page using REST API
    const response = await fetch(`${adminURL}/api/lead-gen-pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${process.env.PAYLOAD_SECRET}`,
      },
      body: JSON.stringify(leadGenPageData),
    })

    if (!response.ok) {
      throw new Error(`Failed to create lead gen page: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    return result.doc.id
  } catch (error: unknown) {
    console.error('Error creating lead gen page:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to create lead gen page: ${errorMessage}`)
  }
}
