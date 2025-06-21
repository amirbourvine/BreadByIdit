import { useState, useEffect, useCallback } from 'react';
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
  // State management
  const [editableProducts, setEditableProducts] = useState<{
    [key: string]: { selected: boolean; product: ProductData; order: number }
  }>({});
  const [productOrder, setProductOrder] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formComment, setFormComment] = useState<string>(initialComment || "The bread comes sliced unless you specify otherwise here. You can also add additional notes here.");
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize products
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
    setSubmitSuccess(false);
    setSubmitError(null);
  }, [products]);

  // Handlers
  const handleProductSelect = useCallback((productName: string, isSelected: boolean) => {
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
  }, []);

  const handleProductChange = useCallback((productName: string, updatedProduct: ProductData) => {
    setEditableProducts(prev => ({
      ...prev,
      [productName]: {
        ...prev[productName],
        product: updatedProduct
      }
    }));
  }, []);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, productName: string) => {
    setDraggedItem(productName);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', productName);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, productName: string) => {
    e.preventDefault();
    setDragOverItem(productName);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetProductName: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetProductName) return;

    const newOrder = [...productOrder];
    const draggedIndex = newOrder.indexOf(draggedItem);
    const targetIndex = newOrder.indexOf(targetProductName);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    setProductOrder(newOrder);
    setDraggedItem(null);
    setDragOverItem(null);
  }, [draggedItem, productOrder]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverItem(null);
  }, []);

  const moveProduct = useCallback((productName: string, direction: 'up' | 'down') => {
    const currentIndex = productOrder.indexOf(productName);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= productOrder.length) return;
    
    const newOrder = [...productOrder];
    [newOrder[currentIndex], newOrder[newIndex]] = 
      [newOrder[newIndex], newOrder[currentIndex]];
    
    setProductOrder(newOrder);
  }, [productOrder]);

  const handleSaveChanges = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const updatedProducts = productOrder.map(productName => ({
        ...editableProducts[productName].product,
        existent: editableProducts[productName].selected
      }));
      
      await updateFormProducts(formName, updatedProducts, formComment);
      setSubmitSuccess(true);
      onFormUpdated();
    } catch (error) {
      console.error('Error saving form changes:', error);
      setSubmitError('Failed to save changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Responsive styles
  const containerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: isMobile ? '0 8px' : '0 16px'
  };

  const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    margin: '12px 0',
    fontSize: isMobile ? '1.4rem' : '1.8rem',
    lineHeight: '1.3'
  };

  const sectionStyle: React.CSSProperties = {
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: isMobile ? '12px' : '16px',
    marginBottom: '16px',
    backgroundColor: '#fff'
  };

  const successBoxStyle: React.CSSProperties = {
    padding: '16px',
    backgroundColor: '#dff0d8',
    borderRadius: '6px',
    color: '#3c763d',
    marginBottom: '20px',
    textAlign: 'center'
  };

  const productItemStyle = (isDragging: boolean, isDragOver: boolean): React.CSSProperties => ({
    position: 'relative',
    opacity: isDragging ? 0.6 : 1,
    border: isDragOver ? '2px dashed #4CAF50' : '1px solid #e0e0e0',
    borderRadius: '6px',
    backgroundColor: isDragOver ? '#f8fff8' : '#fafafa',
    marginBottom: '10px',
    padding: isMobile ? '12px 8px' : '16px 12px',
    transition: 'all 0.2s ease'
  });

  const orderControlsStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    gap: isMobile ? '6px' : '4px',
    marginBottom: isMobile ? '12px' : '0',
    alignItems: 'center'
  };

  const orderButtonStyle = (disabled: boolean): React.CSSProperties => ({
    width: '32px',
    height: '32px',
    border: '1px solid #ddd',
    backgroundColor: disabled ? '#f5f5f5' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  const orderNumberStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#555',
    backgroundColor: '#f8f8f8',
    border: '1px solid #ddd',
    borderRadius: '4px'
  };

  const dragHandleStyle: React.CSSProperties = {
    position: isMobile ? 'static' : 'absolute',
    right: '10px',
    top: '50%',
    transform: isMobile ? 'none' : 'translateY(-50%)',
    cursor: 'grab',
    padding: '4px',
    color: '#999',
    fontSize: '20px',
    userSelect: 'none'
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: isMobile ? '90px' : '110px',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '16px',
    resize: 'vertical',
    boxSizing: 'border-box',
    lineHeight: '1.4'
  };

  const saveButtonStyle: React.CSSProperties = {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '6px',
    cursor: isSubmitting ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    opacity: isSubmitting ? 0.7 : 1,
    width: isMobile ? '100%' : 'auto',
    maxWidth: '300px',
    margin: '0 auto',
    display: 'block'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Edit Form: {formName}</h1>
      
      {submitSuccess ? (
        <div style={successBoxStyle}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>
            Form saved successfully!
          </h3>
          <button
            onClick={() => setSubmitSuccess(false)}
            style={{
              backgroundColor: '#5cb85c',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '10px'
            }}
          >
            Continue Editing
          </button>
        </div>
      ) : (
        <>
          <div style={sectionStyle}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.3rem' }}>
              Products in Form
            </h2>
            <p style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginBottom: '16px',
              lineHeight: '1.5'
            }}>
              {isMobile 
                ? 'Use arrows to reorder or drag products'
                : 'Drag products to reorder or use arrow buttons'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                    onDragLeave={() => setDragOverItem(null)}
                    onDrop={(e) => handleDrop(e, productName)}
                    onDragEnd={handleDragEnd}
                    style={productItemStyle(isDragging, isDragOver)}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: isMobile ? '12px' : '0'
                    }}>
                      <div style={orderControlsStyle}>
                        <button
                          onClick={() => moveProduct(productName, 'up')}
                          disabled={index === 0}
                          style={orderButtonStyle(index === 0)}
                          aria-label="Move up"
                        >
                          ↑
                        </button>
                        <div style={orderNumberStyle}>
                          {index + 1}
                        </div>
                        <button
                          onClick={() => moveProduct(productName, 'down')}
                          disabled={index === productOrder.length - 1}
                          style={orderButtonStyle(index === productOrder.length - 1)}
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                      </div>
                      
                      <div style={dragHandleStyle} aria-label="Drag handle">
                        ⋮⋮
                      </div>
                    </div>
                    
                    <div>
                      <FormItemEditor 
                        product={productData.product}
                        isSelected={productData.selected}
                        onSelect={handleProductSelect}
                        onProductChange={handleProductChange}
                        isMobile={isMobile}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div style={sectionStyle}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.3rem' }}>
              Form Comment
            </h2>
            <textarea
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              style={textareaStyle}
              placeholder="Enter a comment for this form..."
              aria-label="Form comment"
            />
          </div>
          
          <div style={{ margin: '24px 0' }}>
            {submitError && (
              <div style={{ 
                color: '#d32f2f', 
                backgroundColor: '#ffebee', 
                padding: '12px', 
                borderRadius: '6px', 
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                {submitError}
              </div>
            )}
            
            <button 
              onClick={handleSaveChanges}
              disabled={isSubmitting}
              style={saveButtonStyle}
              aria-label="Save changes"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default FormEditor;