'use client';

import { useState, useEffect } from 'react';
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
  schema: string;
  caption: string;
  rules: string;
  captions: string[];
}

export default function Home() {
  const [memes, setMemes] = useState<MemeWithCaption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedText, setUploadedText] = useState<string>('');
  const [allMemes, setAllMemes] = useState<any[]>([]);
  const [selectedMemeId, setSelectedMemeId] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  // Fetch memes when component loads
  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const { data, error } = await supabase
          .from('memes')
          .select('*');

        if (error) throw error;
        setAllMemes(data || []);
      } catch (error) {
        console.error('Error fetching memes:', error);
        alert('Error loading memes. Please refresh the page.');
      }
    };

    fetchMemes();
  }, []);

  const generateCaption = async (description: string, schema: string, context: string, rules: string, previousCaptions: string[]) => {
    try {
      // Truncate context to last 500 lines
      const truncatedContext = context.split('\n').slice(-500).join('\n');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            role: "system",
            content: `You are an expert at creating meme captions that match the meme's format and style. 
            You will be given:
            1. A meme's description
            2. Its text schema format
            3. Specific rules for this meme
            4. Examples of previous captions
            5. Context to relate to
            
            Generate a caption that:
            1. Strictly follows the meme's schema format
            2. Adheres to all provided rules
            3. Relates to the provided context
            4. Is different from previous captions
            5. Maintains the humor and style of the meme
            6. Is concise and punchy
            
            The schema describes the structure of text fields needed for the meme (e.g. "Top Caption / Bottom Caption" or "Not Sure If [caption]").
            Your response should exactly match this schema format.`
          },
          {
            role: "user",
            content: `Meme description: ${description}
            
            Meme schema: ${schema}
            
            Specific rules:
            ${rules}
            
            Previous captions:
            ${previousCaptions.map(cap => `- ${cap}`).join('\n')}
            
            Context to relate to: ${truncatedContext}
            
            Generate a caption that fits this meme's schema format while relating to the provided context and following the rules.`
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

  const generateMeme = async () => {
    if (!uploadedText || !selectedMemeId || allMemes.length === 0) {
      alert('Please select a meme and upload a text file first.');
      return;
    }

    setIsLoading(true);
    try {
      // Find the selected meme
      const selectedMeme = allMemes.find(meme => meme.id === selectedMemeId);
      if (!selectedMeme) {
        throw new Error('Selected meme not found');
      }
      
      // Generate caption for the selected meme
      const memeWithCaption = {
        ...selectedMeme,
        caption: await generateCaption(
          selectedMeme.description, 
          selectedMeme.schema, 
          uploadedText,
          selectedMeme.rules || '',
          selectedMeme.captions || []
        )
      };

      // Add new meme to existing ones
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
      setFileName(file.name);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMeme = allMemes.find(meme => meme.id === selectedMemeId);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">AI Meme Caption Generator</h1>
            <Link 
              href="/"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Back to Memes
            </Link>
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="meme-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select a Meme Example
              </label>
              <select
                id="meme-select"
                value={selectedMemeId}
                onChange={(e) => setSelectedMemeId(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a meme...</option>
                {allMemes.map((meme) => (
                  <option key={meme.id} value={meme.id}>
                    {meme.name.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {selectedMeme && (
              <div className="border-t pt-6">
                <div className="flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedMeme.url}
                    alt={selectedMeme.name}
                    className="w-64 h-auto object-contain rounded-md mb-4"
                  />
                  <p className="text-sm text-gray-600 mb-2">{selectedMeme.description}</p>
                  <div className="text-sm bg-gray-50 p-3 rounded-md w-full max-w-md">
                    <h3 className="font-semibold text-gray-700 mb-1">Caption Format:</h3>
                    <p className="text-gray-600 font-mono">{selectedMeme.schema}</p>
                  </div>
                  {selectedMeme.rules && (
                    <div className="mt-4 w-full max-w-md">
                      <h3 className="font-semibold text-gray-700 mb-2">Rules for Best Results:</h3>
                      <div className="bg-blue-50 p-4 rounded-md">
                        <div className="space-y-2">
                          {selectedMeme.rules.split('\n').map((rule: string, index: number) => (
                            rule.trim() && (
                              <p key={index} className="flex items-start text-sm">
                                {rule.startsWith('-') ? (
                                  <>
                                    <span className="text-blue-500 mr-2">•</span>
                                    <span className="text-gray-700">{rule.substring(1).trim()}</span>
                                  </>
                                ) : (
                                  <span className="text-gray-700">{rule}</span>
                                )}
                              </p>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <div className={`border-2 ${uploadedText ? 'border-green-300 bg-green-50' : 'border-gray-300'} border-dashed rounded-lg p-6 text-center`}>
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
                  {uploadedText ? 'Change File' : 'Upload TXT File'}
                </label>
                {uploadedText ? (
                  <div className="mt-2">
                    <p className="text-sm text-green-600 font-medium">✓ File uploaded: {fileName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {uploadedText.length.toLocaleString()} characters • {uploadedText.split('\n').length.toLocaleString()} lines
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">Upload a text file to generate contextual meme captions</p>
                )}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={generateMeme}
                className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !selectedMemeId || !uploadedText}
              >
                Generate Caption
              </button>
            </div>
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
                        <p className="text-gray-900 text-lg font-medium mb-2">{meme.caption}</p>
                        <div className="text-xs bg-gray-50 p-2 rounded">
                          <span className="font-semibold text-gray-500">Format: </span>
                          <span className="text-gray-600 font-mono">{meme.schema}</span>
                        </div>
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
          </div>
        ) : null}
      </div>
    </div>
  );
}
