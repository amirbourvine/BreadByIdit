import { useState, useEffect } from 'react';

interface LeftPanelProps {
  pages: string[];
  onSelectForm: (form: string) => void;
  onEditOrder: () => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  isMobile: boolean;
}

function LeftPanel({ 
  pages, 
  onSelectForm, 
  onEditOrder,
  panelOpen,
  setPanelOpen,
  isMobile
}: LeftPanelProps) {
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  // Close panel when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !panelOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const panel = document.querySelector('.left-panel');
      if (panel && !panel.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, panelOpen, setPanelOpen]);

  // Close panel when route changes on mobile
  useEffect(() => {
    if (isMobile && panelOpen) {
      setPanelOpen(false);
    }
  }, [onSelectForm, onEditOrder, isMobile, panelOpen, setPanelOpen]);

  return (
    <div 
      className="left-panel"
      style={{ 
        position: isMobile ? 'fixed' : 'fixed',
        left: isMobile ? (panelOpen ? 0 : '-100%') : 0,
        top: 0,
        height: '100vh', 
        width: isMobile ? '80vw' : 'min(256px, 25vw)',
        backgroundColor: '#1f2937', 
        color: 'white', 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 30,
        overflow: 'auto',
        transition: 'left 0.3s ease, width 0.3s ease'
      }}
    >
      {/* Close button for mobile */}
      {isMobile && (
        <button 
          onClick={() => setPanelOpen(false)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'transparent',
            color: 'white',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      )}
      
      <h2 style={{ 
        fontSize: '1.25rem', 
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
            fontSize: '1rem',
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
          <span style={{ 
            transform: isNewOrderOpen ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.3s',
            fontSize: '0.8rem'
          }}>
            ▼
          </span>
        </button>

        {isNewOrderOpen && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            paddingLeft: '8px',
            borderLeft: '2px solid #4b5563'
          }}>
            {pages.map((page) => (
              <button
                key={page}
                style={{ 
                  padding: '8px', 
                  backgroundColor: '#374151', 
                  borderRadius: '4px',
                  textAlign: 'left',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
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
          fontSize: '1rem',
          width: '100%',
          marginBottom: '24px'
        }}
        onClick={onEditOrder}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
      >
        Edit Existing Order
      </button>
      
      {/* Collapse button for desktop */}
      {!isMobile && (
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          style={{
            marginTop: 'auto',
            padding: '8px',
            backgroundColor: '#374151',
            borderRadius: '4px',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {panelOpen ? '◀ Collapse' : '▶ Expand'}
        </button>
      )}
    </div>
  );
}

export default LeftPanel;