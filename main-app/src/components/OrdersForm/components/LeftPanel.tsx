import { useState, useEffect } from 'react';

interface LeftPanelProps {
  pages: string[];
  onSelectForm: (form: string) => void;
  onEditOrder: () => void;
  panelOpen: boolean;
  togglePanel: () => void;
  isMobile: boolean;
}

function LeftPanel({ 
  pages, 
  onSelectForm, 
  onEditOrder,
  panelOpen,
  togglePanel,
  isMobile
}: LeftPanelProps) {
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  // Close dropdown when panel closes
  useEffect(() => {
    if (!panelOpen) {
      setIsNewOrderOpen(false);
    }
  }, [panelOpen]);

  // Handle clicks outside panel on mobile
  useEffect(() => {
    if (!isMobile || !panelOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const panel = document.querySelector('.left-panel');
      const target = e.target as Node;
      
      // Don't close if clicking on the toggle button or panel itself
      if (panel && !panel.contains(target)) {
        const toggleButton = document.querySelector('[data-toggle-button]');
        if (toggleButton && !toggleButton.contains(target)) {
          togglePanel();
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, panelOpen, togglePanel]);

  const getPanelStyle = () => {
    if (isMobile) {
      return {
        position: 'fixed' as const,
        left: panelOpen ? 0 : '-100%',
        top: 0,
        height: '100vh',
        width: '85vw',
        maxWidth: '320px',
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column' as const,
        boxShadow: panelOpen ? '4px 0 15px rgba(0, 0, 0, 0.2)' : 'none',
        zIndex: 30,
        overflow: 'auto',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderTopRightRadius: '12px',
        borderBottomRightRadius: '12px'
      };
    } else {
      return {
        position: 'fixed' as const,
        left: panelOpen ? 0 : '-256px',
        top: 0,
        height: '100vh',
        width: '256px',
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column' as const,
        boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 30,
        overflow: 'auto',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      };
    }
  };

  const handleFormSelect = (page: string) => {
    onSelectForm(page);
    // setIsNewOrderOpen(false);
  };

  const handleHomeClick = () => {
    onSelectForm('Home');
    // setIsNewOrderOpen(false);
  };

  const handleEditOrder = () => {
    onEditOrder();
    // setIsNewOrderOpen(false);
  };

  // Button style configuration
  const topButtonStyle = {
    padding: '14px 16px',
    backgroundColor: '#374151',
    borderRadius: '8px',
    textAlign: 'left' as const,
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: isMobile ? '1.1rem' : '1rem',
    fontWeight: '500' as const,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '12px' // Consistent spacing between buttons
  };

  const dropdownButtonStyle = {
    padding: isMobile ? '12px 14px' : '10px 12px',
    backgroundColor: '#4b5563',
    borderRadius: '6px',
    textAlign: 'left' as const,
    border: 'none',
    color: '#f3f4f6',
    cursor: 'pointer',
    fontSize: isMobile ? '1rem' : '0.9rem',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    transition: 'all 0.2s ease',
    fontWeight: '400' as const
  };

  // Filter out "Home" page from dropdown
  const filteredPages = pages.filter(page => page !== "Home");

  return (
    <div 
      className="left-panel"
      style={getPanelStyle()}
    >
      {/* Close button for mobile */}
      {isMobile && (
        <button 
          onClick={togglePanel}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            fontSize: '20px',
            cursor: 'pointer',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
        >
          ✕
        </button>
      )}
      
      <h2 style={{ 
        fontSize: isMobile ? '1.5rem' : '1.25rem', 
        fontWeight: 'bold', 
        marginBottom: '24px',
        marginTop: isMobile ? '40px' : '0',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: '#f9fafb'
      }}>
        Order Management
      </h2>

      {/* Home Button */}
      <button
        style={topButtonStyle}
        onClick={handleHomeClick}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#4b5563';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#374151';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span>Home</span>
      </button>

      {/* Place New Order Section */}
      <div>
        <button
          style={topButtonStyle}
          onClick={() => setIsNewOrderOpen(!isNewOrderOpen)}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#4b5563';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#374151';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>Place New Order</span>
          <span style={{ 
            transform: isNewOrderOpen ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.3s ease',
            fontSize: '0.9rem'
          }}>
            ▼
          </span>
        </button>

        {isNewOrderOpen && filteredPages.length > 0 && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '8px',
            paddingLeft: '12px',
            borderLeft: '3px solid #6366f1',
            marginLeft: '8px',
            paddingTop: '4px',
            marginBottom: '12px' // Maintain spacing below dropdown
          }}>
            {filteredPages.map((page) => (
              <button
                key={page}
                style={dropdownButtonStyle}
                onClick={() => handleFormSelect(page)}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#6b7280';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
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
        style={topButtonStyle}
        onClick={handleEditOrder}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#4b5563';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#374151';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        Edit Existing Order
      </button>
      
      {/* Collapse button for desktop only */}
      {!isMobile && (
        <button
  onClick={togglePanel}
  style={{
    ...topButtonStyle,
    marginTop: 'auto',
    marginBottom: '0',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    transform: panelOpen ? 'translateY(0)' : 'translateY(-5px) !important'
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.backgroundColor = '#4f46e5';
    e.currentTarget.style.transform = panelOpen ? 'translateY(-1px)' : 'translateY(-6px)';
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.backgroundColor = '#6366f1';
    e.currentTarget.style.transform = panelOpen ? 'translateY(0)' : 'translateY(-5px)';
  }}
>
  {panelOpen ? '◀ Collapse' : '▶ Expand'}
</button>
      )}
    </div>
  );
}

export default LeftPanel;