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

  // Add body class when panel is open on mobile
  useEffect(() => {
    if (isMobile && panelOpen) {
      document.body.classList.add('panel-open');
    } else {
      document.body.classList.remove('panel-open');
    }
    
    return () => {
      document.body.classList.remove('panel-open');
    };
  }, [isMobile, panelOpen]);

  // Detect mobile screens
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-close panel when resizing to mobile
      if (mobile) {
        setPanelOpen(false);
      }
      // Auto-open panel when resizing to desktop if it was previously open
      else if (!mobile && !panelOpen) {
        setPanelOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [panelOpen]);

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
    if (isMobile) setPanelOpen(false);
  };

  const handleEditOrder = () => {
    setShowEditOrder(true);
    setSelectedForm("");
    if (isMobile) setPanelOpen(false);
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
      <LeftPanel 
        pages={pages} 
        onSelectForm={handleSelectForm} 
        onEditOrder={handleEditOrder}
        panelOpen={panelOpen}
        setPanelOpen={setPanelOpen}
        isMobile={isMobile}
      />
      
      {/* Main content area */}
      <div style={{ 
        marginLeft: !isMobile && panelOpen ? 'min(256px, 25vw)' : 0,
        flex: '1',
        width: '100%',
        overflow: 'auto',
        position: 'relative',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Toggle button for mobile */}
        {isMobile && (
          <button 
            onClick={() => setPanelOpen(!panelOpen)}
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 20,
              backgroundColor: '#1f2937',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {panelOpen ? '✕' : '☰'}
          </button>
        )}
        
        <div style={{ padding: '16px' }}>
          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%' 
            }}>
              <p>Loading...</p>
            </div>
          ) : error ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
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