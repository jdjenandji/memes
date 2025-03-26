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
  example: string;
  schema: string;
  rules: string;
}

export default function Home() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMemes, setExpandedMemes] = useState<Record<string, boolean>>({});

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

  const toggleExamples = (memeId: string) => {
    setExpandedMemes(prev => ({
      ...prev,
      [memeId]: !prev[memeId]
    }));
  };

  const getDisplayedExamples = (examples: string, memeId: string) => {
    const allExamples = examples.split('\n').filter(ex => ex.trim());
    if (!allExamples.length) return [];
    
    if (expandedMemes[memeId]) {
      return allExamples;
    }
    return allExamples.slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Meme Collection</h1>
          <Link 
            href="/generator"
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Create AI Captions
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
              <Link href={`/meme/${meme.id}`} key={meme.id} className="block transition-transform hover:scale-105">
                <div className="bg-white rounded-lg shadow-md p-4 h-full">
                  <div className="aspect-w-16 aspect-h-16 mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={meme.url}
                      alt={meme.name}
                      className="w-full h-auto object-contain rounded-md"
                    />
                  </div>
                  <h2 className="text-lg font-semibold text-center text-gray-800">{meme.name.replace(/-/g, ' ')}</h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 