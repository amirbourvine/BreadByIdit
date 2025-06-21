import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface LeftPanelProps {
  forms: string[];
  onSelectForm: (form: string) => void;
  onCreateForm: () => void;
  onDeleteForm: (form: string) => void;
  currentForm: string;
  onSaveVisibility: (visibilityData: { [key: string]: boolean }) => void;
  onAddNewProduct: () => void;
  onDeleteProduct: () => void;
  onViewProducts: (form: string) => void; 
  onViewClients: (form: string) => void;
  onEditSourdough: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile: boolean;
}

function LeftPanel({ 
  forms, 
  onSelectForm, 
  onCreateForm, 
  onDeleteForm, 
  currentForm, 
  onSaveVisibility,
  onAddNewProduct,
  onDeleteProduct,
  onViewProducts,
  onViewClients,
  onEditSourdough,
  isCollapsed,
  onToggleCollapse,
  isMobile
}: LeftPanelProps) {
  const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});
  const [openSections, setOpenSections] = useState({
    editForms: true,
    viewOrders: false,
    editProducts: false
  });

  // Initialize visibility state when forms change
  useEffect(() => {
    const initialVisibility: { [key: string]: boolean } = {};
    forms.forEach((form) => {
      initialVisibility[form] = true; // Default to true
    });
    setVisibility(initialVisibility);
  }, [forms]);

  // Handle checkbox toggle
  const handleCheckboxChange = (form: string) => {
    setVisibility((prev) => ({
      ...prev,
      [form]: !prev[form],
    }));
  };

  // Save changes
  const handleSaveChanges = () => {
    onSaveVisibility(visibility);
  };

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Dropdown header style
  const dropdownHeaderStyle = {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '8px', 
    backgroundColor: '#374151', 
    color: 'white', 
    cursor: 'pointer',
    borderRadius: '4px',
    marginBottom: '8px'
  };

  return (
    <div style={{ 
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh', 
      width: isCollapsed ? '60px' : (isMobile ? '80vw' : 'min(256px, 25vw)'),
      backgroundColor: '#1f2937', 
      color: 'white', 
      padding: isCollapsed ? '8px' : (isMobile ? '12px' : '16px'),
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 10,
      overflow: 'auto',
      transition: 'width 0.3s ease'
    }}>
      <button
        onClick={onToggleCollapse}
        style={{
          position: 'absolute',
          top: '16px',
          right: isCollapsed ? '8px' : '16px',
          width: '32px',
          height: '32px',
          backgroundColor: '#374151',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          zIndex: 11
        }}
      >
        {isCollapsed ? '→' : '←'}
      </button>

      {!isCollapsed && (
      <>
      <h2 style={{ fontSize: 'min(1.25rem, 4vw)', fontWeight: 'bold', marginBottom: '16px' }}>
        Form Manager
      </h2>

      {/* Edit Forms Section */}
      <div>
        <div 
          style={dropdownHeaderStyle} 
          onClick={() => toggleSection('editForms')}
        >
          Edit Forms
          {openSections.editForms ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        
        {openSections.editForms && (
          <div>
            <button 
              onClick={onCreateForm} 
              style={{ 
                width: '100%',
                padding: isMobile ? '12px 8px' : '8px', 
                backgroundColor: '#10B981', 
                borderRadius: '4px', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer', 
                marginBottom: '8px',
                fontSize: isMobile ? '14px' : '12px'
              }}
            >
              + Create New Form
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {forms.map((form) => 
                form === "Home" ? (
                  <div key={form} />
                ) : (
                  <div 
                    key={form} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      backgroundColor: currentForm === form ? '#4B5563' : '#374151', 
                      borderRadius: '4px', 
                      padding: '8px' 
                    }}
                  >
                    <button 
                      style={{ 
                        flex: 1, 
                        textAlign: 'left', 
                        border: 'none', 
                        color: 'white', 
                        cursor: 'pointer', 
                        backgroundColor: 'transparent' 
                      }}
                      onClick={() => onSelectForm(form)}
                    >
                      {form}
                    </button>

                    <input 
                      type="checkbox" 
                      checked={visibility[form] ?? true} 
                      onChange={() => handleCheckboxChange(form)} 
                      style={{ cursor: 'pointer' }} 
                    />

                    <button 
                      onClick={() => onDeleteForm(form)} 
                      style={{ 
                        backgroundColor: 'transparent', 
                        border: 'none', 
                        color: '#F87171', 
                        cursor: 'pointer' 
                      }}
                    >
                      ×
                    </button>
                  </div>
                )
              )}
            </div>

            <button 
              onClick={handleSaveChanges} 
              style={{ 
                width: '100%',
                marginTop: '16px', 
                padding: isMobile ? '12px 8px' : '8px', 
                backgroundColor: '#3B82F6', 
                borderRadius: '4px', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer',
                fontSize: isMobile ? '14px' : '12px'
              }}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* View Orders Section */}
      <div style={{ marginTop: '16px' }}>
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            gap: '8px', 
            marginBottom: '16px',
            width: '100%'
          }}
          onClick={() => toggleSection('viewOrders')}
        >
          View Orders
          {openSections.viewOrders ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        
        {openSections.viewOrders && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            padding: '8px', 
            backgroundColor: '#1f2937' 
          }}>
            {forms.map((form) => 
              form === "Home" ? null : (
                <div key={form}>
                  <div style={{ 
                    textAlign: 'center', 
                    marginBottom: '8px', 
                    fontWeight: 'bold',
                    color: '#a0aec0' 
                  }}>
                    {form}
                  </div>
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      gap: '8px', 
                      marginBottom: '16px' 
                    }}
                  >
                    <button 
                      onClick={() => onViewProducts(form)}
                      style={{ 
                        flex: 1, 
                        padding: isMobile ? '12px 4px' : '8px', 
                        backgroundColor: '#6366F1', 
                        borderRadius: '4px', 
                        border: 'none', 
                        color: 'white', 
                        cursor: 'pointer',
                        fontSize: isMobile ? '12px' : '11px',
                        minWidth: 0
                      }}
                    >
                      Products
                    </button>
                    <button 
                      onClick={() => onViewClients(form)}
                      style={{ 
                        flex: 1, 
                        padding: isMobile ? '12px 4px' : '8px', 
                        backgroundColor: '#EC4899', 
                        borderRadius: '4px', 
                        border: 'none', 
                        color: 'white', 
                        cursor: 'pointer',
                        fontSize: isMobile ? '12px' : '11px',
                        minWidth: 0
                      }}
                    >
                      Clients
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Edit Products Section */}
      <div style={{ marginTop: '16px' }}>
        <div 
          style={dropdownHeaderStyle} 
          onClick={() => toggleSection('editProducts')}
        >
          Edit Products
          {openSections.editProducts ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        
        {openSections.editProducts && (
          <div>
            {/* Existing buttons */}
            <button 
              onClick={onAddNewProduct} 
              style={{ 
                width: '100%',
                marginBottom: '8px',
                padding: isMobile ? '12px 8px' : '8px', 
                backgroundColor: '#8B5CF6', 
                borderRadius: '4px', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer',
                fontSize: isMobile ? '14px' : '12px'
              }}
            >
              Add New Product
            </button>
            
            <button 
              onClick={onDeleteProduct} 
              style={{ 
                width: '100%',
                marginBottom: '8px',
                padding: isMobile ? '12px 8px' : '8px', 
                backgroundColor: '#EF4444', 
                borderRadius: '4px', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer',
                fontSize: isMobile ? '14px' : '12px'
              }}
            >
              Delete Product
            </button>

            {/* New Sourdough button */}
            <button 
              onClick={onEditSourdough} 
              style={{ 
                width: '100%',
                padding: isMobile ? '12px 8px' : '8px', 
                backgroundColor: '#D97706', 
                borderRadius: '4px', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer',
                fontSize: isMobile ? '14px' : '12px'
              }}
            >
              Contents
            </button>
          </div>
        )}
      </div>
      </>)}
    </div>
  )
}

export default LeftPanel;