import OpenAI from "openai";
import dotenv from "dotenv";
import readlineSync from "readline-sync";
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const getWeather = (city) => {
  const weather = {
    "New York": "10 C",
    "Los Angeles": "15 C",
    "Chicago": "12 C",
    "Houston": "14 C",
    "Miami": "16 C",
  }

  if (weather[city]) {
    return weather[city];
  } else {
    return "City not found";
  }
}

const tools = {
  getWeather: getWeather
}

const SYSTEM_PROMPT = `
You are an AI assistant with START, PLAN, ACTION, Observation and Output State.
Wait for the user prompt and first PLAN using available tools.
After planning, take the ACTION with appropriate tools and wait for Observation based on Action.
Once you get the Observation, return the AI response based on START prompt and observations.

Strictly follow JSON output format as in examples.

Available Tools:
- function getWeather(city: string): string
getWeather is a function that accepts a city name as input and returns the weather of a given city.

Example:
START
{ "type": "user", "user": "What is the sum of weather of Chicago and Miami?" } 
{ "type": "plan", "plan": "I will call the getWeatherDetails for Chicago" }
{ "type": "action", "function": "getWeather", "input": "Chicago" } 
{ "type": "observation", "observation": "12°C" }
{ "type": "plan", "plan": "I will call getWeather for Miami" } 
{ "type": "action", "function": "getWeather", "input": "Miami" } 
{ "type": "observation", "observation": "16°C" }
{ "type": "output", "output": "The sum of weather of Chicago and Miami is 28°C" }
`

// const userPrompt = 'What is the weather of New York?'

// const chat = async () => {
//   const response = await openai.chat.completions.create({
//     model: "gpt-4o",
//     messages: [
//       { role: "system", content: SYSTEM_PROMPT }, 
//       { role: "user", content: userPrompt }
//     ],
//   });

//   console.log(response.choices[0].message.content);
// }

// chat();

const messages = [{ role: "system", content: SYSTEM_PROMPT }]

while (true) {
  const query = readlineSync.question(">> ");
  const q = {
    type: 'user',
    content: query
  }
  messages.push({ role: 'user', content: JSON.stringify(q) });

  while (true) {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" },
    });

    const result = chat.choices[0].message.content;
    messages.push({ role: 'assistant', content: result });

    const parsed = JSON.parse(result);
    if (parsed.type === 'output') {
      console.log(parsed.output);
      break;
    } else if (parsed.type === 'action') {
      const fn = tools[parsed.function];
      const output = fn(parsed.input);
      const observation = { type: 'observation', observation: output }
      messages.push({ role: 'developer', content: JSON.stringify(observation) });
    }
  }
}
