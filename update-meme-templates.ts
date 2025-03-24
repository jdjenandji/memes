import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Add global fetch for Node.js
global.fetch = fetch as any;

// Add type declarations
type Meme = {
  id: string;
  name: string;
  description: string;
  rules?: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_KEY ?? ''
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? ''
});

async function generateSchema(memeName: string, description: string) {
  const prompt = `For the "${memeName}" meme, describe the structure of the text fields needed (like "Top Caption / Bottom Caption" or "Not Sure If [caption]"). Keep it simple and use common patterns.

Meme description: ${description}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that describes meme text structures. Use simple patterns like 'Top Caption / Bottom Caption' or 'Not Sure If [caption]'. Keep it minimal and clear."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7
  });

  const schema = completion.choices[0].message.content;
  if (!schema) {
    throw new Error('No content received from OpenAI');
  }

  return schema.trim();
}

async function generateRules(memeName: string) {
  const prompt = `Create clear rules for creating good "${memeName}" memes. The rules should help users create engaging and appropriate memes that fit the format well.

Focus on:
1. How to use the meme format effectively
2. What makes this meme type funny/engaging
3. Common pitfalls to avoid
4. How to maintain the meme's style
5. Guidelines for appropriate content

Format the rules as a bullet point list.

Example format (for Futurama Fry meme):
- Both interpretations should relate to something discussed in the conversation
- The suspicious alternative should be unexpected yet plausible
- The contrast between the two interpretations should create humor
- The meme should reference group members, dynamics, or shared experiences
- The suspicion should be playful and not mean-spirited
- Both parts must be grammatically consistent with their prefixes
- The meme should never talk about JSON. Focus on the group and the conversation.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an expert at creating clear, helpful rules for meme formats. Your rules help users create engaging and appropriate memes."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7
  });

  const rules = completion.choices[0].message.content;
  if (!rules) {
    throw new Error('No content received from OpenAI');
  }

  return rules.trim();
}

async function updateMemeData() {
  // First, fetch all memes from Supabase
  const { data: memes, error: fetchError } = await supabase
    .from('memes')
    .select('*');

  if (fetchError) {
    console.error('Error fetching memes:', fetchError);
    return;
  }

  // Generate and update schema for each meme
  for (const meme of memes) {
    try {
      console.log(`Generating schema for ${meme.name}...`);
      const schema = await generateSchema(meme.name, meme.description);

      const { error } = await supabase
        .from('memes')
        .update({ 
          schema: schema
        })
        .eq('id', meme.id);

      if (error) {
        console.error(`Error updating ${meme.name} meme data:`, error);
      } else {
        console.log(`${meme.name} schema updated successfully`);
      }
    } catch (error) {
      console.error(`Error processing ${meme.name}:`, error);
    }
  }
}

async function updateMemeRules() {
  try {
    // Fetch all memes
    const { data: memes, error: fetchError } = await supabase
      .from('memes')
      .select('*');

    if (fetchError) throw fetchError;
    if (!memes) throw new Error('No memes found');

    console.log(`Found ${memes.length} memes. Generating rules...`);

    // Generate and update rules for each meme
    for (const meme of memes) {
      try {
        console.log(`Generating rules for: ${meme.name}`);
        const rules = await generateRules(meme.name);
        
        // Update the meme with new rules
        const { error: updateError } = await supabase
          .from('memes')
          .update({ rules })
          .eq('id', meme.id);

        if (updateError) throw updateError;
        
        console.log(`✓ Updated rules for: ${meme.name}`);
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error updating rules for ${meme.name}:`, error);
      }
    }

    console.log('Finished updating meme rules!');
  } catch (error) {
    console.error('Error in updateMemeRules:', error);
  }
}

// Export the functions
export { generateSchema, generateRules, updateMemeRules };

// If running directly (not imported as a module)
if (import.meta.url === import.meta.resolve(process.argv[1])) {
  updateMemeRules()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
} 