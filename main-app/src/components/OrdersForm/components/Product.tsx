import { useState, useEffect } from 'react';

interface Extra {
  name: string;
  minAmount: number;
  maxAmount: number;
  price: number;
}

interface ProductProps {
  name: string;
  description: string;
  extras: Extra[];
  soldOut: boolean;
  onSelect: (isSelected: boolean) => void;
  onExtraChange: (extraName: string, amount: number) => void;
  isSelected: boolean;
  selectedExtras: {[key: string]: number};
  inventoryError?: string;
}

function Product({ 
  name, 
  description, 
  extras = [], 
  soldOut = false,
  onSelect, 
  onExtraChange, 
  isSelected, 
  selectedExtras,
  inventoryError
}: ProductProps) {
  
  const getImageSrc = () => {
    return `http://localhost:5000/api/images/${encodeURIComponent(name)}`;
  };
  
  const handleSelection = () => {
    if (!soldOut) {
      onSelect(!isSelected);
    }
  };
  
  useEffect(() => {
    if (soldOut && isSelected) {
      onSelect(false);
    }
  }, [soldOut, isSelected, onSelect]);
  
  const handleExtraChange = (extraName: string, amount: number) => {
    onExtraChange(extraName, amount);
  };
  
  const calculateExtrasTotal = () => {
    return extras.reduce((total, extra) => {
      const amount = selectedExtras[extra.name] || 0;
      return total + (amount * extra.price);
    }, 0);
  };
  
  return (
    <div 
      style={{ 
        border: inventoryError 
          ? '2px solid #dc3545' 
          : (isSelected ? '2px solid #4CAF50' : '1px solid #ddd'),
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        cursor: soldOut ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        opacity: soldOut ? 0.6 : 1,
        backgroundColor: inventoryError 
          ? '#f8d7da' 
          : (soldOut ? '#f5f5f5' : 'white')
      }}
      onClick={handleSelection}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: '16px', position: 'relative' }}>
          <img 
            src={getImageSrc()}
            alt={name}
            style={{ 
              width: '100px', 
              height: '100px', 
              objectFit: 'cover',
              borderRadius: '4px',
              filter: soldOut ? 'grayscale(100%)' : 'none'
            }}
          />
          {soldOut && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-30deg)',
              backgroundColor: 'rgba(255, 0, 0, 0.7)',
              color: 'white',
              padding: '2px 8px',
              fontWeight: 'bold',
              borderRadius: '4px',
              fontSize: '14px',
              textTransform: 'uppercase'
            }}>
              Sold Out
            </div>
          )}
        </div>
        
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontWeight: 'bold', textAlign: 'center' }}>{name}</h3>
          <p style={{ margin: '0', color: '#666', textAlign: 'center' }}>{description}</p>
          {soldOut && (
            <p style={{ 
              margin: '8px 0 0 0', 
              color: 'red', 
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              Currently unavailable
            </p>
          )}
        </div>
      </div>
      
      {/* Inventory Error Display */}
      {inventoryError && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          borderRadius: '4px',
          marginTop: '10px',
          textAlign: 'center'
        }}>
          {inventoryError}
        </div>
      )}
      
      {isSelected && extras.length > 0 && !soldOut && (
        <div 
          style={{ 
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h4 style={{ marginTop: 0 }}>Extras</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', fontWeight: 'bold' }}>
            <div>Extra</div>
            <div>Amount</div>
            <div>Price</div>
          </div>
          
          {extras.map((extra, index) => (
            <div 
              key={index} 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr', 
                gap: '8px',
                padding: '8px 0',
                borderBottom: index < extras.length - 1 ? '1px solid #eee' : 'none'
              }}
            >
              <div>{extra.name}</div>
              <div>
                <select 
                  value={selectedExtras[extra.name] || extra.minAmount}
                  onChange={(e) => handleExtraChange(extra.name, parseInt(e.target.value))}
                  style={{ width: '100%', padding: '4px' }}
                >
                  {Array.from(
                    { length: extra.maxAmount - extra.minAmount + 1 }, 
                    (_, i) => extra.minAmount + i
                  ).map(num => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              <div>{extra.price} ILS</div>
            </div>
          ))}
          
          <div style={{ 
            marginTop: '16px', 
            textAlign: 'right', 
            fontWeight: 'bold' 
          }}>
            Price: {calculateExtrasTotal().toFixed(2)} ILS
          </div>
        </div>
      )}
    </div>
  );
}

export default Product;