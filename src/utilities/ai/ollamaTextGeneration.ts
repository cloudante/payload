/**
 * Utility for generating text content using Ollama with Llama3 model
 */

// Function to generate text using Ollama API
export async function generateTextWithOllama(prompt: string): Promise<string> {
  try {
    // Ollama API call to Llama3 model
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3',
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error: unknown) {
    console.error('Error generating text with Ollama:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate text: ${errorMessage}`);
  }
}

// Function to generate specific sections for a lead generation page
export async function generateLeadGenContent(businessType: string, serviceDescription: string): Promise<{
  title: string;
  heroSection: {
    headline: string;
    subheadline: string;
    ctaText: string;
  };
  benefits: Array<{
    title: string;
    description: string;
  }>;
  featuresSection: {
    title: string;
    features: Array<{
      title: string;
      description: string;
    }>;
  };
  contentSection: {
    title: string;
    content: string;
  };
  leadForm: {
    title: string;
    description: string;
    submitButtonText: string;
  };
  meta: {
    title: string;
    description: string;
  };
}> {
  const prompt = `
Generate a lead generation landing page for a ${businessType} business. 
The business offers: ${serviceDescription}

Format the response as a JSON object with the following structure:
{
  "title": "Page title",
  "heroSection": {
    "headline": "Main headline",
    "subheadline": "Supporting subheadline",
    "ctaText": "Call to action button text"
  },
  "benefits": [
    { "title": "Benefit 1", "description": "Description of benefit 1" },
    { "title": "Benefit 2", "description": "Description of benefit 2" },
    { "title": "Benefit 3", "description": "Description of benefit 3" }
  ],
  "featuresSection": {
    "title": "Section title",
    "features": [
      { "title": "Feature 1", "description": "Description of feature 1" },
      { "title": "Feature 2", "description": "Description of feature 2" }
    ]
  },
  "contentSection": {
    "title": "About our services",
    "content": "Detailed information about the service..."
  },
  "leadForm": {
    "title": "Get in touch",
    "description": "Fill out the form to learn more",
    "submitButtonText": "Submit"
  },
  "meta": {
    "title": "SEO title",
    "description": "SEO description"
  }
}

Make the content persuasive, professional, and focused on generating leads. Keep each text item concise.
`;

  try {
    const rawResponse = await generateTextWithOllama(prompt);
    
    // Extract JSON from the response
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from the response');
    }
    
    const jsonContent = JSON.parse(jsonMatch[0]);
    return jsonContent;
  } catch (error: unknown) {
    console.error('Error generating lead gen content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate lead gen content: ${errorMessage}`);
  }
} 