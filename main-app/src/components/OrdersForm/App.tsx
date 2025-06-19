import { useState, useEffect } from 'react'
import './App.css'
import LeftPanel from './components/LeftPanel'
import Form from './components/Form';
import Home from './components/Home';
import EditOrder from './components/EditOrder';
import { getDates, getProducts } from './services/api';

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
  inventory: number;
}

function App() {
  const [pages, setPages] = useState<string[]>(["Home"]);
  const [selectedForm, setSelectedForm] = useState<string>("Home");
  const [showEditOrder, setShowEditOrder] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
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

  // Fetch available dates
  useEffect(() => {
    const fetchDates = async () => {
      try {
        setLoading(true);
        const dates = await getDates();
        setPages(["Home", ...dates]);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dates:', err);
        setError('Failed to load available dates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDates();
  }, []);

  // Fetch products when selected form changes
  useEffect(() => {
    const fetchProductsForPage = async () => {
      if (selectedForm === "Home" || !pages.includes(selectedForm)) return;

      try {
        setLoading(true);
        const response = await getProducts(selectedForm);
        setProducts(response.products);
        setComment(response.comment || "The bread comes sliced unless you specify otherwise here. You can also add additional notes here.");
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch products for ${selectedForm}:`, err);
        setError(`Failed to load products for ${selectedForm}. Please try again later.`);
        setProducts([]);
        setComment("The bread comes sliced unless you specify otherwise here. You can also add additional notes here.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductsForPage();
  }, [selectedForm, pages]);

  const onPlaceAnotherOrder = async () => {
    if (selectedForm !== "Home") {
      try {
        setLoading(true);
        const response = await getProducts(selectedForm);
        setProducts(response.products);
        if (response.comment) setComment(response.comment);
        setError(null);
      } catch (err) {
        console.error(`Failed to refresh products for ${selectedForm}:`, err);
        setError(`Failed to refresh products for ${selectedForm}. Please try again later.`);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectForm = (form: string) => {
    setSelectedForm(form);
    setShowEditOrder(false);
    // Close panel on mobile after selection
    if (isMobile) {
      setPanelOpen(false);
    }
  };

  const handleEditOrder = () => {
    setShowEditOrder(true);
    setSelectedForm("");
    // Close panel on mobile after selection
    if (isMobile) {
      setPanelOpen(false);
    }
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
        pages={pages} 
        onSelectForm={handleSelectForm} 
        onEditOrder={handleEditOrder}
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
          ) : showEditOrder ? (
            <EditOrder />
          ) : selectedForm === "Home" ? (
            <Home />
          ) : (
            <Form 
              date={selectedForm} 
              products={products} 
              above_comment={comment}
              onPlaceAnotherOrder={onPlaceAnotherOrder}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;