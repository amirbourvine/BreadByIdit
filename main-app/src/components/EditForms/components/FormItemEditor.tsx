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
        padding: '16px',
        marginBottom: '16px',
        transition: 'all 0.3s ease',
        backgroundColor: 'white'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ marginRight: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              style={{ 
                width: '20px', 
                height: '20px', 
                cursor: 'pointer',
                marginTop: '5px' 
              }}
            />
            <span style={{ fontSize: '14px', marginLeft: '4px' }}>Existent</span>
          </div>
        </div>
        
        <div style={{ marginRight: '16px' }}>
          {!imageError && (
            <img 
              src={getImageSrc()}
              alt={product.name}
              style={{ 
                width: '100px', 
                height: '100px', 
                objectFit: 'cover',
                borderRadius: '4px',
                filter: !isSelected || product.soldOut ? 'grayscale(100%)' : 'none'
              }}
              onError={() => setImageError(true)}
            />
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: '0', fontWeight: 'bold' }}>{product.name}</h3>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', marginRight: '8px' }}>Inventory:</span>
              <input
                type="number"
                min="0"
                value={product.inventory ?? 12}
                onChange={(e) => handleInventoryChange(parseInt(e.target.value) || 0)}
                style={{ 
                  width: '60px', 
                  padding: '4px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Description:
              <textarea
                value={product.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
                rows={2}
              />
            </label>
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
              gap: '5px'
            }}
          >
            <span>{isExpanded ? 'Hide Extras' : 'Edit Extras'}</span>
            <span>{isExpanded ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div 
          style={{ 
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ marginTop: 0, marginBottom: 0 }}>Extras</h4>
            <button
              onClick={handleAddExtra}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 10px',
                cursor: 'pointer'
              }}
            >
              + Add Extra
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '8px', fontWeight: 'bold', marginBottom: '8px' }}>
            <div>Name</div>
            <div>Min Amount</div>
            <div>Max Amount</div>
            <div>Price (ILS)</div>
            <div></div>
          </div>
          
          {product.extras.map((extra, index) => (
            <div 
              key={index} 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr 1fr auto', 
                gap: '8px',
                padding: '8px 0',
                borderBottom: index < product.extras.length - 1 ? '1px solid #eee' : 'none'
              }}
            >
              <div>
                <input
                  type="text"
                  value={extra.name}
                  onChange={(e) => handleExtraChange(index, { ...extra, name: e.target.value })}
                  style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  value={extra.minAmount}
                  onChange={(e) => handleExtraChange(index, { ...extra, minAmount: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <input
                  type="number"
                  min={extra.minAmount}
                  value={extra.maxAmount}
                  onChange={(e) => handleExtraChange(index, { ...extra, maxAmount: parseInt(e.target.value) || 1 })}
                  style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={extra.price}
                  onChange={(e) => handleExtraChange(index, { ...extra, price: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #ddd' }}
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
                    cursor: 'pointer'
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
  );
}

export default FormItemEditor;