import { NextRequest, NextResponse } from 'next/server';
import { getDefaultApiUrl } from '@/lib/env';

// Helper function to get API endpoint from cookie or use default
function getRagServiceUrl(request: NextRequest): string {
  // Récupérer l'API endpoint depuis les headers de la requête
  // Le client enverra son API endpoint stocké dans localStorage via un header personnalisé
  const apiEndpointHeader = request.headers.get('x-rag-api-endpoint');
  
  if (apiEndpointHeader) {
    return apiEndpointHeader;
  }
  
  // Si pas de header, essayer de lire le cookie (pour compatibilité)
  const settings = request.cookies.get('rag-app-settings')?.value;
  
  if (settings) {
    try {
      const parsedSettings = JSON.parse(settings);
      if (parsedSettings.apiEndpoint) {
        return parsedSettings.apiEndpoint;
      }
    } catch (error) {
      console.error('Failed to parse settings cookie', error);
    }
  }
  
  // Use default from environment
  return getDefaultApiUrl();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const serviceUrl = getRagServiceUrl(request);
    
    // Forward the request to the RAG service using the configured endpoint
    const response = await fetch(`${serviceUrl}/processing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Processing failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}
