import { NextApiRequest, NextApiResponse } from 'next';
import { OPENAI_API_KEY, OPENAI_ASSISTANT_ID } from '@/utils/app/const';
import { MongoClient, ServerApiVersion } from 'mongodb';
import clientPromise from '@/utils/mongodb';
import { ChatBody, Message } from '@/types/chat';
import OpenAI from 'openai';
import { queryDatabase } from '@/utils/mysql'

export const config = {
  maxDuration: 300,
};
const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {

  try {

    const { messages, convID, threadId } = req.body as ChatBody;
    let thread_id = threadId || '';

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const message: Message = messages[messages.length - 1];

    let run, keepRetrievingRun, conversation, mongo_client, db, collection;

    if (!thread_id) {
      mongo_client = await clientPromise; // Connect to MongoDB using the existing clientPromise
      await mongo_client.connect();
      db = mongo_client.db();
      collection = db.collection('users');


      const result = await collection.findOne({
        'conversations.id': convID,
      });
      console.log(result)
      if (result) {
        conversation = result.conversations.find((conv: { id: string; }) => conv.id === convID);
        thread_id = conversation.threadId;
      }
    }
    console.log(thread_id)

    if (!thread_id) {
      // console.log("2>",thread_id)
      // console.log('No thread for this convo');
      run = await openai.beta.threads.createAndRun({
        assistant_id: OPENAI_ASSISTANT_ID,
        thread: {
          messages: [{ role: 'user', content: message.content }],
        },
      });

      console.log('Created and ran thread with id: ', run.thread_id);

      await collection?.updateOne(
        { 'conversations.id': convID },
        {
          $set: { 'conversations.$.threadId': run.thread_id },
        }
      );

      console.log('Attached thread with id: ', run.thread_id, ' to ConvId: ', conversation.id);

      conversation.threadId = run.thread_id;
      thread_id = run.thread_id
    } else {
      // console.log('Thread with id: ', conversation.threadId, ' exists for ConvId: ', conversation.id);
      // console.log("3>",thread_id)

      const msg = await openai.beta.threads.messages.create(thread_id, {
        role: 'user',
        content: message.content,
      });

      run = await openai.beta.threads.runs.create(thread_id, {
        assistant_id: OPENAI_ASSISTANT_ID,
      });

      // console.log('Ran thread with id: ', run.thread_id);
    }

    console.log("Retrieving Run Now")
    keepRetrievingRun = await openai.beta.threads.runs.retrieve(thread_id, run.id);
    console.log(keepRetrievingRun)

    while (keepRetrievingRun.status !== 'completed' && keepRetrievingRun.status !== 'failed') {
    // while (keepRetrievingRun.status !== 'completed' || keepRetrievingRun.status !== 'failed') {
      console.log(keepRetrievingRun.status);
      keepRetrievingRun = await openai.beta.threads.runs.retrieve(thread_id, run.id);

      if (keepRetrievingRun.status == 'requires_action') {
        const tool_calls:any = keepRetrievingRun?.required_action?.submit_tool_outputs.tool_calls[0]
        let { query } = JSON.parse(tool_calls.function.arguments)
        console.log(query);
        if (query.search("LIMIT")<0){
          query = query.replace(";",'') + " LIMIT 5"
        }
        const result = await queryDatabase(query);
        console.log(result);
        await openai.beta.threads.runs.submitToolOutputs(
          thread_id,
          run.id,
          {
            tool_outputs: [
              {
                tool_call_id: tool_calls.id,
                output: JSON.stringify(result),
              }
            ],
          }
        );
        // console.log(keepRetrievingRun.required_action.submit_tool_outputs.tool_calls[0].function.arguments)
        // break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));

    }

    if(keepRetrievingRun.status == 'failed'){
      console.log(keepRetrievingRun)
      throw new Error(JSON.stringify(keepRetrievingRun));
    }
    const threadMessages = await openai.beta.threads.messages.list(thread_id);

    const lastMes: any = threadMessages.data[0];
    const lastMsgContent = lastMes.content[0].text.value;
    console.log(lastMsgContent);

    res.status(200).json({
      threadId: run.thread_id,
      data: lastMsgContent,
    });

    // return new Response('Success', { status: 201 });
  } catch (error) {
    res.status(500).json({ error: error });
    // return new Response('Error', { status: 500, statusText: "error.message" });
  }
};

export default handler;
