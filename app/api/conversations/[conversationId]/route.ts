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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const apiUrl = getRagServiceUrl(request);
  const { conversationId } = params;
  
  try {
    const response = await fetch(`${apiUrl}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to delete conversation: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Forward the response from the backend
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}