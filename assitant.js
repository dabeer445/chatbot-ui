const OpenAI = require('openai');
// import { OpenAI } from 'openai';
const { MongoClient, ServerApiVersion } = require('mongodb');
// const mongoose = require('mongoose')
// import mysql from 'mysql2/promise';
const mysql = require('mysql2/promise');
const { create } = require('domain');
const uri =
  'mongodb+srv://dabeer445:CEnnrhnm0ysix8P6@consenna.xkh2alz.mongodb.net/?retryWrites=true&w=majority';

const openai = new OpenAI({
  apiKey: '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', // Replace with your OpenAI API key
});
let threadID = 'thread_do7JgezgQemZTcPE18Y3035o',
  userMessage = 'remove the investment part.',
  assistantIdToUse = 'asst_cMgdFuNok7dXxauOun9iWprw';
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'consenna',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
async function queryDatabase(query) {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(query);
    return rows;
  } finally {
    connection.release();
  }
}
async function actions() {
  let threadID = 'thread_EODNXGTXA84ZubKTyl8HLRBR';
  const connection = await pool.getConnection();

  const msg = await openai.beta.threads.messages.create(threadID, {
    role: 'user',
    content: 'Please show soe i7 laptops',
  });

  run = await openai.beta.threads.runs.create(threadID, {
    assistant_id: 'asst_k4ZtMqcXePcnnABCqUj5Ea6I',
  });
  keepRetrievingRun = await openai.beta.threads.runs.retrieve(threadID, run.id);

  while (keepRetrievingRun.status !== 'completed') {
    // console.log(keepRetrievingRun.status);
    await new Promise((resolve) => setTimeout(resolve, 500));
    keepRetrievingRun = await openai.beta.threads.runs.retrieve(
      threadID,
      run.id,
    );
    if (keepRetrievingRun.status == 'requires_action') {
      const tool_calls =
        keepRetrievingRun.required_action.submit_tool_outputs.tool_calls[0];
      let { query } = JSON.parse(tool_calls.function.arguments);
      const result = await queryDatabase(query);
      await openai.beta.threads.runs.submitToolOutputs(threadID, run.id, {
        tool_outputs: [
          {
            tool_call_id: tool_calls.id,
            output: JSON.stringify(result),
          },
        ],
      });
      console.log(
        keepRetrievingRun.required_action.submit_tool_outputs.tool_calls[0]
          .function.arguments,
      );
      // break;
    }
    // const sqlQuery = 'SELECT * FROM products LIMIT 5';

    // // Execute the query
    // const result = await queryDatabase(sqlQuery);
  }
  const threadMessages = await openai.beta.threads.messages.list(threadID);

  console.log(threadMessages.data[0].content[0].text.value);
}

async function main() {
  //   const myThread = await openai.beta.threads.create();
  const threadID = 'thread_do7JgezgQemZTcPE18Y3035o';
  //   const threadID = myThread.id;
  const myThreadMessage = await openai.beta.threads.messages.create(
    threadID, // Use the stored thread ID for this user
    {
      role: 'user',
      content: userMessage,
    },
  );
  console.log('This is the message object: ', myThreadMessage, '\n');

  const myRun = await openai.beta.threads.runs.create(threadID, {
    assistant_id: assistantIdToUse,
  });
  console.log('This is the run object: ', myRun, '\n');

  // Periodically retrieve the Run to check on its status
  const retrieveRun = async () => {
    let keepRetrievingRun;

    while (myRun.status !== 'completed') {
      keepRetrievingRun = await openai.beta.threads.runs.retrieve(
        threadID, // Use the stored thread ID for this user
        myRun.id,
      );

      //   console.log(`Run status: ${keepRetrievingRun.status}`);
      console.log(`.`);

      if (keepRetrievingRun.status === 'completed') {
        console.log('\n');
        break;
      }
    }
  };
  //   retrieveRun();
  // Retrieve the Messages added by the Assistant to the Thread
  const waitForAssistantMessage = async () => {
    await retrieveRun();

    const allMessages = await openai.beta.threads.messages.list(
      threadID, // Use the stored thread ID for this user
    );
    console.log('\n\nAssistant: ', allMessages.data[0].content[0].text.value);
    return allMessages.data[0].content[0].text.value;
  };
  return waitForAssistantMessage();
}
async function ma() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  // mongoose
  await client.connect();
  const db = client.db('test');
  const collection = db.collection('users');

  //   const result = await db.collection('posts').insertOne({postid:1, content:"ASDASDSDSD asd asdasda", type:{user:1,msg:['asd','asdas']}})
  //   const result = await db.collection('users').insertOne({
  //     userId: 1,
  //     folders: [
  //       {
  //         id: '5eafdcce-7072-4019-8f2a-a165932e9d45',
  //         name: 'New folder',
  //         type: 'chat',
  //       },
  //       {
  //         id: '9795be83-a53b-40ff-ada7-ae8345fec2b1',
  //         name: 'New folder',
  //         type: 'chat',
  //       },
  //     ],
  //     conversations: [
  //       {
  //         id: 'e005586c-2045-42a1-b42d-310b32950d19',
  //         name: 'can you help me write a sales ...',
  //         messages: [
  //           {
  //             role: 'user',
  //             content:
  //               'can you help me write a sales proposal for HP Z portfolio laptops',
  //           },
  //           {
  //             role: 'assistant',
  //             content:
  //               "# ChatGPT User Manual\n\nWelcome to ChatGPT! I'm an AI language model developed by OpenAI. I'm here to assist you with various tasks, answer questions, engage in discussions, and much more. You can interact with me by providing instructions in plain English. Here's a guide to help you make the most of our conversation:\n\n## Format and Instructions\n\nTo communicate effectively with me, please provide your instructions in the following format:\n- **Normal sentence**: Just type your message as a normal sentence, like you would with any conversation partner.\n\n## Examples & Prompts\n\nFeel free to ask questions or give prompts using normal conversational language. Here are a few examples to help you get started:\n\n1. **Q: What is the capital of France?**\n2. **Could you explain the concept of nuclear fusion?**\n3. **Can you list some popular novels?**\n\nRemember, the more detailed and specific your question or prompt is, the better my response is likely to be.\n\n## System Messages\n\nThroughout our conversation, you may see system messages that help clarify certain behaviors of the model or provide additional information. These messages are prefixed with 'SYSTEM:' to differentiate them from user instructions.\n\n## Limitations\n\nAlthough I can generate human-like responses and provide useful information, it's important to note that I have certain limitations:\n- **I may not always ask for clarifications**: If something is ambiguous, I'll try to provide an answer or response based on my understanding, but I may not always prompt for clarifications if the instruction is unclear.\n- **I'm sensitive to phrasing**: The way you phrase a question or prompt can sometimes affect my response. If you're not satisfied with an answer, consider rephrasing your instruction.\n- **I don't have real-time information**: My responses are based on patterns and information available in the training data. So, if you ask about recent events or real-time data, my information might not be up to date.\n\n## Feedback\n\nWhile I strive to provide accurate and helpful responses, there might be times when I make mistakes or generate inappropriate content. OpenAI and the developers of ChatGPT greatly appreciate user feedback to improve the system. If you notice any issues or have suggestions, please let us know.\n\nNow that you're familiar with the guidelines, feel free to start interacting with me. I'm here to assist you!",
  //           },
  //           {
  //             role: 'assistant',
  //             content: '',
  //           },
  //         ],
  //         threadId: 'thread_do7JgezgQemZTcPE18Y3035o',
  //         folderId: '5eafdcce-7072-4019-8f2a-a165932e9d45',
  //       },
  //       {
  //         id: '6862900f-bfc0-47fb-8489-0ad90587875d',
  //         name: 'Dabeer',
  //         messages: [],
  //         threadId: 'thread_5',
  //         folderId: null,
  //       },
  //       {
  //         id: 'a60ac5af-901d-4839-b43f-031b20bed867',
  //         name: 'Hey can you give me code for l...',
  //         messages: [
  //           {
  //             role: 'user',
  //             content: 'Hey can you give me code for login screen?',
  //           },
  //           {
  //             role: 'assistant',
  //             content:
  //               'Sure! Here\'s an example of a simple login screen using Python\'s Tkinter library:\n\n```python\nfrom tkinter import *\n\ndef login():\n    username = username_entry.get()\n    password = password_entry.get()\n    \n    # Check if the username and password combination is valid\n    if username == "admin" and password == "password":\n        login_message.config(text="Login successful!")\n    else:\n        login_message.config(text="Invalid username or password")\n\n# Create the main window\nwindow = Tk()\nwindow.title("Login Screen")\n\n# Create labels, entries, and button widgets\nusername_label = Label(window, text="Username:")\nusername_label.pack()\nusername_entry = Entry(window)\nusername_entry.pack()\n\npassword_label = Label(window, text="Password:")\npassword_label.pack()\npassword_entry = Entry(window, show="*")\npassword_entry.pack()\n\nlogin_button = Button(window, text="Login", command=login)\nlogin_button.pack()\n\nlogin_message = Label(window, text="")\nlogin_message.pack()\n\n# Start the main event loop\nwindow.mainloop()\n```\n\nThis code uses the Tkinter library to create a basic login screen with a username and password input fields, a login button, and a label for displaying login messages. When the login button is clicked, the `login` function is called which checks if the entered username and password match the',
  //           },
  //         ],
  //         threadId: 'thread_2',
  //         folderId: null,
  //       },
  //       {
  //         id: '9f69e153-9eb6-4b6f-be05-ad445a7504ff',
  //         name: 'can you help me write a sales ...',
  //         messages: [
  //           {
  //             role: 'user',
  //             content: 'can you help me write a sales proposal?',
  //           },
  //           {
  //             role: 'assistant',
  //             content:
  //               'event: metadata\r\ndata: {"run_id": "0ce5415b-b131-4659-a4bb-24b8c8f99444"}\r\n\r\nevent: data\r\ndata: {"content":"","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":"Of","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" course","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":"!","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" I","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":"\'d","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" be","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" happy","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" to","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" help","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" you","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" write","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" a","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" sales","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" proposal","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":".","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" To","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" get","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" started","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":",","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" please","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" provide","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" me","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" with","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" some","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" information","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" about","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" the","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" product","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" or","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" service","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" you","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" are","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" selling","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":",","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" your","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" target","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" audience","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":",","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" and","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" any","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" specific","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" details","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" or","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" objectives","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" you","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" would","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" like","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" to","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" include","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" in","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" the","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":" proposal","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":".","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: data\r\ndata: {"content":"","additional_kwargs":{},"type":"AIMessageChunk","example":false}\r\n\r\nevent: end\r\n\r\n',
  //           },
  //           {
  //             role: 'user',
  //             content: 'cats',
  //           },
  //           {
  //             role: 'assistant',
  //             content:
  //               'Sure, I can help you write a sales proposal for a product or service related to cats. To get started, please provide me with some information about the specific product or service you are offering in relation to cats, your target audience, and any specific details or objectives you would like to include in the',
  //           },
  //           {
  //             role: 'user',
  //             content: 'cats',
  //           },
  //           {
  //             role: 'assistant',
  //             content:
  //               "I apologize for the confusion. If you're looking to write a sales proposal for a product or service related to cats, please provide me with more details about the specific product or service you have in mind. Additionally, let me know who your target audience is and any specific objectives or details you would like to include in the proposal. This will help me tailor the proposal to your specific needs",
  //           },
  //           {
  //             role: 'user',
  //             content: 'its a black cat',
  //           },
  //         ],
  //         threadId: 'thread_4',
  //         folderId: null,
  //       },
  //       {
  //         id: 'bc892023-06b2-41f1-9312-59ab5d633561',
  //         name: 'New Conversation',
  //         messages: [],
  //         threadId: 'thread_5',
  //         folderId: null,
  //       },
  //     ],
  //   });
  conversationId = 'b4ab10dd-6259-4465-b288-75cf916bf990';
  user_id = 'user_2YU0pF73npoA2AHerT1u1tEjIsV';
  conversations = ['a', 'asd', 'asd'];
  const result = await collection.findOne({
    userId: user_id,
    // 'conversations.id': conversationId,
  });
  console.log(result);
  // if (result) {
  //   await collection.updateOne(
  //     { 'userId': user_id },
  //     {
  //       $set: { 'conversations': conversations },
  //     }
  //   );
  // }else{
  //   await collection.insertOne(req.body)
  // }

  // if (result) {
  //   // Extract the threadId from the matching conversation
  //   const conversation = result.conversations.find(conv => conv.id === conversationId);
  //   const threadId = conversation.threadId;
  //   if(!threadId){
  //     console.log(`Thread ID not defined for conversation ID ${conversationId}`);
  //   return null;

  //   }
  //   console.log(`Thread ID for conversation ID ${conversationId}: ${threadId}`);
  //   return threadId;
  // } else {
  //   console.log(`Conversation ID ${conversationId} not found`);
  //   return null;
  // }
  // console.log(result);
}
async function createAssistant() {
  const myAssistant = await openai.beta.assistants.create({
    instructions: `You are a helpful assistant with access to a database of products. Your main job is to help the human find the product that fits his needs. 

        Whenever you respond with product details, always make sure to include the SKU and the Title of the all the products in response. 
        
        Whenever user asks about products by giving specs make sure to give out at least 3-5 products that match the criteria of the human.
        
        Never give out any products outside HP Z Portfolio. Always refer to your tool to get info on any product.
        
        Use the format below whenever you are giving out product info. Nicely format everything in each line and use markdown for formatting:
        
        Title: <product title>
        SKU: <product BrandPartCode or SKU>
        Datasheet: <product LeafletPDFURL>`,
    name: 'Consenna Cogent',
    model: 'gpt-4-1106-preview',
    tools: [
      {
        type: 'function',
        function: {
          name: 'search_products',
          description:
            "Used to query the HP Z Portfolio products database. The database has only one table 'products'. The products table has the following coloumns: id, sku, distribution_availability, promotion_type, promotion_url, title, endoflifedate, generatedinttitle, brand, productname, category, productfamily, longdesc, leafletpdfurl, product_type, width, height, depth, weight, on-board_graphics_card_model, processor_manufacturer, processor_family, processor_model. Never use productfamily while searching for products.",
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description:
                  'The SQL Query that needs to be executed on the database.',
              },
            },
            required: ['query'],
          },
        },
      },
    ],
  });

  console.log(myAssistant);
}

// actions();
createAssistant();
// console.log(ma());
