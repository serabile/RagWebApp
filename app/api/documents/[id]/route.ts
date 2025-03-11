import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' }, 
        { status: 400 }
      );
    }

    // In a real implementation, you would fetch the document from your database
    // For now, we'll just return mock data
    
    // Simulate database lookup time
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json({
      id,
      name: `Document ${id.slice(0, 6)}`,
      content: "This is a sample document content. In a real implementation, this would contain actual document text or a summary.",
    });
    
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' }, 
      { status: 500 }
    );
  }
}
