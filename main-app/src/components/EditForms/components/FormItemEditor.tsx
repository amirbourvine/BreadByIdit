import { useState } from 'react';

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
  inventory?: number;
}

interface FormItemEditorProps {
  product: ProductData;
  isSelected: boolean;
  onSelect: (isSelected: boolean) => void;
  onProductChange: (updatedProduct: ProductData) => void;
}

function FormItemEditor({ 
  product, 
  isSelected, 
  onSelect, 
  onProductChange 
}: FormItemEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const getImageSrc = () => {
    // Use the full server URL for the image endpoint
    return `http://13.49.120.33/api/images/${encodeURIComponent(product.name)}`;
  };
  
  // Handle description change
  const handleDescriptionChange = (description: string) => {
    onProductChange({
      ...product,
      description
    });
  };
  
  // Handle extra change
  const handleExtraChange = (index: number, updatedExtra: Extra) => {
    const newExtras = [...product.extras];
    newExtras[index] = updatedExtra;
    
    onProductChange({
      ...product,
      extras: newExtras
    });
  };
  
  // Handle adding a new extra
  const handleAddExtra = () => {
    onProductChange({
      ...product,
      extras: [
        ...product.extras,
        { name: 'New Extra', minAmount: 0, maxAmount: 1, price: 1.00 }
      ]
    });
  };
  
  // Handle removing an extra
  const handleRemoveExtra = (index: number) => {
    const newExtras = [...product.extras];
    newExtras.splice(index, 1);
    
    onProductChange({
      ...product,
      extras: newExtras
    });
  };

  // Handle inventory change
  const handleInventoryChange = (inventory: number) => {
    // Automatically set soldOut to true if inventory is 0
    const soldOut = inventory === 0;
    
    onProductChange({
      ...product,
      inventory,
      soldOut
    });
  };
  
  return (
    <div 
      style={{ 
        border: isSelected ? '2px solid #4CAF50' : '1px solid #ddd',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
        transition: 'all 0.3s ease',
        backgroundColor: 'white',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
        gap: '12px'
      }}>
        {/* Mobile: Checkbox and inventory row */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          order: window.innerWidth <= 768 ? 1 : 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              style={{ 
                width: '18px', 
                height: '18px', 
                cursor: 'pointer',
                marginRight: '6px'
              }}
            />
            <span style={{ fontSize: '14px' }}>Existent</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>Inventory:</span>
            <input
              type="number"
              min="0"
              value={product.inventory ?? 12}
              onChange={(e) => handleInventoryChange(parseInt(e.target.value) || 0)}
              style={{ 
                width: '60px', 
                padding: '4px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
        
        {/* Image and content container */}
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
          gap: '12px',
          flex: 1,
          order: window.innerWidth <= 768 ? 2 : 0
        }}>
          {/* Image */}
          {!imageError && (
            <div style={{ 
              flexShrink: 0,
              alignSelf: window.innerWidth <= 768 ? 'center' : 'flex-start'
            }}>
              <img 
                src={getImageSrc()}
                alt={product.name}
                style={{ 
                  width: window.innerWidth <= 768 ? '80px' : '100px', 
                  height: window.innerWidth <= 768 ? '80px' : '100px', 
                  objectFit: 'cover',
                  borderRadius: '4px',
                  filter: !isSelected || product.soldOut ? 'grayscale(100%)' : 'none'
                }}
                onError={() => setImageError(true)}
              />
            </div>
          )}
          
          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontWeight: 'bold',
                fontSize: window.innerWidth <= 768 ? '16px' : '18px',
                textAlign: window.innerWidth <= 768 ? 'center' : 'left'
              }}>
                {product.name}
              </h3>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Description:
              </label>
              <textarea
                value={product.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  resize: 'vertical',
                  minHeight: '60px',
                  boxSizing: 'border-box'
                }}
                rows={2}
              />
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '14px',
                width: window.innerWidth <= 768 ? '100%' : 'auto',
                justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-start'
              }}
            >
              <span>{isExpanded ? 'Hide Extras' : 'Edit Extras'}</span>
              <span>{isExpanded ? '▲' : '▼'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div 
          style={{ 
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            overflow: 'hidden'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <h4 style={{ margin: 0, fontSize: '16px' }}>Extras</h4>
            <button
              onClick={handleAddExtra}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              + Add Extra
            </button>
          </div>
          
          {/* Mobile: Stack extras vertically */}
          {window.innerWidth <= 768 ? (
            <div>
              {product.extras.map((extra, index) => (
                <div 
                  key={index} 
                  style={{ 
                    padding: '12px',
                    marginBottom: '12px',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #eee'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Extra {index + 1}</span>
                    <button
                      onClick={() => handleRemoveExtra(index)}
                      style={{
                        backgroundColor: '#F87171',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Name:</label>
                      <input
                        type="text"
                        value={extra.name}
                        onChange={(e) => handleExtraChange(index, { ...extra, name: e.target.value })}
                        style={{ 
                          width: '100%', 
                          padding: '6px', 
                          borderRadius: '4px', 
                          border: '1px solid #ddd',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Min:</label>
                        <input
                          type="number"
                          min="0"
                          value={extra.minAmount}
                          onChange={(e) => handleExtraChange(index, { ...extra, minAmount: parseInt(e.target.value) || 0 })}
                          style={{ 
                            width: '100%', 
                            padding: '6px', 
                            borderRadius: '4px', 
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Max:</label>
                        <input
                          type="number"
                          min={extra.minAmount}
                          value={extra.maxAmount}
                          onChange={(e) => handleExtraChange(index, { ...extra, maxAmount: parseInt(e.target.value) || 1 })}
                          style={{ 
                            width: '100%', 
                            padding: '6px', 
                            borderRadius: '4px', 
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Price (₪):</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={extra.price}
                          onChange={(e) => handleExtraChange(index, { ...extra, price: parseFloat(e.target.value) || 0 })}
                          style={{ 
                            width: '100%', 
                            padding: '6px', 
                            borderRadius: '4px', 
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop: Grid layout
            <div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 1fr auto', 
                gap: '8px', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                fontSize: '14px',
                padding: '0 4px'
              }}>
                <div>Name</div>
                <div>Min Amount</div>
                <div>Max Amount</div>
                <div>Price (₪)</div>
                <div></div>
              </div>
              
              {product.extras.map((extra, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1fr 1fr auto', 
                    gap: '8px',
                    padding: '8px 4px',
                    borderBottom: index < product.extras.length - 1 ? '1px solid #eee' : 'none',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <input
                      type="text"
                      value={extra.name}
                      onChange={(e) => handleExtraChange(index, { ...extra, name: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '6px', 
                        borderRadius: '4px', 
                        border: '1px solid #ddd',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      value={extra.minAmount}
                      onChange={(e) => handleExtraChange(index, { ...extra, minAmount: parseInt(e.target.value) || 0 })}
                      style={{ 
                        width: '100%', 
                        padding: '6px', 
                        borderRadius: '4px', 
                        border: '1px solid #ddd',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min={extra.minAmount}
                      value={extra.maxAmount}
                      onChange={(e) => handleExtraChange(index, { ...extra, maxAmount: parseInt(e.target.value) || 1 })}
                      style={{ 
                        width: '100%', 
                        padding: '6px', 
                        borderRadius: '4px', 
                        border: '1px solid #ddd',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={extra.price}
                      onChange={(e) => handleExtraChange(index, { ...extra, price: parseFloat(e.target.value) || 0 })}
                      style={{ 
                        width: '100%', 
                        padding: '6px', 
                        borderRadius: '4px', 
                        border: '1px solid #ddd',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => handleRemoveExtra(index)}
                      style={{
                        backgroundColor: '#F87171',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FormItemEditor;