/**
 * Utility for generating images using ComfyUI
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate an image using ComfyUI API
export async function generateImageWithComfyUI(
  prompt: string,
  negativePrompt: string = "bad quality, blurry, distorted, low resolution",
  width: number = 512,
  height: number = 512
): Promise<{ filename: string; buffer: Buffer }> {
  try {
    // Basic ComfyUI workflow for Stable Diffusion
    const workflow = {
      "3": {
        "inputs": {
          "seed": Math.floor(Math.random() * 1000000),
          "steps": 20,
          "cfg": 8,
          "sampler_name": "dpmpp_2m",
          "scheduler": "karras",
          "denoise": 1,
          "model": ["4", 0],
          "positive": ["6", 0],
          "negative": ["7", 0],
          "latent_image": ["5", 0]
        },
        "class_type": "KSampler"
      },
      "4": {
        "inputs": {
          "ckpt_name": "v1-5-pruned-emaonly-fp16.safetensors"
        },
        "class_type": "CheckpointLoaderSimple"
      },
      "5": {
        "inputs": {
          "width": width,
          "height": height,
          "batch_size": 1
        },
        "class_type": "EmptyLatentImage"
      },
      "6": {
        "inputs": {
          "text": prompt,
          "clip": ["4", 1]
        },
        "class_type": "CLIPTextEncode"
      },
      "7": {
        "inputs": {
          "text": negativePrompt,
          "clip": ["4", 1]
        },
        "class_type": "CLIPTextEncode"
      },
      "8": {
        "inputs": {
          "samples": ["3", 0],
          "vae": ["4", 2]
        },
        "class_type": "VAEDecode"
      },
      "9": {
        "inputs": {
          "filename_prefix": "generated",
          "images": ["8", 0]
        },
        "class_type": "SaveImage"
      }
    };

    // Submit workflow to ComfyUI
    const response = await fetch('http://localhost:8188/prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: workflow,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ComfyUI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const promptId = data.prompt_id;

    // Wait for the generation to complete
    const imageData = await waitForImageGeneration(promptId);
    return imageData;
  } catch (error: unknown) {
    console.error('Error generating image with ComfyUI:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate image: ${errorMessage}`);
  }
}

// Helper function to wait for image generation to complete
async function waitForImageGeneration(promptId: string): Promise<{ filename: string; buffer: Buffer }> {
  return new Promise((resolve, reject) => {
    // Poll for completion
    const checkInterval = setInterval(async () => {
      try {
        const historyResponse = await fetch(`http://localhost:8188/history/${promptId}`);
        
        if (!historyResponse.ok) {
          clearInterval(checkInterval);
          reject(new Error(`Failed to get generation history: ${historyResponse.status}`));
          return;
        }
        
        const historyData = await historyResponse.json();
        
        // Check if generation is complete
        if (historyData[promptId]?.outputs?.['9']?.images) {
          clearInterval(checkInterval);
          
          const imageInfo = historyData[promptId].outputs['9'].images[0];
          const imageFilename = imageInfo.filename;
          const imageSubfolder = imageInfo.subfolder;
          
          // Download the generated image
          const imageResponse = await fetch(`http://localhost:8188/view?filename=${imageFilename}&subfolder=${imageSubfolder || ''}`);
          
          if (!imageResponse.ok) {
            reject(new Error(`Failed to download generated image: ${imageResponse.status}`));
            return;
          }
          
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          resolve({ filename: imageFilename, buffer: imageBuffer });
        }
      } catch (error: unknown) {
        clearInterval(checkInterval);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        reject(new Error(`Error while waiting for image generation: ${errorMessage}`));
      }
    }, 1000); // Check every second
    
    // Timeout after 2 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error('Image generation timed out after 2 minutes'));
    }, 120000);
  });
}

// Function to generate lead gen page images
export async function generateLeadGenImages(businessType: string): Promise<{
  heroImage: { filename: string; buffer: Buffer };
  featureImages: Array<{ filename: string; buffer: Buffer }>;
}> {
  try {
    // Generate hero image
    const heroPrompt = `Professional marketing image for ${businessType} business, hero banner, high quality, photorealistic`;
    const heroImage = await generateImageWithComfyUI(heroPrompt, undefined, 1024, 512);
    
    // Generate feature images
    const featurePrompt1 = `Feature image 1 for ${businessType} business, icon style, professional, clear`;
    const featurePrompt2 = `Feature image 2 for ${businessType} business, icon style, professional, clear`;
    
    const featureImage1 = await generateImageWithComfyUI(featurePrompt1, undefined, 512, 512);
    const featureImage2 = await generateImageWithComfyUI(featurePrompt2, undefined, 512, 512);
    
    return {
      heroImage,
      featureImages: [featureImage1, featureImage2],
    };
  } catch (error: unknown) {
    console.error('Error generating lead gen images:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate lead gen images: ${errorMessage}`);
  }
} 