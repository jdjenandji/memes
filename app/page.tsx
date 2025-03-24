'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import Link from 'next/link';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface MemeWithCaption {
  id: string;
  name: string;
  url: string;
  description: string;
  caption: string;
}

export default function Home() {
  const [memes, setMemes] = useState<MemeWithCaption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedText, setUploadedText] = useState<string>('');
  const [allMemes, setAllMemes] = useState<any[]>([]);

  const generateCaption = async (description: string, context: string) => {
    try {
      // Truncate context to last 500 lines
      const truncatedContext = context.split('\n').slice(-500).join('\n');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            role: "system",
            content: `You are an expert at creating meme captions that match the meme's format and style. 
            You will be given a meme's description and some context, and you need to generate a caption that:
            1. Follows the meme's typical format as described
            2. Relates to the provided context
            3. Maintains the humor and style of the meme
            4. Is concise and punchy`
          },
          {
            role: "user",
            content: `Meme description: ${description}
            
            Context to relate to: ${truncatedContext}
            
            Generate a caption that fits this meme's format while relating to the provided context.`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      });

      return response.choices[0]?.message?.content || "Failed to generate caption";
    } catch (error) {
      console.error('Error generating caption:', error);
      return "Failed to generate caption";
    }
  };

  const generateRandomMeme = async () => {
    if (!uploadedText || allMemes.length === 0) return;

    setIsLoading(true);
    try {
      // Randomly select one meme
      const randomMeme = allMemes[Math.floor(Math.random() * allMemes.length)];
      
      // Generate caption for the random meme
      const memeWithCaption = {
        ...randomMeme,
        caption: await generateCaption(randomMeme.description, uploadedText)
      };

      // Add new meme to existing ones instead of replacing
      setMemes(prevMemes => [...prevMemes, memeWithCaption]);
    } catch (error) {
      console.error('Error generating meme:', error);
      alert('Error generating meme. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      setUploadedText(text);
      
      // Fetch all memes from Supabase
      const { data, error } = await supabase
        .from('memes')
        .select('*');

      if (error) throw error;

      setAllMemes(data || []);

      // Randomly select one meme
      const randomMeme = data[Math.floor(Math.random() * data.length)];
      
      // Generate caption for the random meme
      const memeWithCaption = {
        ...randomMeme,
        caption: await generateCaption(randomMeme.description, text)
      };

      // Reset memes array with first meme when uploading new file
      setMemes([memeWithCaption]);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">AI Meme Caption Generator</h1>
            <Link 
              href="/all-memes"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              View All Memes
            </Link>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Upload TXT File
            </label>
            <p className="mt-2 text-sm text-gray-500">Upload a text file to generate contextual meme captions</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating AI captions...</p>
          </div>
        ) : memes.length > 0 ? (
          <div className="grid gap-6">
            {memes.map((meme, index) => (
              <div key={`${meme.id}-${index}`} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-96 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={meme.url}
                      alt={meme.name}
                      className="w-full h-auto object-contain rounded-md"
                    />
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-xl font-semibold mb-2">{meme.name.replace(/-/g, ' ')}</h2>
                    <div className="prose prose-sm">
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-500">AI Generated Caption:</h3>
                        <p className="text-gray-900 text-lg font-medium mb-6">{meme.caption}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400">Original Description:</h3>
                        <p className="text-gray-500 text-sm">{meme.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center mt-6">
              <button
                onClick={generateRandomMeme}
                className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-lg font-medium"
                disabled={isLoading}
              >
                Generate Another Meme
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
