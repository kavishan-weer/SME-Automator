import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../lib/supabaseAdmin';
import pdfParse from 'pdf-parse';
import { pipeline, env } from '@xenova/transformers';

// Disable local models loading in Next.js edge/serverless runtime to avoid issues
// We'll load the model from Hugging Face
env.allowLocalModels = false;
env.useBrowserCache = false;

class PipelineSingleton {
  static task: any = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: any = null;

  static async getInstance(progress_callback?: any) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

function chunkText(text: string, chunkSize = 500) {
  const words = text.split(' ');
  const chunks = [];
  let currentChunk = '';

  for (const word of words) {
    if (currentChunk.length + word.length > chunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = word + ' ';
    } else {
      currentChunk += word + ' ';
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Parse PDF
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No text could be extracted from PDF' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Insert Document metadata
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert([
        {
          name: file.name,
          type: 'PDF',
          status: 'Active',
          user_id: userId,
        }
      ])
      .select()
      .single();

    if (docError) {
      console.error('Error inserting document:', docError);
      return NextResponse.json({ error: 'Failed to save document metadata' }, { status: 500 });
    }

    // 2. Chunk Text
    const chunks = chunkText(text, 500);

    // 3. Generate Embeddings and Insert Chunks
    const extractor = await PipelineSingleton.getInstance();
    
    for (const chunk of chunks) {
      const output = await extractor(chunk, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data);

      const { error: chunkError } = await supabase
        .from('document_chunks')
        .insert([
          {
            document_id: document.id,
            content: chunk,
            embedding: embedding, // 384D vector
          }
        ]);
        
      if (chunkError) {
         console.error('Error inserting chunk:', chunkError);
      }
    }

    return NextResponse.json({ success: true, document });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
