import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/utils/mongodb';
import { MongoClient,ServerApiVersion } from 'mongodb';
import { MONGO_URI } from '@/utils/app/const';
const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    try {
        const { userId } = req.body;
        

        const mongo_client = await clientPromise;
        await mongo_client.connect();
        const db = mongo_client.db();
        const collection = db.collection('users');

        const result = await collection.findOne({
            'userId': userId,
        });
        res.status(201).json({ conversations: result.conversations || [] });
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

export default handler;
