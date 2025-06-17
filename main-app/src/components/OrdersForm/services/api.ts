// src/services/api.ts

const API_URL = 'http://13.49.120.33/api';

// Function to get available dates
export const getDates = async () => {
  try {
    const response = await fetch(`${API_URL}/dates`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch dates');
    }
    
    // Filter out dates that are not visible
    const visibleDates = await Promise.all(
      data.dates.map(async (date: string) => {
        try {
          const metadataResponse = await fetch(`${API_URL}/products/${encodeURIComponent(date)}`);
          const metadataData = await metadataResponse.json();
          
          if (metadataData.success && metadataData.metadata && metadataData.metadata.visible === false) {
            return null; // Skip dates that are explicitly marked as not visible
          }
          return date;
        } catch (error) {
          console.error(`Error fetching metadata for date ${date}:`, error);
          return date; // If there's an error, include the date by default
        }
      })
    );
    
    // Remove null values (invisible dates)
    return visibleDates.filter(date => date !== null);
  } catch (error) {
    console.error('Error fetching dates:', error);
    throw error;
  }
};

// Function to get all dates (including hidden ones) - for admin purposes
export const getAllDates = async () => {
  try {
    const response = await fetch(`${API_URL}/dates`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch dates');
    }
    
    return data.dates;
  } catch (error) {
    console.error('Error fetching all dates:', error);
    throw error;
  }
};

// Function to get dates with visibility information - for admin purposes
export const getDatesWithVisibility = async () => {
  try {
    const response = await fetch(`${API_URL}/dates`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch dates');
    }
    
    // Get visibility information for each date
    const datesWithVisibility = await Promise.all(
      data.dates.map(async (date: string) => {
        try {
          const metadataResponse = await fetch(`${API_URL}/products/${encodeURIComponent(date)}`);
          const metadataData = await metadataResponse.json();
          
          return {
            date,
            visible: metadataData.success && metadataData.metadata ? 
                    metadataData.metadata.visible !== false : 
                    true // Default to visible if metadata is missing
          };
        } catch (error) {
          console.error(`Error fetching metadata for date ${date}:`, error);
          return { date, visible: true }; // Default to visible on error
        }
      })
    );
    
    return datesWithVisibility;
  } catch (error) {
    console.error('Error fetching dates with visibility:', error);
    throw error;
  }
};

// Updated function to get products for a specific date
export const getProducts = async (date: string) => {
  try {
    const response = await fetch(`${API_URL}/products/${encodeURIComponent(date)}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch products');
    }
    
    // Filter products to only return those where existent=true
    const existentProducts = data.products.filter((product: any) => product.existent === true);
    
    // Return an object containing products and comment
    const ret_dict = {
        products: existentProducts,
        comment: data.comment || "The bread comes sliced unless you specify otherwise here. You can also add additional notes here."
    };

    console.log(ret_dict);

    return ret_dict;

  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Function to update form visibility
export const updateFormVisibility = async (visibilityData: { [key: string]: boolean }) => {
  try {
    const response = await fetch(`${API_URL}/forms/visibility`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ visibility: visibilityData }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update form visibility');
    }
    
    return data;
  } catch (error) {
    console.error('Error updating form visibility:', error);
    throw error;
  }
};

// Function to submit an order
export const submitOrder = async (orderData: {
  name: string;
  phone: string;
  date: string;
  comment?: string;
  selectedProducts: {
    [key: string]: {
      selected: boolean;
      extras: {[extraName: string]: number};
    }
  };
  totalAmount: number;
}) => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to submit order');
    }
    
    return data.order;
  } catch (error) {
    console.error('Error submitting order:', error);
    throw error;
  }
};

// Function to get all orders
export const getOrders = async (dateFilter?: string) => {
  try {
    const url = dateFilter 
      ? `${API_URL}/orders?date=${encodeURIComponent(dateFilter)}`
      : `${API_URL}/orders`;
      
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch orders');
    }
    
    return data.orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};


export const updateInventory = async (date: string, inventoryUpdates: {
    name: string;
    inventory: number;
  }[]) => {
    try {
      const response = await fetch(`${API_URL}/update_inventory`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          date, 
          inventoryUpdates 
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update inventory');
      }
      
      return data;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  };


// Get single order
export const getOrder = async (orderId: string) => {
  const response = await fetch(`/api/orders/${orderId}`);
  if (!response.ok) throw new Error('Failed to fetch order');
  return response.json();
};

// Update existing order
export const updateOrder = async (orderId: string, orderData: any) => {
  const response = await fetch(`/api/orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!response.ok) throw new Error('Failed to update order');
  return response.json();
};

// Delete order
export const deleteOrder = async (orderId: string) => {
  const response = await fetch(`/api/orders/${orderId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete order');
  return response.json();
};