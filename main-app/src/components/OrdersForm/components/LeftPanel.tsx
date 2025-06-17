// LeftPanel.tsx
import { useState } from 'react';

interface LeftPanelProps {
  pages: string[];
  onSelectForm: (form: string) => void;
  onEditOrder: () => void;
}

function LeftPanel({ pages, onSelectForm, onEditOrder }: LeftPanelProps) {
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  return (
    <div style={{ 
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh', 
      width: 'min(256px, 25vw)',
      backgroundColor: '#1f2937', 
      color: 'white', 
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 10,
      overflow: 'auto'
    }}>
      <h2 style={{ 
        fontSize: 'min(1.25rem, 4vw)', 
        fontWeight: 'bold', 
        marginBottom: '16px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        Order Management
      </h2>

      {/* Place New Order Section */}
      <div style={{ marginBottom: '24px' }}>
        <button
          style={{ 
            padding: '10px',
            backgroundColor: '#374151',
            borderRadius: '4px',
            textAlign: 'left',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: 'min(1rem, 3.5vw)',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}
          onClick={() => setIsNewOrderOpen(!isNewOrderOpen)}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
        >
          <span>Place New Order</span>
          <span style={{ transform: isNewOrderOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
            ▼
          </span>
        </button>

        {isNewOrderOpen && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            paddingLeft: '16px',
            borderLeft: '2px solid #4b5563'
          }}>
            {pages.map((page, index) => (
              <button
                key={index}
                style={{ 
                  padding: '8px', 
                  backgroundColor: '#374151', 
                  borderRadius: '4px',
                  textAlign: 'left',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 'min(0.9rem, 3.2vw)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onClick={() => onSelectForm(page)}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                title={page}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Edit Existing Order Button */}
      <button
        style={{ 
          padding: '10px',
          backgroundColor: '#374151',
          borderRadius: '4px',
          textAlign: 'left',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: 'min(1rem, 3.5vw)',
          width: '100%',
          marginBottom: '24px'
        }}
        onClick={onEditOrder}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
      >
        Edit Existing Order
      </button>
    </div>
  );
}

export default LeftPanel;