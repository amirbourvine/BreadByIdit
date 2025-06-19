import { useState, useEffect } from 'react'
import './App.css'
import LeftPanel from './components/LeftPanel'
import FormEditor from './components/FormEditor';
import Home from './components/Home';
import AddNewItem from './components/AddNewItem';
import DeleteProduct from './components/DeleteProduct';
import { getDates, getProducts, createNewForm, deleteForm, updateFormVisibility } from './services/api';
import OrdersClients from './components/OrdersClients';
import OrdersProducts from './components/OrdersProducts';
import EditContents from './components/EditSourdough';

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
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [, setShowPasswordPopup] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  
  const [forms, setForms] = useState<string[]>(["Home"]);
  const [selectedForm, setSelectedForm] = useState<string>("Home");
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormNameDialog, setShowFormNameDialog] = useState<boolean>(false);
  const [newFormName, setNewFormName] = useState<string>("");
  const [showAddNewProduct, setShowAddNewProduct] = useState<boolean>(false);
  const [showDeleteProduct, setShowDeleteProduct] = useState<boolean>(false);
  const [formComment, setFormComment] = useState<string>("");
  const [showOrdersClients, setShowOrdersClients] = useState<boolean>(false);
  const [selectedOrdersClientsForm, setSelectedOrdersClientsForm] = useState<string>("");
  const [showOrdersProducts, setShowOrdersProducts] = useState<boolean>(false);
  const [selectedOrdersProductsForm, setSelectedOrdersProductsForm] = useState<string>("");
  const [showEditSourdough, setShowEditSourdough] = useState<boolean>(false);
  
  // Mobile responsive states
  const [panelOpen, setPanelOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect mobile screens
  useEffect(() => {
    const handleResize = () => {
      const wasMobile = isMobile;
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      
      // If switching from mobile to desktop, open panel
      if (wasMobile && !newIsMobile) {
        setPanelOpen(true);
      }
      // If switching from desktop to mobile, close panel
      if (!wasMobile && newIsMobile) {
        setPanelOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Password protection
  const handlePasswordSubmit = () => {
    if (passwordInput === "amiR21") {
      setIsAuthenticated(true);
      setShowPasswordPopup(false);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  // Fetch forms only after authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchForms();
    }
  }, [isAuthenticated]);

  const handleShowEditSourdough = () => {
    setShowEditSourdough(true);
    setShowAddNewProduct(false);
    setShowDeleteProduct(false);
    setShowOrdersClients(false);
    setShowOrdersProducts(false);
    setSelectedForm("");
    // Close panel on mobile after selection
    if (isMobile) {
      setPanelOpen(false);
    }
  };

  const handleViewClients = (form: string) => {
    setSelectedOrdersClientsForm(form);
    setShowOrdersClients(true);
    setShowOrdersProducts(false);
    setShowAddNewProduct(false);
    setShowDeleteProduct(false);
    setShowEditSourdough(false);
    setSelectedForm("");
    // Close panel on mobile after selection
    if (isMobile) {
      setPanelOpen(false);
    }
  };

  const handleViewProducts = (form: string) => {
    setSelectedOrdersProductsForm(form);
    setShowOrdersProducts(true);
    setShowOrdersClients(false);
    setShowAddNewProduct(false);
    setShowDeleteProduct(false);
    setShowEditSourdough(false);
    setSelectedForm("");
    // Close panel on mobile after selection
    if (isMobile) {
      setPanelOpen(false);
    }
  };

  const fetchForms = async () => {
    try {
      setLoading(true);
      const dates = await getDates();
      setForms(["Home", ...dates]);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch forms:', err);
      setError('Failed to load available forms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProductsForForm = async () => {
      if (!isAuthenticated || selectedForm === "Home" || !forms.includes(selectedForm)) {
        return;
      }

      try {
        setLoading(true);
        const productsData = await getProducts(selectedForm);
        setProducts(productsData.products);
        setFormComment(productsData.comment);
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch products for ${selectedForm}:`, err);
        setError(`Failed to load products for ${selectedForm}. Please try again later.`);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsForForm();
  }, [selectedForm, forms, isAuthenticated]);

  const handleSelectForm = (formName: string) => {
    setSelectedForm(formName);
    setShowAddNewProduct(false);
    setShowDeleteProduct(false);
    setShowOrdersClients(false);
    setShowOrdersProducts(false);
    setShowEditSourdough(false);
    // Close panel on mobile after selection
    if (isMobile) {
      setPanelOpen(false);
    }
  };

  function getNextFridayOrTuesday(): string {
    const now = new Date();
    const FRIDAY = 5;
    const TUESDAY = 2;
    const currentDay = now.getDay();
    
    let daysUntilFriday = (FRIDAY - currentDay + 7) % 7;
    if (currentDay === FRIDAY && now.getHours() < 13) {
      daysUntilFriday = 0;
    }
    
    let daysUntilTuesday = (TUESDAY - currentDay + 7) % 7;
    if (currentDay === TUESDAY && now.getHours() < 14) {
      daysUntilTuesday = 0;
    }
    
    const nextFriday = new Date(now);
    nextFriday.setDate(now.getDate() + daysUntilFriday);
    nextFriday.setHours(13, 0, 0, 0);
    
    const nextTuesday = new Date(now);
    nextTuesday.setDate(now.getDate() + daysUntilTuesday);
    nextTuesday.setHours(14, 0, 0, 0);
    
    let chosenDate;
    if (nextFriday <= nextTuesday) {
      chosenDate = nextFriday;
    } else {
      chosenDate = nextTuesday;
    }
    
    const weekday = chosenDate.getDay() === FRIDAY ? "Friday" : "Tuesday";
    const day = chosenDate.getDate();
    const month = chosenDate.getMonth() + 1;
    const year = chosenDate.getFullYear().toString().substr(-2);
    const hour = chosenDate.getDay() === FRIDAY ? 13 : 14;
    
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;
    
    return `${weekday} ${formattedDay}.${formattedMonth}.${year} ${hour}:00`;
  }

  const handleOpenCreateFormDialog = () => {
    const defaultName = getNextFridayOrTuesday();
    setNewFormName(defaultName);
    setShowFormNameDialog(true);
  };

  const handleCreateForm = async () => {
    if (!newFormName.trim()) {
      alert("Please enter a form name");
      return;
    }
    
    try {
      setLoading(true);
      setShowFormNameDialog(false);
      await createNewForm(newFormName);
      await fetchForms();
      setSelectedForm(newFormName);
      setNewFormName("");
    } catch (err) {
      console.error('Failed to create new form:', err);
      setError('Failed to create new form. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelFormCreation = () => {
    setShowFormNameDialog(false);
    setNewFormName("");
  };

  const handleDeleteForm = async (formName: string) => {
    if (formName === "Home") return;
    
    try {
      setLoading(true);
      await deleteForm(formName);
      await fetchForms();
      if (selectedForm === formName) {
        setSelectedForm("Home");
      }
    } catch (err) {
      console.error(`Failed to delete form ${formName}:`, err);
      setError(`Failed to delete form. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const saveVisibilityChanges = async (visibilityData: { [key: string]: boolean }) => {
    try {
      setLoading(true);
      await updateFormVisibility(visibilityData);
      setError(null);
    } catch (err) {
      console.error('Failed to update visibility:', err);
      setError('Failed to update visibility. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowAddNewProduct = () => {
    setShowAddNewProduct(true);
    setShowDeleteProduct(false);
    setShowOrdersClients(false);
    setShowOrdersProducts(false);
    setShowEditSourdough(false);
    setSelectedForm("");
    // Close panel on mobile after selection
    if (isMobile) {
      setPanelOpen(false);
    }
  };

  const handleShowDeleteProduct = () => {
    setShowDeleteProduct(true);
    setShowAddNewProduct(false);
    setShowOrdersClients(false);
    setShowOrdersProducts(false);
    setShowEditSourdough(false);
    setSelectedForm("");
    // Close panel on mobile after selection
    if (isMobile) {
      setPanelOpen(false);
    }
  };

  const handleSaveNewProduct = async (product: ProductData) => {
    console.log('Saving new product:', product);
    setShowAddNewProduct(false);
  };

  const handleCancelNewProduct = () => {
    setShowAddNewProduct(false);
  };

  const handleCancelDeleteProduct = () => {
    setShowDeleteProduct(false);
  };

  const togglePanel = () => {
    setPanelOpen(!panelOpen);
  };

  // Calculate main content margin based on panel state and screen size
  const getMainContentStyle = () => {
    if (isMobile) {
      // On mobile, main content always takes full width
      return {
        marginLeft: 0,
        flex: '1',
        width: '100%',
        overflow: 'auto',
        position: 'relative' as const,
        minHeight: '100vh'
      };
    } else {
      // On desktop, adjust margin based on panel state
      return {
        marginLeft: panelOpen ? '256px' : '0',
        flex: '1',
        overflow: 'auto',
        position: 'relative' as const,
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh'
      };
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          width: '350px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
            Enter Password
          </h2>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              borderRadius: '6px',
              border: `1px solid ${passwordError ? 'red' : '#ddd'}`,
              boxSizing: 'border-box',
              marginBottom: '15px'
            }}
            placeholder="Enter password..."
            autoFocus
          />
          {passwordError && (
            <p style={{ color: 'red', margin: '0 0 15px 0' }}>{passwordError}</p>
          )}
          <button
            onClick={handlePasswordSubmit}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Unlock App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      margin: 0, 
      padding: 0,
      position: 'absolute',
      left: 0,
      top: 0,
      overflow: 'hidden'
    }}>
      {/* Overlay for mobile when panel is open */}
      {isMobile && panelOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 25
          }}
          onClick={() => setPanelOpen(false)}
        />
      )}

      {/* Expand button for desktop when panel is collapsed */}
      {!isMobile && !panelOpen && (
        <button
          onClick={togglePanel}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 20,
            backgroundColor: '#1f2937',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            fontSize: '16px',
            cursor: 'pointer',
            width: '48px',
            height: '48px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#374151';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#1f2937';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Expand panel"
        >
          ▶
        </button>
      )}

      <LeftPanel 
        forms={forms} 
        onSelectForm={handleSelectForm}
        onCreateForm={handleOpenCreateFormDialog}
        onDeleteForm={handleDeleteForm}
        currentForm={selectedForm}
        onSaveVisibility={saveVisibilityChanges}
        onAddNewProduct={handleShowAddNewProduct}
        onDeleteProduct={handleShowDeleteProduct}
        onViewProducts={handleViewProducts}
        onViewClients={handleViewClients}
        onEditSourdough={handleShowEditSourdough}
        panelOpen={panelOpen}
        togglePanel={togglePanel}
        isMobile={isMobile}
      />
      
      {/* Main content area */}
      <div style={getMainContentStyle()}>
        {/* Toggle button for mobile */}
        {isMobile && (
          <button 
            onClick={togglePanel}
            style={{
              position: 'fixed',
              top: '16px',
              left: '16px',
              zIndex: 20,
              backgroundColor: '#1f2937',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              fontSize: '18px',
              width: '48px',
              height: '48px'
            }}
          >
            {panelOpen ? '✕' : '☰'}
          </button>
        )}
        
        <div style={{ 
          padding: isMobile ? '80px 16px 16px 16px' : (panelOpen ? '16px' : '80px 16px 16px 16px'),
          minHeight: '100%'
        }}>
          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '60vh' 
            }}>
              <p>Loading...</p>
            </div>
          ) : error ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '60vh',
              color: 'red'
            }}>
              <p>{error}</p>
            </div>
          ) : showOrdersClients ? (
            <OrdersClients 
              formName={selectedOrdersClientsForm}
            />
          ) : showOrdersProducts ? (
            <OrdersProducts 
              formName={selectedOrdersProductsForm}
            />
          ) : showAddNewProduct ? (
            <AddNewItem 
              onSave={handleSaveNewProduct}
              onCancel={handleCancelNewProduct}
            />
          ) : showDeleteProduct ? (
            <DeleteProduct 
              onCancel={handleCancelDeleteProduct}
            />
          ) : showEditSourdough ? (
            <EditContents 
              onClose={() => setShowEditSourdough(false)}
            />
          ) : selectedForm === "Home" ? (
            <Home />
          ) : (
            <FormEditor 
              formName={selectedForm} 
              products={products} 
              onFormUpdated={fetchForms}
              initialComment={formComment}
            />
          )}
        </div>
      </div>

      {/* Form Name Dialog */}
      {showFormNameDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 40
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Create New Form</h3>
            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="formName" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: 'bold'
                }}
              >
                Form Name:
              </label>
              <input
                id="formName"
                type="text"
                value={newFormName}
                onChange={(e) => setNewFormName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={handleCancelFormCreation}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateForm}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#10B981',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;