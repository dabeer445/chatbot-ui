import { Message } from '@/types/chat';
import { OpenAIModel, Thread, Messages } from '@/types/openai';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import OpenAI from "openai";

import { AZURE_DEPLOYMENT_ID, OPENAI_API_HOST, OPENAI_API_TYPE, OPENAI_API_VERSION, OPENAI_ORGANIZATION, OPENAI_ASSISTANT_ID, MONGO_URI } from '../app/const';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';

export class OpenAIError extends Error {
  type: string;
  param: string;
  code: string;

  constructor(message: string, type: string, param: string, code: string) {
    super(message);
    this.name = 'OpenAIError';
    this.type = type;
    this.param = param;
    this.code = code;
  }
}

export const OpenAIStream = async (
  model: OpenAIModel,
  systemPrompt: string,
  temperature: number,
  key: string,
  messages: Message[],
) => {
  let url = `${OPENAI_API_HOST}/v1/chat/completions`;
  if (OPENAI_API_TYPE === 'azure') {
    url = `${OPENAI_API_HOST}/openai/deployments/${AZURE_DEPLOYMENT_ID}/chat/completions?api-version=${OPENAI_API_VERSION}`;
  }
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(OPENAI_API_TYPE === 'openai' && {
        Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`
      }),
      ...(OPENAI_API_TYPE === 'azure' && {
        'api-key': `${key ? key : process.env.OPENAI_API_KEY}`
      }),
      ...((OPENAI_API_TYPE === 'openai' && OPENAI_ORGANIZATION) && {
        'OpenAI-Organization': OPENAI_ORGANIZATION,
      }),
    },
    method: 'POST',
    body: JSON.stringify({
      ...(OPENAI_API_TYPE === 'openai' && { model: model.id }),
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: temperature,
      stream: true,
    }),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const result = await res.json();
    if (result.error) {
      throw new OpenAIError(
        result.error.message,
        result.error.type,
        result.error.param,
        result.error.code,
      );
    } else {
      throw new Error(
        `OpenAI API returned an error: ${decoder.decode(result?.value) || result.statusText
        }`,
      );
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          try {
            const json = JSON.parse(data);
            if (json.choices[0].finish_reason != null) {
              controller.close();
              return;
            }
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};

export const AssistantStream = async (
  message: string,
  convID: string,
) => {
  // CEnnrhnm0ysix8P6
  // const openai = new OpenAI({
  //   apiKey: process.env.OPENAI_API_KEY, // Replace with your OpenAI API key
  // });
  // const mongo_client = new MongoClient(MONGO_URI, {
  //   serverApi: {
  //     version: ServerApiVersion.v1,
  //     strict: true,
  //     deprecationErrors: true,
  //   }
  // });
    
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'OpenAI-Beta': 'assistants=v1',
  }

  const createMessage = (threadID: string, message: string) => {
    return new Promise(async (resolve, reject) => {

      let url = `${OPENAI_API_HOST}/v1/threads/${threadID}/messages`;
      const resp = await fetch(url, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({
          "role": "user",
          "content": message
        }),
      });
      const res = await resp.json()
      resolve(res);
    });

  }
  const createThreadAndRun = (assistantId: string, message: string) => {
    return new Promise(async (resolve, reject) => {

      let url = `${OPENAI_API_HOST}/v1/threads/runs`;
      const resp = await fetch(url, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify(
          {
            "assistant_id": assistantId,
            "thread": {
              "messages": [
                {"role": "user", "content": message}
              ]
            }
          }),
      });
      const res = await resp.json()
      resolve(res);
    });

  }
  const createRun = (threadID: string, assistantId: string): Promise<Thread> => {
    return new Promise(async (resolve, reject) => {

      let url = `${OPENAI_API_HOST}/v1/threads/${threadID}/runs`;
      const resp = await fetch(url, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({
          "assistant_id": assistantId
        }),
      });
      const res = await resp.json()
      resolve(res);
    });

  }
  const retrieveRun = (threadID: string, runID: string) => {
    return new Promise(async (resolve, reject) => {
      let keepRetrieving = true;

      let url = `${OPENAI_API_HOST}/v1/threads/${threadID}/runs/${runID}`;
      while(keepRetrieving){
          const resp = await fetch(url, {
            headers: headers,
            method: 'GET',
          });
          let status = await resp.json()
          // console.log(status.status) 
          if(status.status=="completed"){
            keepRetrieving = false
          }
        }
      resolve('');
    });

  }

  const retrieveMsg = (threadID: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {

      let url = `${OPENAI_API_HOST}/v1/threads/${threadID}/messages `;
      const resp = await fetch(url, {
        headers: headers,
        method: 'GET',
      });
      const res = await resp.json()
      resolve(res);
    });

  }
  let myRun: Thread, threadId;

  // await mongo_client.connect();
  // const db = mongo_client.db();
  // const collection = db.collection('users');
  // const result = await collection.findOne({
  //   'conversations.id': convID,
  // });

  /*if (result) {
    // Extract the threadId from the matching conversation
    const conversation = result.conversations.find(conv => conv.id === convID);
    threadId = conversation.threadId;

    let msg = await createMessage(threadId, message)
    myRun = await createRun(threadId, OPENAI_ASSISTANT_ID)

  } else {
    myRun = await createThreadAndRun(OPENAI_ASSISTANT_ID, message)

    collection.updateOne(
      { 'conversations.id': convID },
      { $set: { 'conversations.$.threadId': myRun?.thread_id } }
    );
    
  }
  let run = await retrieveRun(myRun?.thread_id, myRun?.id)
  
  const allMessages = await retrieveMsg(myRun?.thread_id);

  return allMessages?.data[0].content[0].text.value;
*/
//   const result = await db.collection('posts').insertOne({postid:1, content:"ASDASDSDSD asd asdasda", type:{user:1,msg:['asd','asdas']}})
  const threadID = "thread_blt8QmSZOF86eBV1JxcZk0gj";

  let msg = await createMessage(threadID, message)
  myRun = await createRun(threadID, OPENAI_ASSISTANT_ID)
  let run = await retrieveRun(threadID, myRun.id)

  const allMessages = await retrieveMsg(threadID);

  return allMessages.data[0].content[0].text.value;
  // const retrieveRun = async () => {
  //   let keepRetrievingRun;

  //   while (myRun.status !== 'completed') {
  //     keepRetrievingRun = await openai.beta.threads.runs.retrieve(
  //       threadID, // Use the stored thread ID for this user
  //       myRun.id,
  //     );

  //     if (keepRetrievingRun.status === 'completed') {
  //       break;
  //     }
  //   }
  // };
  // const waitForAssistantMessage = async () => {
  //   await retrieveRun();

  //   const allMessages = await openai.beta.threads.messages.list(
  //     threadID, // Use the stored thread ID for this user
  //   );
  //   return allMessages.data[0].content[0].text.value;
  // };
  // const waitForAssistantMessage = (threadID, runID) => {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       await retrieveRun(threadID, runID);

  //       // const allMessages = await openai.beta.threads.messages.list(
  //       //   threadID, // Use the stored thread ID for this user
  //       // );
  //       const allMessages = await retrieveMsg(threadID);
  //       console.log(allMessages)
  //       // const messageText = allMessages.data[0].content[0].text.value;

  //       resolve(allMessages.data[0]);
  //     } catch (error) {
  //       reject(error);
  //     }
  //   });
  // };
  console.log("RUNNING")

  // const result = await waitForAssistantMessage(threadID, myRun.id);
  // console.log(result)

  // return result;
};


export const LangAIStream = async (
  model: OpenAIModel,
  systemPrompt: string,
  temperature: number,
  key: string,
  messages: Message[],
) => {
  // let url = `${OPENAI_API_HOST}/v1/chat/completions`;
  // if (OPENAI_API_TYPE === 'azure') {
  //   url = `${OPENAI_API_HOST}/openai/deployments/${AZURE_DEPLOYMENT_ID}/chat/completions?api-version=${OPENAI_API_VERSION}`;
  // }

  // const res = await fetch(url, {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     ...(OPENAI_API_TYPE === 'openai' && {
  //       Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`
  //     }),
  //     ...(OPENAI_API_TYPE === 'azure' && {
  //       'api-key': `${key ? key : process.env.OPENAI_API_KEY}`
  //     }),
  //     ...((OPENAI_API_TYPE === 'openai' && OPENAI_ORGANIZATION) && {
  //       'OpenAI-Organization': OPENAI_ORGANIZATION,
  //     }),
  //   },
  //   method: 'POST',
  //   body: JSON.stringify({
  //     ...(OPENAI_API_TYPE === 'openai' && {model: model.id}),
  //     messages: [
  //       {
  //         role: 'system',
  //         content: systemPrompt,
  //       },
  //       ...messages,
  //     ],
  //     max_tokens: 1000,
  //     temperature: temperature,
  //     stream: true,
  //   }),
  // });
  // 
  // 
  // if (res.status !== 200) {
  //   const result = await res.json();
  //   if (result.error) {
  //     throw new OpenAIError(
  //       result.error.message,
  //       result.error.type,
  //       result.error.param,
  //       result.error.code,
  //     );
  //   } else {
  //     throw new Error(
  //       `OpenAI API returned an error: ${
  //         decoder.decode(result?.value) || result.statusText
  //       }`,
  //     );
  //   }
  // }
  // const body = {
  //   input: [
  //     {
  //       content: messages.pop()?.content,
  //       type: "human",
  //     },
  //   ],
  // }
  const body = {
    "input": { "input": messages.pop()?.content }
  }
  const res = await fetch(
    "http://localhost:8000/agent/stream",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let end = 0;

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          try {
            const json = JSON.parse(data);

            if (json.content == '') {
              end++;
            }
            if (end == 2) {
              controller.close();
              return;
            }

            if (json.output) {
              // const headers = new Headers()
              // headers.append("Content-Type", "application/json")
              // fetch("https://enxiax1m81c0k.x.pipedream.net/", {
              //   method: "POST",
              //   headers,
              //   mode: "cors",
              //   body: JSON.stringify(json.output),
              // })
              const text = json.output;
              const queue = encoder.encode(text);
              controller.enqueue(queue);
              controller.close();
              return;

            }
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));

      }
    },
  });

  return stream;
};
