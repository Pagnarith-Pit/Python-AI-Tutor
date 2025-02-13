import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: "Conversation ID is required" });
    }

    const client = await clientPromise;
    const db = client.db('ChatHistory');
    const collection = db.collection('Chat');

    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    console.log("Deleting conversation with ID:", id);
    res.status(200).json({ 
      success: true, 
      message: "Conversation deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ 
      error: "Failed to delete conversation",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
