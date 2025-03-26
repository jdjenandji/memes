'use client';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

export default function MemePage() {
  const params = useParams();
  const [meme, setMeme] = useState<Meme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllExamples, setShowAllExamples] = useState(false);

  useEffect(() => {
    async function fetchMeme() {
      try {
        const { data, error } = await supabase
          .from('memes')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setMeme(data);
      } catch (error) {
        console.error('Error fetching meme:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchMeme();
    }
  }, [params.id]);

  const getDisplayedExamples = (examples: string) => {
    const allExamples = examples.split('\n').filter(ex => ex.trim());
    if (!allExamples.length) return [];
    
    if (showAllExamples) {
      return allExamples;
    }
    return allExamples.slice(0, 3);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meme...</p>
        </div>
      </div>
    );
  }

  if (!meme) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Meme Not Found</h1>
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const examples = getDisplayedExamples(meme.example);
  const hasMoreExamples = meme.example.split('\n').filter(ex => ex.trim()).length > 3;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{meme.name.replace(/-/g, ' ')}</h1>
            <Link 
              href="/"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <div className="space-y-8">
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={meme.url}
                alt={meme.name}
                className="max-w-full h-auto object-contain rounded-md shadow-lg"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
                <p className="text-gray-600">{meme.description}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Caption Format</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="font-mono text-gray-700">{meme.schema}</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Examples</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="space-y-2">
                    {examples.map((example, index) => (
                      <p key={index} className="text-gray-700">{example}</p>
                    ))}
                  </div>
                  {hasMoreExamples && (
                    <button
                      onClick={() => setShowAllExamples(!showAllExamples)}
                      className="text-blue-500 hover:text-blue-600 mt-3 text-sm font-medium focus:outline-none"
                    >
                      {showAllExamples ? 'Show Less' : 'Show More Examples'}
                    </button>
                  )}
                </div>
              </div>

              {meme.rules && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Rules for Best Results</h2>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="space-y-2">
                      {meme.rules.split('\n').map((rule, index) => (
                        rule.trim() && (
                          <p key={index} className="flex items-start text-gray-700">
                            {rule.startsWith('-') ? (
                              <>
                                <span className="text-blue-500 mr-2">•</span>
                                <span>{rule.substring(1).trim()}</span>
                              </>
                            ) : (
                              <span>{rule}</span>
                            )}
                          </p>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Link
                  href="/generator"
                  className="inline-block px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-center w-full"
                >
                  Generate AI Caption for This Meme
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 