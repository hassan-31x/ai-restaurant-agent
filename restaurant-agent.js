import OpenAI from "openai";
import dotenv from "dotenv";
import readlineSync from "readline-sync";
import * as restaurantTools from "./restaurant.js";
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY is not set in .env file");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Define the tools that the AI agent can use
const tools = {
  getMenu: restaurantTools.getMenu,
  getMenuCategory: restaurantTools.getMenuCategory,
  getPrice: restaurantTools.getPrice,
  checkItemAvailability: restaurantTools.checkItemAvailability,
  createOrder: restaurantTools.createOrder,
  getOrderDetails: restaurantTools.getOrderDetails,
  updateOrderStatus: restaurantTools.updateOrderStatus,
  getAllOrders: restaurantTools.getAllOrders,
  getPendingOrders: restaurantTools.getPendingOrders,
  calculateBill: restaurantTools.calculateBill,
  addItemToOrder: restaurantTools.addItemToOrder,
  removeItemFromOrder: restaurantTools.removeItemFromOrder
};

const SYSTEM_PROMPT = `
You are an AI restaurant management assistant with START, PLAN, ACTION, Observation and Output State.
Wait for the user prompt and first PLAN using available tools.
After planning, take the ACTION with appropriate tools and wait for Observation based on Action.
Once you get the Observation, return the AI response based on START prompt and observations.

Strictly follow JSON output format as in examples.

Available Tools:
- function getMenu(): object
  Returns the full menu with categories, items, and prices.

- function getMenuCategory(category: string): object
  Returns items and prices for a specific menu category.

- function getPrice(item: string): number | string
  Returns the price of a specific menu item or "Item not found".

- function checkItemAvailability(item: string): boolean
  Checks if an item exists in the menu.

- function createOrder(customerName: string, items: string[]): object
  Creates a new order with the given customer name and items.
  Returns order details including orderId, valid items, invalid items, total price, and status.

- function getOrderDetails(orderId: string): object | string
  Returns details of an order by ID or error message if not found.

- function updateOrderStatus(orderId: string, status: string): object | string
  Updates the status of an order (e.g., "pending", "preparing", "ready", "delivered").
  Returns success status or error message.

- function getAllOrders(): array | string
  Returns all orders or error message.

- function getPendingOrders(): array | string
  Returns all pending orders or error message.

- function calculateBill(orderId: string): object | string
  Calculates the bill for an order, returning order details with total price.

- function addItemToOrder(orderId: string, item: string): object | string
  Adds an item to an existing order and updates the total price.
  Returns success status or error message.

- function removeItemFromOrder(orderId: string, item: string): object | string
  Removes an item from an existing order and updates the total price.
  Returns success status or error message.

Example:
START
{ "type": "user", "user": "What items do you have on the menu?" } 
{ "type": "plan", "plan": "I will call getMenu to retrieve the full menu" }
{ "type": "action", "function": "getMenu", "input": null } 
{ "type": "observation", "observation": {"Appetizers": {"Garlic Bread": 5.99, "Mozzarella Sticks": 7.99}, "Main Courses": {"Spaghetti Bolognese": 12.99, "Grilled Salmon": 18.99}} }
{ "type": "output", "output": "We have a variety of items on our menu. For appetizers, we offer Garlic Bread ($5.99) and Mozzarella Sticks ($7.99). For main courses, we have Spaghetti Bolognese ($12.99) and Grilled Salmon ($18.99)." }

Example:
START
{ "type": "user", "user": "I'd like to place an order for John with Garlic Bread and Spaghetti Bolognese" } 
{ "type": "plan", "plan": "I will create a new order for John with the requested items" }
{ "type": "action", "function": "createOrder", "input": {"customerName": "John", "items": ["Garlic Bread", "Spaghetti Bolognese"]} } 
{ "type": "observation", "observation": {"orderId": "1621234567890", "validItems": ["Garlic Bread", "Spaghetti Bolognese"], "invalidItems": [], "totalPrice": 18.98, "status": "pending"} }
{ "type": "output", "output": "Thank you! I've created an order for John with Garlic Bread and Spaghetti Bolognese. Your order ID is 1621234567890, and the total is $18.98. Your order status is currently pending." }
`;

const messages = [{ role: "system", content: SYSTEM_PROMPT }];

console.log("Welcome to the Restaurant Management AI Assistant!");
console.log("Type 'exit' to quit the program.");
console.log("---------------------------------------------");

while (true) {
  const query = readlineSync.question(">> ");
  
  if (query.toLowerCase() === 'exit') {
    console.log("Thank you for using the Restaurant Management AI Assistant. Goodbye!");
    process.exit(0);
  }
  
  const q = {
    type: 'user',
    user: query
  };
  
  messages.push({ role: 'user', content: JSON.stringify(q) });
  // console.log("Processing your request...");

  while (true) {
    try {
      const chat = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        response_format: { type: "json_object" },
      });

      const result = chat.choices[0].message.content;
      messages.push({ role: 'assistant', content: result });

      const parsed = JSON.parse(result);
      
      if (parsed.type === 'plan') {
        // console.log(`Planning: ${parsed.plan}`);
      } else if (parsed.type === 'action') {
        // console.log(`Taking action: ${parsed.function}`);
        
        const fn = tools[parsed.function];
        if (!fn) {
          console.error(`Error: Function ${parsed.function} not found`);
          const errorObservation = { 
            type: 'observation', 
            observation: `Error: Function ${parsed.function} not found` 
          };
          messages.push({ role: 'user', content: JSON.stringify(errorObservation) });
          continue;
        }
        
        let output;
        if (parsed.input === null) {
          output = fn();
        } else if (typeof parsed.input === 'object') {
          output = fn(...Object.values(parsed.input));
        } else {
          output = fn(parsed.input);
        }
        
        const observation = { type: 'observation', observation: output };
        messages.push({ role: 'user', content: JSON.stringify(observation) });
      } else if (parsed.type === 'output') {
        console.log("\nResponse:", parsed.output);
        break;
      }
    } catch (error) {
      console.error("Error:", error.message);
      break;
    }
  }
  
  console.log("---------------------------------------------");
} 