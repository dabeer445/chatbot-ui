import { NextApiRequest, NextApiResponse } from 'next';
import { MONGO_URI } from '@/utils/app/const';
import { MongoClient, ServerApiVersion } from 'mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {

  console.log(">>>", req.body)
  res.status(200).json({ answer:"AD" });

  // try {
  //   const mongo_client = new MongoClient(MONGO_URI, {
  //     serverApi: {
  //       version: ServerApiVersion.v1,
  //       strict: true,
  //       deprecationErrors: true,
  //     }
  //   });
      
  //   const data = await req.json();
  //   await mongo_client.connect();
  //   const db = mongo_client.db();
  //   const collection = db.collection('users');
  //   const result = await collection.insertOne(data)
  
    
  //   return new Response('Success', { status: 201 });
  // } catch (error) {
  //     return new Response('Error', { status: 500, statusText: "error.message" });
  // }
};

export default handler;
