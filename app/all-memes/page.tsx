'use client';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

interface Meme {
  id: string;
  name: string;
  url: string;
  description: string;
}

export default function AllMemes() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMemes() {
      try {
        const { data, error } = await supabase
          .from('memes')
          .select('*');

        if (error) throw error;
        setMemes(data || []);
      } catch (error) {
        console.error('Error fetching memes:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMemes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">All Memes Collection</h1>
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Go to Caption Generator
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading memes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memes.map((meme) => (
              <div key={meme.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="aspect-w-16 aspect-h-16 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={meme.url}
                    alt={meme.name}
                    className="w-full h-auto object-contain rounded-md"
                  />
                </div>
                <h2 className="text-lg font-semibold mb-2">{meme.name.replace(/-/g, ' ')}</h2>
                <p className="text-sm text-gray-600">{meme.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 