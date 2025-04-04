import { NextRequest, NextResponse } from 'next/server';
import { getDefaultApiUrl } from '@/lib/env';

// Helper function to get API endpoint from headers, cookie or use default
function getRagServiceUrl(request: NextRequest): string {
  // Récupérer l'API endpoint depuis les headers de la requête
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
    
    console.log(`Forwarding request to RAG service: ${serviceUrl}/answer`);
    console.log('Request body:', body);
    
    // Forward the request to the RAG service using the configured endpoint
    const response = await fetch(`${serviceUrl}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      console.error(`RAG service error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Answer failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('RAG service response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting answer:', error);
    return NextResponse.json(
      { error: 'Failed to get answer', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
