import React, { useState, useEffect } from 'react';
import { getProducts, updateFormProducts, ProductData } from '../services/api';

interface DeleteProductProps {
  onCancel: () => void;
}

const DeleteProduct: React.FC<DeleteProductProps> = ({ onCancel }) => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch generic products when component mounts
  useEffect(() => {
    fetchGenericProducts();
  }, []);

  const fetchGenericProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts('generic_products');
      
      // Handle different response structures
      let productsList: ProductData[] = [];
      if (response.products && Array.isArray(response.products)) {
        productsList = response.products;
      } else if (response.products && response.products.products && Array.isArray(response.products.products)) {
        productsList = response.products.products;
      }
      
      setProducts(productsList);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch generic products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (index: number) => {
    // Create a copy of the products array and remove the product at the given index
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      await updateFormProducts('generic_products', products);
      setSuccessMessage('Products updated successfully');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to update products:', err);
      setError('Failed to save changes. Please try again.');
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Delete Products</h2>
        <button 
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
      
      {loading && <p>Loading products...</p>}
      
      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#FEE2E2', 
          color: '#B91C1C', 
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}
      
      {successMessage && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#D1FAE5', 
          color: '#065F46', 
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {successMessage}
        </div>
      )}
      
      {!loading && products.length === 0 && (
        <p>No products available to delete.</p>
      )}
      
      {!loading && products.length > 0 && (
        <>
          <div style={{ 
            border: '1px solid #E5E7EB', 
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Product Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Description</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #E5E7EB', width: '100px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '12px 16px' }}>{product.name}</td>
                    <td style={{ padding: '12px 16px' }}>{product.description}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteProduct(index)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#EF4444',
                          fontSize: '1.25rem',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                        title="Delete product"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSaveChanges}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </>
      )}
      <div style={{ height: "50px" }} />
    </div>
  );
};

export default DeleteProduct;