# Meme Caption Generator

A Next.js application that generates contextual meme captions using AI. Upload text and get AI-generated captions for memes that match your content.

## Features

- Upload text files to provide context
- Generate AI captions for memes using GPT-4
- View all memes in the collection
- Responsive design for all screen sizes
- Integration with Supabase for meme storage

## Tech Stack

- Next.js 15.2.3
- TypeScript
- Tailwind CSS
- OpenAI GPT-4
- Supabase

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_KEY=your_supabase_key
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

This project can be deployed on Vercel with automatic deployments configured through GitHub.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
