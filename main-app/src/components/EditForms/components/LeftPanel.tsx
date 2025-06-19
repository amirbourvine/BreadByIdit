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
  onEditSourdough
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
                padding: '8px', 
                backgroundColor: '#10B981', 
                borderRadius: '4px', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer', 
                marginBottom: '8px' 
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
                marginTop: '16px', 
                padding: '8px', 
                backgroundColor: '#3B82F6', 
                borderRadius: '4px', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer' 
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
            alignItems: 'center', 
            padding: '8px', 
            backgroundColor: '#374151', 
            color: 'white', 
            cursor: 'pointer',
            borderRadius: '4px',
            marginBottom: '8px'
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
                        padding: '8px', 
                        backgroundColor: '#6366F1', 
                        borderRadius: '4px', 
                        border: 'none', 
                        color: 'white', 
                        cursor: 'pointer' 
                      }}
                    >
                      Products
                    </button>
                    <button 
                      onClick={() => onViewClients(form)}
                      style={{ 
                        flex: 1, 
                        padding: '8px', 
                        backgroundColor: '#EC4899', 
                        borderRadius: '4px', 
                        border: 'none', 
                        color: 'white', 
                        cursor: 'pointer' 
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
                marginBottom: '8px',
                padding: '8px', 
                backgroundColor: '#8B5CF6', 
                borderRadius: '4px', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer' 
              }}
            >
              Add New Product
            </button>
            
            <button 
              onClick={onDeleteProduct} 
              style={{ 
                marginBottom: '8px',
                padding: '8px', 
                backgroundColor: '#EF4444', 
                borderRadius: '4px', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer' 
              }}
            >
              Delete Product
            </button>

            {/* New Sourdough button */}
            <button 
              onClick={onEditSourdough} 
              style={{ 
                padding: '8px', 
                backgroundColor: '#D97706', 
                borderRadius: '4px', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer' 
              }}
            >
              Contents
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeftPanel;