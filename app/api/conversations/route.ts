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

export async function GET(request: NextRequest) {
  const apiUrl = getRagServiceUrl(request);
  
  try {
    const response = await fetch(`${apiUrl}/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to retrieve conversations: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error retrieving conversations:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const apiUrl = getRagServiceUrl(request);
  
  try {
    const body = await request.json();
    const { name, description } = body;

    const response = await fetch(`${apiUrl}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description: description || '',
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to create conversation: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}