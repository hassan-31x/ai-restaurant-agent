import fs from 'fs';
import path from 'path';

// Create orders directory if it doesn't exist
const ordersDir = path.join(process.cwd(), 'orders');
if (!fs.existsSync(ordersDir)) {
  fs.mkdirSync(ordersDir, { recursive: true });
}

// Menu with food items and prices
const menu = {
  "Appetizers": {
    "Garlic Bread": 5.99,
    "Mozzarella Sticks": 7.99,
    "Chicken Wings": 9.99,
    "Soup of the Day": 4.99
  },
  "Main Courses": {
    "Spaghetti Bolognese": 12.99,
    "Grilled Salmon": 18.99,
    "Chicken Alfredo": 14.99,
    "Vegetable Stir Fry": 11.99,
    "Steak": 22.99
  },
  "Desserts": {
    "Chocolate Cake": 6.99,
    "Cheesecake": 7.99,
    "Ice Cream": 4.99,
    "Fruit Salad": 5.99
  },
  "Drinks": {
    "Soda": 2.99,
    "Coffee": 3.99,
    "Tea": 2.99,
    "Wine": 8.99,
    "Beer": 5.99
  }
};

// Get the full menu
const getMenu = () => {
  return menu;
};

// Get a specific category from the menu
const getMenuCategory = (category) => {
  if (menu[category]) {
    return menu[category];
  } else {
    return "Category not found";
  }
};

// Get price of a specific item
const getPrice = (item) => {
  for (const category in menu) {
    if (menu[category][item]) {
      return menu[category][item];
    }
  }
  return "Item not found";
};

// Check if an item exists in the menu
const checkItemAvailability = (item) => {
  for (const category in menu) {
    if (menu[category][item]) {
      return true;
    }
  }
  return false;
};

// Create a new order
const createOrder = (customerName, items) => {
  // Validate items
  const validItems = [];
  const invalidItems = [];
  let totalPrice = 0;

  items.forEach(item => {
    const price = getPrice(item);
    if (price !== "Item not found") {
      validItems.push(item);
      totalPrice += price;
    } else {
      invalidItems.push(item);
    }
  });

  // Generate order ID
  const orderId = Date.now().toString();
  
  // Create order object
  const order = {
    orderId,
    customerName,
    items: validItems,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    status: "pending",
    timestamp: new Date().toISOString(),
  };

  // Save order to file
  fs.writeFileSync(
    path.join(ordersDir, `${orderId}.json`),
    JSON.stringify(order, null, 2)
  );

  return {
    orderId,
    validItems,
    invalidItems,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    status: "pending"
  };
};

// Get order details by ID
const getOrderDetails = (orderId) => {
  try {
    const orderPath = path.join(ordersDir, `${orderId}.json`);
    if (fs.existsSync(orderPath)) {
      const orderData = fs.readFileSync(orderPath, 'utf8');
      return JSON.parse(orderData);
    } else {
      return "Order not found";
    }
  } catch (error) {
    return "Error retrieving order";
  }
};

// Update order status
const updateOrderStatus = (orderId, status) => {
  try {
    const orderPath = path.join(ordersDir, `${orderId}.json`);
    if (fs.existsSync(orderPath)) {
      const orderData = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
      orderData.status = status;
      fs.writeFileSync(orderPath, JSON.stringify(orderData, null, 2));
      return { success: true, orderId, status };
    } else {
      return "Order not found";
    }
  } catch (error) {
    return "Error updating order";
  }
};

// Get all orders
const getAllOrders = () => {
  try {
    const files = fs.readdirSync(ordersDir);
    const orders = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const orderData = fs.readFileSync(path.join(ordersDir, file), 'utf8');
        return JSON.parse(orderData);
      });
    return orders;
  } catch (error) {
    return "Error retrieving orders";
  }
};

// Get pending orders
const getPendingOrders = () => {
  try {
    const allOrders = getAllOrders();
    if (typeof allOrders === 'string') return allOrders;
    
    return allOrders.filter(order => order.status === "pending");
  } catch (error) {
    return "Error retrieving pending orders";
  }
};

// Calculate bill for an order
const calculateBill = (orderId) => {
  const order = getOrderDetails(orderId);
  if (typeof order === 'string') return order;
  
  return {
    orderId,
    customerName: order.customerName,
    items: order.items,
    totalPrice: order.totalPrice,
    status: order.status
  };
};

// Add item to existing order
const addItemToOrder = (orderId, item) => {
  try {
    const orderPath = path.join(ordersDir, `${orderId}.json`);
    if (fs.existsSync(orderPath)) {
      const orderData = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
      
      const price = getPrice(item);
      if (price === "Item not found") {
        return { success: false, message: "Item not found in menu" };
      }
      
      orderData.items.push(item);
      orderData.totalPrice += price;
      orderData.totalPrice = parseFloat(orderData.totalPrice.toFixed(2));
      
      fs.writeFileSync(orderPath, JSON.stringify(orderData, null, 2));
      return { 
        success: true, 
        orderId, 
        item, 
        newTotal: orderData.totalPrice 
      };
    } else {
      return "Order not found";
    }
  } catch (error) {
    return "Error updating order";
  }
};

// Remove item from existing order
const removeItemFromOrder = (orderId, item) => {
  try {
    const orderPath = path.join(ordersDir, `${orderId}.json`);
    if (fs.existsSync(orderPath)) {
      const orderData = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
      
      const itemIndex = orderData.items.indexOf(item);
      if (itemIndex === -1) {
        return { success: false, message: "Item not found in order" };
      }
      
      const price = getPrice(item);
      orderData.items.splice(itemIndex, 1);
      orderData.totalPrice -= price;
      orderData.totalPrice = parseFloat(orderData.totalPrice.toFixed(2));
      
      fs.writeFileSync(orderPath, JSON.stringify(orderData, null, 2));
      return { 
        success: true, 
        orderId, 
        item, 
        newTotal: orderData.totalPrice 
      };
    } else {
      return "Order not found";
    }
  } catch (error) {
    return "Error updating order";
  }
};

export {
  getMenu,
  getMenuCategory,
  getPrice,
  checkItemAvailability,
  createOrder,
  getOrderDetails,
  updateOrderStatus,
  getAllOrders,
  getPendingOrders,
  calculateBill,
  addItemToOrder,
  removeItemFromOrder
};
