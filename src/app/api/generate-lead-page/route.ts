import { NextRequest, NextResponse } from 'next/server'
import { generateLeadGenContent } from '@/utilities/ai/ollamaTextGeneration'
import { generateLeadGenImages } from '@/utilities/ai/comfyImageGeneration'
import { createLeadGenPage } from '@/utilities/ai/uploadToPayload'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Get the request data
    const data = await req.json()
    const { prompt } = data

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log('Processing prompt:', prompt);

    // Parse business type and service description from prompt
    const businessMatch = prompt.match(/sell\s+([^.!?]+)/i)
    const businessType = businessMatch 
      ? businessMatch[1].trim() 
      : 'generic business'
    
    console.log('Detected business type:', businessType);
    
    const serviceMatch = prompt.match(/with\s+([^.!?]+)/i)
    const serviceDescription = serviceMatch 
      ? serviceMatch[1].trim() 
      : '3PL services'
    
    console.log('Detected service description:', serviceDescription);

    try {
      // Test Ollama connectivity
      console.log('Testing Ollama connection...');
      await fetch('http://localhost:11434/api/tags');
      console.log('Ollama connection successful');
    } catch (error) {
      console.error('Ollama connection failed:', error);
      return NextResponse.json(
        { error: 'Failed to connect to Ollama text generation service' },
        { status: 500 }
      );
    }

    try {
      // Test ComfyUI connectivity
      console.log('Testing ComfyUI connection...');
      await fetch('http://localhost:8188');
      console.log('ComfyUI connection successful');
    } catch (error) {
      console.error('ComfyUI connection failed:', error);
      return NextResponse.json(
        { error: 'Failed to connect to ComfyUI image generation service' },
        { status: 500 }
      );
    }

    // Generate content using Ollama with llama3
    console.log('Generating content with Ollama...');
    const content = await generateLeadGenContent(businessType, serviceDescription)
    console.log('Content generation successful');

    // Generate images using ComfyUI
    console.log('Generating images with ComfyUI...');
    const images = await generateLeadGenImages(businessType)
    console.log('Image generation successful');

    // Create the lead generation page in Payload CMS
    console.log('Creating page in Payload CMS...');
    const pageId = await createLeadGenPage(content, images, prompt)
    console.log('Page creation successful, ID:', pageId);

    // Return success response with page ID and URL
    return NextResponse.json({
      success: true,
      message: 'Lead generation page created successfully',
      pageId,
      pageUrl: `/lead-gen/${content.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}`,
    })
  } catch (error: unknown) {
    console.error('Detailed error in generate-lead-page:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: `Failed to generate lead page: ${errorMessage}` },
      { status: 500 }
    )
  }
} 