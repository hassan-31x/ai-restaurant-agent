# Restaurant Management AI Agent

This project implements an AI-powered restaurant management system that can handle various restaurant operations like managing menus, creating orders, tracking order status, and calculating bills.

## Features

- View the full menu or specific categories
- Check item availability and prices
- Create new orders
- View order details
- Update order status
- Add or remove items from existing orders
- Calculate bills
- View all orders or just pending orders

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Dependencies

- Node.js
- OpenAI API
- dotenv
- readline-sync
- fs (built-in)
- path (built-in)

## Project Structure

- `restaurant.js`: Contains all the restaurant management functionality
- `restaurant-agent.js`: The AI agent that uses the restaurant functions
- `orders/`: Directory where order JSON files are stored

## Running the Application

To start the restaurant management AI agent:

```
node index.js
```

## Example Commands

Here are some example commands you can try with the AI agent:

- "Show me the menu"
- "What's on the dessert menu?"
- "How much is the Grilled Salmon?"
- "Create an order for Sarah with Chicken Wings and Steak"
- "What's the status of order 1621234567890?"
- "Update order 1621234567890 to ready"
- "Add Ice Cream to order 1621234567890"
- "Remove Chicken Wings from order 1621234567890"
- "Calculate the bill for order 1621234567890"
- "Show all pending orders"

## How It Works

The system uses OpenAI's GPT-4o model to understand natural language requests and convert them into appropriate function calls. The AI agent follows a structured approach:

1. **PLAN**: The AI first plans what tools it needs to use
2. **ACTION**: It then takes the appropriate action using the restaurant management functions
3. **OBSERVATION**: It observes the result of the action
4. **OUTPUT**: Finally, it provides a human-friendly response based on the observations

All orders are stored as JSON files in the `orders/` directory, making them persistent between sessions.

## Extending the System

You can extend this system by:

1. Adding more menu items in the `menu` object in `restaurant.js`
2. Implementing additional restaurant management functions in `restaurant.js`
3. Updating the `SYSTEM_PROMPT` in `restaurant-agent.js` to include any new functions
4. Adding the new functions to the `tools` object in `restaurant-agent.js` 
