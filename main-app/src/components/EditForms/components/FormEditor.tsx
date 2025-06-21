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

  return (
    <div className="form-editor">
      <style jsx>{`
        .form-editor {
          max-width: 100%;
          margin: 0;
          padding: 8px;
          font-size: 14px;
          line-height: 1.4;
        }

        @media (min-width: 768px) {
          .form-editor {
            max-width: 800px;
            margin: 0 auto;
            padding: 16px;
            font-size: 16px;
          }
        }

        .title {
          text-align: center;
          margin: 8px 0 16px 0;
          font-size: 1.25rem;
          font-weight: bold;
          word-break: break-word;
          line-height: 1.2;
        }

        @media (min-width: 768px) {
          .title {
            font-size: 1.75rem;
            margin: 16px 0 24px 0;
          }
        }

        .section {
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 12px;
          background: white;
        }

        @media (min-width: 768px) {
          .section {
            padding: 20px;
            margin-bottom: 20px;
          }
        }

        .section-title {
          margin: 0 0 8px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }

        @media (min-width: 768px) {
          .section-title {
            font-size: 1.25rem;
            margin-bottom: 12px;
          }
        }

        .section-description {
          font-size: 12px;
          color: #666;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        @media (min-width: 768px) {
          .section-description {
            font-size: 14px;
            margin-bottom: 16px;
          }
        }

        .success-box {
          padding: 16px;
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 6px;
          color: #155724;
          margin-bottom: 16px;
          text-align: center;
        }

        .success-title {
          margin: 0 0 8px 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        @media (min-width: 768px) {
          .success-title {
            font-size: 1.25rem;
          }
        }

        .success-message {
          margin: 0 0 12px 0;
          font-size: 13px;
        }

        @media (min-width: 768px) {
          .success-message {
            font-size: 14px;
          }
        }

        .continue-btn {
          background-color: #28a745;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
        }

        @media (min-width: 768px) {
          .continue-btn {
            padding: 10px 20px;
            font-size: 14px;
          }
        }

        .continue-btn:hover {
          background-color: #218838;
        }

        .products-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        @media (min-width: 768px) {
          .products-container {
            gap: 12px;
          }
        }

        .product-item {
          position: relative;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background: white;
          transition: all 0.2s ease;
          cursor: move;
          padding: 8px;
        }

        @media (min-width: 768px) {
          .product-item {
            padding: 12px;
            margin-left: 50px;
            margin-right: 40px;
          }
        }

        .product-item.dragging {
          opacity: 0.5;
          transform: rotate(1deg);
        }

        .product-item.drag-over {
          border: 2px dashed #28a745;
          background-color: #f8fff8;
        }

        .mobile-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #eee;
        }

        @media (min-width: 768px) {
          .mobile-controls {
            display: none;
          }
        }

        .desktop-order-controls {
          display: none;
        }

        @media (min-width: 768px) {
          .desktop-order-controls {
            display: flex;
            position: absolute;
            left: -45px;
            top: 50%;
            transform: translateY(-50%);
            flex-direction: column;
            gap: 2px;
            align-items: center;
            z-index: 10;
          }
        }

        .desktop-drag-handle {
          display: none;
        }

        @media (min-width: 768px) {
          .desktop-drag-handle {
            display: block;
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            cursor: grab;
            padding: 4px;
            color: #999;
            font-size: 16px;
            user-select: none;
          }
        }

        .order-controls {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        @media (min-width: 768px) {
          .order-controls {
            flex-direction: column;
            gap: 2px;
          }
        }

        .order-btn {
          width: 28px;
          height: 26px;
          border: 1px solid #ccc;
          background: white;
          cursor: pointer;
          border-radius: 3px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
        }

        @media (min-width: 768px) {
          .order-btn {
            width: 24px;
            height: 22px;
            font-size: 11px;
          }
        }

        .order-btn:disabled {
          background: #f5f5f5;
          color: #999;
          cursor: not-allowed;
        }

        .order-btn:not(:disabled):hover {
          background: #f0f0f0;
        }

        .order-number {
          width: 28px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #555;
          background: #f8f8f8;
          border: 1px solid #ddd;
          border-radius: 3px;
        }

        @media (min-width: 768px) {
          .order-number {
            width: 24px;
            height: 18px;
            font-size: 11px;
          }
        }

        .mobile-drag-handle {
          cursor: grab;
          padding: 4px;
          color: #999;
          font-size: 16px;
          user-select: none;
        }

        @media (min-width: 768px) {
          .mobile-drag-handle {
            display: none;
          }
        }

        .form-comment-textarea {
          width: 100%;
          min-height: 70px;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ccc;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          box-sizing: border-box;
        }

        @media (min-width: 768px) {
          .form-comment-textarea {
            min-height: 80px;
            padding: 10px;
          }
        }

        .save-section {
          text-align: center;
          margin: 16px 0;
        }

        @media (min-width: 768px) {
          .save-section {
            margin: 24px 0;
          }
        }

        .error-message {
          color: #721c24;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 12px;
          font-size: 13px;
        }

        @media (min-width: 768px) {
          .error-message {
            font-size: 14px;
            padding: 10px;
          }
        }

        .save-btn {
          background-color: #28a745;
          color: white;
          padding: 10px 20px;
          font-size: 14px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 280px;
        }

        @media (min-width: 768px) {
          .save-btn {
            padding: 12px 24px;
            font-size: 16px;
            width: auto;
          }
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .save-btn:not(:disabled):hover {
          background-color: #218838;
        }

        .spacer {
          height: 30px;
        }

        @media (min-width: 768px) {
          .spacer {
            height: 60px;
          }
        }
      `}</style>

      <h1 className="title">
        Edit Form: {formName}
      </h1>
      
      {submitSuccess ? (
        <div className="success-box">
          <h3 className="success-title">
            Form saved successfully!
          </h3>
          <p className="success-message">Your changes have been saved.</p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="continue-btn"
          >
            Continue Editing
          </button>
        </div>
      ) : (
        <>
          <div className="section">
            <h2 className="section-title">
              Products in Form
            </h2>
            <p className="section-description">
              Use the arrow buttons to reorder products. The order here will be the order customers see.
            </p>
            <div className="products-container">
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
                    className={`product-item ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                  >
                    {/* Mobile controls */}
                    <div className="mobile-controls">
                      <div className="order-controls">
                        <button
                          onClick={() => moveProductUp(productName)}
                          disabled={index === 0}
                          className="order-btn"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <div className="order-number">
                          {index + 1}
                        </div>
                        <button
                          onClick={() => moveProductDown(productName)}
                          disabled={index === productOrder.length - 1}
                          className="order-btn"
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                      <div className="mobile-drag-handle">
                        ⋮⋮
                      </div>
                    </div>

                    {/* Desktop controls */}
                    <div className="desktop-order-controls">
                      <button
                        onClick={() => moveProductUp(productName)}
                        disabled={index === 0}
                        className="order-btn"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <div className="order-number">
                        {index + 1}
                      </div>
                      <button
                        onClick={() => moveProductDown(productName)}
                        disabled={index === productOrder.length - 1}
                        className="order-btn"
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>

                    <div className="desktop-drag-handle">
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
          
          <div className="section">
            <h2 className="section-title">
              Form Comment
            </h2>
            <p className="section-description">
              This comment will be shown to customers when they place an order.
            </p>
            <textarea
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              className="form-comment-textarea"
              placeholder="Enter a comment for this form..."
            />
          </div>
          
          <div className="save-section">
            {submitError && (
              <div className="error-message">
                {submitError}
              </div>
            )}
            
            <button 
              onClick={handleSaveChanges}
              disabled={isSubmitting}
              className="save-btn"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            
            <div className="spacer"></div>
          </div>
        </>
      )}
    </div>
  );
}

export default FormEditor;