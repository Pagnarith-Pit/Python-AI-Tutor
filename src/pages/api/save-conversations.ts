
import clientPromise from '@/lib/mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { conversations } = req.body;
    
    if (!conversations || !Array.isArray(conversations)) {
      return res.status(400).json({ error: "Invalid conversations data" });
    }

    const client = await clientPromise;
    const db = client.db('ChatHistory');
    const collection = db.collection('Chat');

    // Clear existing conversations and insert new ones
    await collection.deleteMany({});
    
    if (conversations.length > 0) {
      await collection.insertMany(conversations);
    }

    console.log("Saving conversations:", conversations);
    res.status(200).json({ message: "Conversations saved successfully" });
  } catch (error) {
    console.error("Error saving conversations:", error);
    res.status(500).json({ error: "Failed to save conversations" });
  }
}
