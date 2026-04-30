import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../lib/supabaseAdmin';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!documentId || !userId) {
      return NextResponse.json({ error: 'Document ID and User ID are required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Delete associated chunks first (manual cascade if not set in DB)
    const { error: chunkError } = await supabase
      .from('document_chunks')
      .delete()
      .eq('document_id', documentId)
      .eq('user_id', userId);

    if (chunkError) {
      console.error('Error deleting chunks:', chunkError);
      return NextResponse.json({ error: 'Failed to delete document chunks' }, { status: 500 });
    }

    // 2. Delete the document metadata
    const { error: docError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', userId);

    if (docError) {
      console.error('Error deleting document:', docError);
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Delete Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
