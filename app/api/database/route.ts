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

export async function DELETE(request: NextRequest) {
  const apiUrl = getRagServiceUrl(request);
  
  try {
    const response = await fetch(`${apiUrl}/database`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          status: 'error',
          message: `Failed to clear database: ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error clearing database:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to clear database' 
      },
      { status: 500 }
    );
  }
}