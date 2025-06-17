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
      order: number;
    }
  }>({});
  const [productOrder, setProductOrder] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formComment, setFormComment] = useState<string>("The bread comes sliced unless you specify otherwise here. You can also add additional notes here.");
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  
  // Initialize editableProducts when products change
  useEffect(() => {
    const initialSelections: {[key: string]: {selected: boolean; product: ProductData; order: number}} = {};
    const initialOrder: string[] = [];
    
    products.forEach((prod, index) => {
      initialSelections[prod.name] = {
        selected: prod.existent !== false,
        product: { 
          ...prod,
          existent: prod.existent !== false
        },
        order: index
      };
      initialOrder.push(prod.name);
    });
    
    setEditableProducts(initialSelections);
    setProductOrder(initialOrder);
    
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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, productName: string) => {
    setDraggedItem(productName);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', productName);
  };

  const handleDragOver = (e: React.DragEvent, productName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(productName);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetProductName: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetProductName) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newOrder = [...productOrder];
    const draggedIndex = newOrder.indexOf(draggedItem);
    const targetIndex = newOrder.indexOf(targetProductName);

    // Remove dragged item and insert it at target position
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    setProductOrder(newOrder);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Move product up in order
  const moveProductUp = (productName: string) => {
    const currentIndex = productOrder.indexOf(productName);
    if (currentIndex > 0) {
      const newOrder = [...productOrder];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      setProductOrder(newOrder);
    }
  };

  // Move product down in order
  const moveProductDown = (productName: string) => {
    const currentIndex = productOrder.indexOf(productName);
    if (currentIndex < productOrder.length - 1) {
      const newOrder = [...productOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      setProductOrder(newOrder);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Create updated products array with existent and soldOut properties, ordered according to productOrder
      const updatedProducts = productOrder.map((productName) => {
        const item = editableProducts[productName];
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
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
              Drag products to reorder them, or use the arrow buttons. The order here will be the order customers see.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {productOrder.map((productName, index) => {
                const productData = editableProducts[productName];
                if (!productData) return null;
                
                const isDragging = draggedItem === productName;
                const isDragOver = dragOverItem === productName;
                
                return (
                  <div
                    key={productName}
                    draggable
                    onDragStart={(e) => handleDragStart(e, productName)}
                    onDragOver={(e) => handleDragOver(e, productName)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, productName)}
                    onDragEnd={handleDragEnd}
                    style={{
                      position: 'relative',
                      opacity: isDragging ? 0.5 : 1,
                      transform: isDragging ? 'rotate(2deg)' : 'none',
                      transition: 'all 0.2s ease',
                      border: isDragOver ? '2px dashed #4CAF50' : '1px solid #e0e0e0',
                      borderRadius: '4px',
                      backgroundColor: isDragOver ? '#f8fff8' : 'white',
                      cursor: 'move'
                    }}
                  >
                    {/* Order controls */}
                    <div style={{
                      position: 'absolute',
                      left: '-50px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      zIndex: 10
                    }}>
                      <button
                        onClick={() => moveProductUp(productName)}
                        disabled={index === 0}
                        style={{
                          width: '30px',
                          height: '25px',
                          border: '1px solid #ccc',
                          backgroundColor: index === 0 ? '#f5f5f5' : 'white',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          borderRadius: '3px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: index === 0 ? '#999' : '#333'
                        }}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <div style={{
                        width: '30px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#666',
                        backgroundColor: '#f8f8f8',
                        border: '1px solid #ddd',
                        borderRadius: '3px'
                      }}>
                        {index + 1}
                      </div>
                      <button
                        onClick={() => moveProductDown(productName)}
                        disabled={index === productOrder.length - 1}
                        style={{
                          width: '30px',
                          height: '25px',
                          border: '1px solid #ccc',
                          backgroundColor: index === productOrder.length - 1 ? '#f5f5f5' : 'white',
                          cursor: index === productOrder.length - 1 ? 'not-allowed' : 'pointer',
                          borderRadius: '3px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: index === productOrder.length - 1 ? '#999' : '#333'
                        }}
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>

                    {/* Drag handle */}
                    <div style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'grab',
                      padding: '5px',
                      color: '#999',
                      fontSize: '18px',
                      userSelect: 'none'
                    }}>
                      ⋮⋮
                    </div>

                    <div style={{ marginLeft: '10px', marginRight: '40px' }}>
                      <FormItemEditor 
                        product={productData.product}
                        isSelected={productData.selected}
                        onSelect={(isSelected: boolean) => handleProductSelect(productName, isSelected)}
                        onProductChange={(updatedProduct: ProductData) => handleProductChange(productName, updatedProduct)}
                      />
                    </div>
                  </div>
                );
              })}
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