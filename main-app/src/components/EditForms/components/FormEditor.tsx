import { useState, useEffect } from 'react';
import FormItemEditor from './FormItemEditor';
import { updateFormProducts } from '../services/api';

interface Extra {
  name: string;
  minAmount: number;
  maxAmount: number;
  price: number;
}

interface ProductData {
  name: string;
  description: string;
  extras: Extra[];
  soldOut: boolean;
  existent?: boolean;
}

interface FormEditorProps {
  formName: string;
  products: ProductData[];
  onFormUpdated: () => void;
  initialComment?: string;
}

function FormEditor({ formName, products, onFormUpdated, initialComment }: FormEditorProps) {
  const [editableProducts, setEditableProducts] = useState<{
    [key: string]: {
      selected: boolean;
      product: ProductData;
    }
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formComment, setFormComment] = useState<string>("The bread comes sliced unless you specify otherwise here. You can also add additional notes here.");
  
  // Initialize editableProducts when products change
  useEffect(() => {
    const initialSelections: {[key: string]: {selected: boolean; product: ProductData}} = {};
    products.forEach(prod => {
      initialSelections[prod.name] = {
        selected: prod.existent !== false,
        product: { 
          ...prod,
          existent: prod.existent !== false
        }
      };
    });
    setEditableProducts(initialSelections);
    
    // Reset form state
    setSubmitSuccess(false);
    setSubmitError(null);
  }, [products]);
  
  // Initialize form comment when initialComment prop changes
  useEffect(() => {
    if (initialComment) {
      setFormComment(initialComment);
    }
  }, [initialComment]);
  
  // Handler for product selection change (now controls existent flag)
  const handleProductSelect = (productName: string, isSelected: boolean) => {
    setEditableProducts(prev => ({
      ...prev,
      [productName]: {
        ...prev[productName],
        selected: isSelected,
        product: {
          ...prev[productName].product,
          existent: isSelected
        }
      }
    }));
  };
  
  // Handler for product data change
  const handleProductChange = (productName: string, updatedProduct: ProductData) => {
    setEditableProducts(prev => ({
      ...prev,
      [productName]: {
        ...prev[productName],
        product: updatedProduct
      }
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Create updated products array with existent and soldOut properties
      const updatedProducts = Object.entries(editableProducts).map(([_, item]) => {
        return {
          ...item.product,
          existent: item.selected
        };
      });
      
      // Submit updated products to backend with the comment field
      await updateFormProducts(formName, updatedProducts, formComment);
      
      setSubmitSuccess(true);
      onFormUpdated(); // Refresh forms data
    } catch (error) {
      console.error('Error saving form changes:', error);
      setSubmitError('Failed to save changes. Please try again.');
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>
        Edit Form: {formName}
      </h1>
      
      {submitSuccess ? (
        <div style={{
          padding: '20px',
          backgroundColor: '#dff0d8',
          borderRadius: '4px',
          color: '#3c763d',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h3>Form saved successfully!</h3>
          <p>Your changes have been saved.</p>
          <button
            onClick={() => setSubmitSuccess(false)}
            style={{
              backgroundColor: '#5cb85c',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              marginTop: '15px',
              cursor: 'pointer'
            }}
          >
            Continue Editing
          </button>
        </div>
      ) : (
        <>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h2>Products in Form</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(editableProducts).map(([productName, productData], index) => (
                <FormItemEditor 
                  key={index} 
                  product={productData.product}
                  isSelected={productData.selected}
                  onSelect={(isSelected: boolean) => handleProductSelect(productName, isSelected)}
                  onProductChange={(updatedProduct: ProductData) => handleProductChange(productName, updatedProduct)}
                />
              ))}
            </div>
          </div>
          
          {/* Add Form Comment Section */}
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h2>Form Comment</h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
              This comment will be shown to customers when they place an order.
            </p>
            <textarea
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: 'inherit',
                fontSize: '14px',
                resize: 'vertical'
              }}
              placeholder="Enter a comment for this form..."
            />
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            margin: '20px 0'
          }}>
            {submitError && (
              <div style={{ 
                color: 'red', 
                backgroundColor: '#f8d7da', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '15px' 
              }}>
                {submitError}
              </div>
            )}
            
            <button 
              onClick={handleSaveChanges}
              disabled={isSubmitting}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '12px 24px',
                fontSize: '16px',
                border: 'none',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            
            <div style={{ height: '80px' }}></div>
          </div>
        </>
      )}
    </div>
  );
}

export default FormEditor;