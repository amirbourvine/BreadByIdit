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
  
  // Check if mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
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
    
    setSubmitSuccess(false);
    setSubmitError(null);
  }, [products]);
  
  useEffect(() => {
    if (initialComment) {
      setFormComment(initialComment);
    }
  }, [initialComment]);
  
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

  const moveProductUp = (productName: string) => {
    const currentIndex = productOrder.indexOf(productName);
    if (currentIndex > 0) {
      const newOrder = [...productOrder];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      setProductOrder(newOrder);
    }
  };

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
      
      const updatedProducts = productOrder.map((productName) => {
        const item = editableProducts[productName];
        return {
          ...item.product,
          existent: item.selected
        };
      });
      
      await updateFormProducts(formName, updatedProducts, formComment);
      
      setSubmitSuccess(true);
      onFormUpdated();
    } catch (error) {
      console.error('Error saving form changes:', error);
      setSubmitError('Failed to save changes. Please try again.');
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Responsive styles
  const containerStyle: React.CSSProperties = {
    maxWidth: isMobile ? '100%' : '800px',
    margin: isMobile ? '0' : '0 auto',
    padding: isMobile ? '8px' : '16px',
    fontSize: isMobile ? '14px' : '16px',
    lineHeight: '1.4'
  };

  const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    margin: isMobile ? '8px 0 16px 0' : '16px 0 24px 0',
    fontSize: isMobile ? '1.25rem' : '1.75rem',
    fontWeight: 'bold',
    wordBreak: 'break-word',
    lineHeight: '1.2'
  };

  const sectionStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: isMobile ? '12px' : '20px',
    marginBottom: isMobile ? '12px' : '20px',
    background: 'white'
  };

  const sectionTitleStyle: React.CSSProperties = {
    margin: isMobile ? '0 0 8px 0' : '0 0 12px 0',
    fontSize: isMobile ? '1.1rem' : '1.25rem',
    fontWeight: '600',
    color: '#333'
  };

  const sectionDescriptionStyle: React.CSSProperties = {
    fontSize: isMobile ? '12px' : '14px',
    color: '#666',
    marginBottom: isMobile ? '12px' : '16px',
    lineHeight: '1.3'
  };

  const successBoxStyle: React.CSSProperties = {
    padding: '16px',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '6px',
    color: '#155724',
    marginBottom: '16px',
    textAlign: 'center'
  };

  const successTitleStyle: React.CSSProperties = {
    margin: '0 0 8px 0',
    fontSize: isMobile ? '1.1rem' : '1.25rem',
    fontWeight: '600'
  };

  const successMessageStyle: React.CSSProperties = {
    margin: '0 0 12px 0',
    fontSize: isMobile ? '13px' : '14px'
  };

  const continueBtnStyle: React.CSSProperties = {
    backgroundColor: '#28a745',
    color: 'white',
    padding: isMobile ? '8px 16px' : '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: isMobile ? '13px' : '14px',
    fontWeight: '500'
  };

  const productsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? '8px' : '12px'
  };

  const getProductItemStyle = (isDragging: boolean, isDragOver: boolean): React.CSSProperties => ({
    position: 'relative',
    border: isDragOver ? '2px dashed #28a745' : '1px solid #e0e0e0',
    borderRadius: '6px',
    background: isDragOver ? '#f8fff8' : 'white',
    transition: 'all 0.2s ease',
    cursor: 'move',
    padding: isMobile ? '8px' : '12px',
    marginLeft: isMobile ? '0' : '50px',
    marginRight: isMobile ? '0' : '40px',
    opacity: isDragging ? 0.5 : 1,
    transform: isDragging ? 'rotate(1deg)' : 'none'
  });

  const mobileControlsStyle: React.CSSProperties = {
    display: isMobile ? 'flex' : 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid #eee'
  };

  const desktopOrderControlsStyle: React.CSSProperties = {
    display: isMobile ? 'none' : 'flex',
    position: 'absolute',
    left: '-45px',
    top: '50%',
    transform: 'translateY(-50%)',
    flexDirection: 'column',
    gap: '2px',
    alignItems: 'center',
    zIndex: 10
  };

  const desktopDragHandleStyle: React.CSSProperties = {
    display: isMobile ? 'none' : 'block',
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'grab',
    padding: '4px',
    color: '#999',
    fontSize: '16px',
    userSelect: 'none'
  };

  const orderControlsStyle: React.CSSProperties = {
    display: 'flex',
    gap: isMobile ? '4px' : '2px',
    alignItems: 'center',
    flexDirection: isMobile ? 'row' : 'column'
  };

  const getOrderBtnStyle = (disabled: boolean): React.CSSProperties => ({
    width: isMobile ? '28px' : '24px',
    height: isMobile ? '26px' : '22px',
    border: '1px solid #ccc',
    background: disabled ? '#f5f5f5' : 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: '3px',
    fontSize: isMobile ? '12px' : '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: disabled ? '#999' : '#333'
  });

  const orderNumberStyle: React.CSSProperties = {
    width: isMobile ? '28px' : '24px',
    height: isMobile ? '22px' : '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: isMobile ? '12px' : '11px',
    fontWeight: '600',
    color: '#555',
    background: '#f8f8f8',
    border: '1px solid #ddd',
    borderRadius: '3px'
  };

  const mobileDragHandleStyle: React.CSSProperties = {
    display: isMobile ? 'block' : 'none',
    cursor: 'grab',
    padding: '4px',
    color: '#999',
    fontSize: '16px',
    userSelect: 'none'
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: isMobile ? '70px' : '80px',
    padding: isMobile ? '8px' : '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontFamily: 'inherit',
    fontSize: '14px',
    resize: 'vertical',
    boxSizing: 'border-box'
  };

  const saveSectionStyle: React.CSSProperties = {
    textAlign: 'center',
    margin: isMobile ? '16px 0' : '24px 0'
  };

  const errorMessageStyle: React.CSSProperties = {
    color: '#721c24',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    padding: isMobile ? '8px' : '10px',
    borderRadius: '4px',
    marginBottom: '12px',
    fontSize: isMobile ? '13px' : '14px'
  };

  const saveBtnStyle: React.CSSProperties = {
    backgroundColor: '#28a745',
    color: 'white',
    padding: isMobile ? '10px 20px' : '12px 24px',
    fontSize: isMobile ? '14px' : '16px',
    border: 'none',
    borderRadius: '4px',
    cursor: isSubmitting ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    width: isMobile ? '100%' : 'auto',
    maxWidth: isMobile ? '280px' : 'none',
    opacity: isSubmitting ? 0.7 : 1
  };

  const spacerStyle: React.CSSProperties = {
    height: isMobile ? '30px' : '60px'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>
        Edit Form: {formName}
      </h1>
      
      {submitSuccess ? (
        <div style={successBoxStyle}>
          <h3 style={successTitleStyle}>
            Form saved successfully!
          </h3>
          <p style={successMessageStyle}>Your changes have been saved.</p>
          <button
            onClick={() => setSubmitSuccess(false)}
            style={continueBtnStyle}
          >
            Continue Editing
          </button>
        </div>
      ) : (
        <>
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              Products in Form
            </h2>
            <p style={sectionDescriptionStyle}>
              Use the arrow buttons to reorder products. The order here will be the order customers see.
            </p>
            <div style={productsContainerStyle}>
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
                    style={getProductItemStyle(isDragging, isDragOver)}
                  >
                    {/* Mobile controls */}
                    <div style={mobileControlsStyle}>
                      <div style={orderControlsStyle}>
                        <button
                          onClick={() => moveProductUp(productName)}
                          disabled={index === 0}
                          style={getOrderBtnStyle(index === 0)}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <div style={orderNumberStyle}>
                          {index + 1}
                        </div>
                        <button
                          onClick={() => moveProductDown(productName)}
                          disabled={index === productOrder.length - 1}
                          style={getOrderBtnStyle(index === productOrder.length - 1)}
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                      <div style={mobileDragHandleStyle}>
                        ⋮⋮
                      </div>
                    </div>

                    {/* Desktop controls */}
                    <div style={desktopOrderControlsStyle}>
                      <button
                        onClick={() => moveProductUp(productName)}
                        disabled={index === 0}
                        style={getOrderBtnStyle(index === 0)}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <div style={orderNumberStyle}>
                        {index + 1}
                      </div>
                      <button
                        onClick={() => moveProductDown(productName)}
                        disabled={index === productOrder.length - 1}
                        style={getOrderBtnStyle(index === productOrder.length - 1)}
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>

                    <div style={desktopDragHandleStyle}>
                      ⋮⋮
                    </div>

                    <div>
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
          
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              Form Comment
            </h2>
            <p style={sectionDescriptionStyle}>
              This comment will be shown to customers when they place an order.
            </p>
            <textarea
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              style={textareaStyle}
              placeholder="Enter a comment for this form..."
            />
          </div>
          
          <div style={saveSectionStyle}>
            {submitError && (
              <div style={errorMessageStyle}>
                {submitError}
              </div>
            )}
            
            <button 
              onClick={handleSaveChanges}
              disabled={isSubmitting}
              style={saveBtnStyle}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            
            <div style={spacerStyle}></div>
          </div>
        </>
      )}
    </div>
  );
}

export default FormEditor;