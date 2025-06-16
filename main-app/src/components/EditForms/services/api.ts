// src/services/api.ts

export const API_URL = 'http://localhost:5000/api';

// Define interface for product data with existent flag
export interface ProductData {
  name: string;
  description: string;
  extras: {
    name: string;
    minAmount: number;
    maxAmount: number;
    price: number;
  }[];
  soldOut: boolean;
  existent?: boolean;
  hasImage?: boolean;
  imagePath?: string;
  inventory?: number;
  
  sourdough?: {
    type: 'none' | 'black' | 'halfHalf' | 'white';
    weight: number;
    is20Percent: boolean;
  };
  
  // New content fields
  flour?: number;
  water?: number;
  salt?: number;
  flours?: {
    name: string;
    percentage: number;
    substitute?: number;
  }[];
  
  // Detailed sourdough fields
  sourdough_black?: number;
  sourdough_half_half?: number;
  sourdough_white?: number;
}


// Function to get available forms (dates)
export const getDates = async () => {
  try {
    const response = await fetch(`${API_URL}/dates`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch forms');
    }
    
    return data.dates;
  } catch (error) {
    console.error('Error fetching forms:', error);
    throw error;
  }
};

// Function to get products for a specific form
export const getProducts = async (formName: string) => {
  try {
    const response = await fetch(`${API_URL}/products/${encodeURIComponent(formName)}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch products');
    }
    
    return {
      products: data.products,
      metadata: data.metadata,
      comment: data.comment
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Function to create a new form
export const createNewForm = async (formName: string) => {
  try {
    const response = await fetch(`${API_URL}/forms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formName }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create form');
    }
    
    return data.formName;
  } catch (error) {
    console.error('Error creating form:', error);
    throw error;
  }
};

// Function to delete a form
export const deleteForm = async (formName: string) => {
  try {
    const response = await fetch(`${API_URL}/forms/${encodeURIComponent(formName)}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete form');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting form:', error);
    throw error;
  }
};


// Function to update form visibility
export const updateFormVisibility = async (visibilityData: { [key: string]: boolean }) => {
  try {
    const response = await fetch(`${API_URL}/forms_visibility`, {
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

// New function to upload product image
export const uploadProductImage = async (imageFile: File, fileName: string) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('fileName', fileName);
    
    const response = await fetch(`${API_URL}/upload_image`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to upload image');
    }
    
    return data.imagePath;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};



export const updateFormProducts = async (formName: string, products: ProductData[], comment: string = '') => {
  try {
    // Ensure each product has inventory (default to 12 if not provided)
    const processedProducts = products.map(product => ({
      ...product,
      inventory: product.inventory ?? 12,
      // Set soldOut to true if inventory is 0
      soldOut: (product.inventory ?? 12) === 0
    }));

    const response = await fetch(`${API_URL}/forms/${encodeURIComponent(formName)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products: processedProducts, comment }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update form');
    }
    
    return data.formName;
  } catch (error) {
    console.error('Error updating form:', error);
    throw error;
  }
};

// Update addProduct function to handle inventory
export const addProduct = async (formName: string, product: ProductData) => {
  try {
    // Ensure inventory is set, defaulting to 12
    const productWithInventory = {
      ...product,
      inventory: product.inventory ?? 12,
      soldOut: (product.inventory ?? 12) === 0
    };
    
    // First get existing products
    const { products } = await getProducts(formName);
    
    // Determine the actual products array (handle both data structures)
    let currentProducts: ProductData[] = [];
    if (Array.isArray(products)) {
      currentProducts = products;
    } else if (products && Array.isArray(products.products)) {
      currentProducts = products.products;
    }
    
    // Add new product to the array
    currentProducts.push(productWithInventory);
    
    // Update the form with all products
    return updateFormProducts(formName, currentProducts);
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};