import { OPENAI_API_KEY } from '@/utils/app/const';
import OpenAI from 'openai';

let OpenAIClient: OpenAI;
OpenAIClient = new OpenAI({ apiKey: OPENAI_API_KEY });
export default OpenAIClient