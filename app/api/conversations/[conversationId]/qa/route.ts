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

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const apiUrl = getRagServiceUrl(request);
  const { conversationId } = params;
  
  try {
    const response = await fetch(`${apiUrl}/conversations/${conversationId}/qa`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Get the response data
    const data = await response.json();
    
    // Check if there's an error or the response is not as expected
    if (!response.ok) {
      return NextResponse.json(
        {
          status: "error",
          conversation_id: conversationId,
          qa_pairs: [],
          message: data.message || `Failed to fetch Q/A pairs: ${response.statusText}`
        },
        { status: response.status }
      );
    }

    // Return the response from the backend
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching conversation Q/A pairs:', error);
    return NextResponse.json(
      { 
        status: "error",
        qa_pairs: [],
        message: "Failed to fetch Q/A pairs"
      },
      { status: 500 }
    );
  }
}