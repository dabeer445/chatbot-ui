import { NextApiRequest, NextApiResponse } from 'next';
import { MONGO_URI } from '@/utils/app/const';
import { MongoClient, ServerApiVersion } from 'mongodb';
import clientPromise from '@/utils/mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const { conversations, userId } = req.body;

    const mongo_client = await clientPromise;

    // const data = await req.json();
    await mongo_client.connect();
    const db = mongo_client.db();
    const collection = db.collection('users');

    const result = await collection.findOne({
      'userId': userId,
    });
    if (result) {
      await collection.updateOne(
        { 'userId': userId },
        {
          $set: { 'conversations': conversations },
        }
      );
    }else{
      await collection.insertOne(req.body)
    }


    res.status(201).json({ result: result });
    // return new Response('Success', { status: 201 });
  } catch (error) {
    res.status(500).json({ error: error });
    // return new Response('Error', { status: 500, statusText: "error.message" });
  }
};

export default handler;
