// App.tsx
import { useState, useEffect } from 'react'
import './App.css'
import LeftPanel from './components/LeftPanel'
import Form from './components/Form';
import Home from './components/Home';
import EditOrder from './components/EditOrder'; // New component
import { getDates, getProducts } from './services/api';

// Define the interfaces for Extra and ProductData
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

  // Fetch available dates when component mounts
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
      // Skip if Home page is selected or if the page is not yet loaded
      if (selectedForm === "Home" || !pages.includes(selectedForm)) {
        return;
      }

      try {
        setLoading(true);
        const response = await getProducts(selectedForm);
        setProducts(response.products);
        
        // Get comment from the response
        if (response.comment) {
          setComment(response.comment);
        } else {
          // Use default comment if none provided
          setComment("The bread comes sliced unless you specify otherwise here. You can also add additional notes here.");
        }
        
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch products for ${selectedForm}:`, err);
        setError(`Failed to load products for ${selectedForm}. Please try again later.`);
        setProducts([]);
        // Set default comment on error
        setComment("The bread comes sliced unless you specify otherwise here. You can also add additional notes here.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductsForPage();
  }, [selectedForm, pages]);

  const onPlaceAnotherOrder = async () => {
    // Only fetch products if a specific date page is selected
    if (selectedForm !== "Home") {
      try {
        setLoading(true);
        const response = await getProducts(selectedForm);
        setProducts(response.products);
        
        // Update comment if a new one is provided
        if (response.comment) {
          setComment(response.comment);
        }
        
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

  // Handler for selecting a form to place a new order
  const handleSelectForm = (form: string) => {
    setSelectedForm(form);
    setShowEditOrder(false);
  };

  // Handler for showing the edit order view
  const handleEditOrder = () => {
    setShowEditOrder(true);
    setSelectedForm("");
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
      top: 0
    }}>
      <LeftPanel 
        pages={pages} 
        onSelectForm={handleSelectForm} 
        onEditOrder={handleEditOrder}
      />
      <div style={{ 
        marginLeft: 'min(256px, 25vw)', 
        padding: '16px', 
        flex: '1',
        width: 'calc(100% - min(256px, 25vw))'
      }}>
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
  );
}

export default App;