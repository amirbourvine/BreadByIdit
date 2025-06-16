import { useState, useEffect } from 'react'
import './App.css'
import LeftPanel from './components/LeftPanel'
import FormEditor from './components/FormEditor'; // Renamed from Form
import Home from './components/Home';
import AddNewItem from './components/AddNewItem'; // Import the new component
import DeleteProduct from './components/DeleteProduct'; // Import the DeleteProduct component
import { getDates, getProducts, createNewForm, deleteForm, updateFormVisibility } from './services/api';
import OrdersClients from './components/OrdersClients';
import OrdersProducts from './components/OrdersProducts';
import EditContents from './components/EditSourdough';

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
}

function App() {
  const [forms, setForms] = useState<string[]>(["Home"]);
  const [selectedForm, setSelectedForm] = useState<string>("Home");
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormNameDialog, setShowFormNameDialog] = useState<boolean>(false);
  const [newFormName, setNewFormName] = useState<string>("");
  const [showAddNewProduct, setShowAddNewProduct] = useState<boolean>(false); // State for product page
  const [showDeleteProduct, setShowDeleteProduct] = useState<boolean>(false); // New state for delete product page
  const [formComment, setFormComment] = useState<string>("");
  const [showOrdersClients, setShowOrdersClients] = useState<boolean>(false);
  const [selectedOrdersClientsForm, setSelectedOrdersClientsForm] = useState<string>("");
  const [showOrdersProducts, setShowOrdersProducts] = useState<boolean>(false);
  const [selectedOrdersProductsForm, setSelectedOrdersProductsForm] = useState<string>("");
  const [showEditSourdough, setShowEditSourdough] = useState<boolean>(false);

  // Fetch available forms/dates when component mounts
  useEffect(() => {
    fetchForms();
  }, []);


  const handleShowEditSourdough = () => {
    setShowEditSourdough(true);
    setShowAddNewProduct(false);
    setShowDeleteProduct(false);
    setShowOrdersClients(false);
    setShowOrdersProducts(false);
  };

  const handleViewClients = (form: string) => {
    setSelectedOrdersClientsForm(form);
    setShowOrdersClients(true);
    setShowOrdersProducts(false);
    setShowAddNewProduct(false);
    setShowDeleteProduct(false);
    setShowEditSourdough(false);
  };

  const handleViewProducts = (form: string) => {
    setSelectedOrdersProductsForm(form);
    setShowOrdersProducts(true);
    setShowOrdersClients(false);
    setShowAddNewProduct(false);
    setShowDeleteProduct(false);
    setShowEditSourdough(false);
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

  // Fetch products when selected form changes
  useEffect(() => {
    const fetchProductsForForm = async () => {
      // Skip if Home page is selected or if the form is not yet loaded
      if (selectedForm === "Home" || !forms.includes(selectedForm)) {
        return;
      }

      try {
        setLoading(true);
        const productsData = await getProducts(selectedForm);
        setProducts(productsData.products);
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
  }, [selectedForm, forms]);


  // Replace the direct usage of setSelectedForm with this handler function
  const handleSelectForm = (formName: string) => {
    setSelectedForm(formName);
    setShowAddNewProduct(false);
    setShowDeleteProduct(false);
    setShowOrdersClients(false);
    setShowOrdersProducts(false);
    setShowEditSourdough(false);
  };

  function getNextFridayOrTuesday(): string {
    // Get current date
    const now = new Date();
    
    // Day constants (JavaScript uses 0-6 for days, where 0 is Sunday)
    const FRIDAY = 5;
    const TUESDAY = 2;
    
    // Get current day of week
    const currentDay = now.getDay();
    
    // Calculate days until next Friday
    let daysUntilFriday = (FRIDAY - currentDay + 7) % 7;
    // If today is Friday and it's before 13:00, use today
    if (currentDay === FRIDAY && now.getHours() < 13) {
      daysUntilFriday = 0;
    }
    
    // Calculate days until next Tuesday
    let daysUntilTuesday = (TUESDAY - currentDay + 7) % 7;
    // If today is Tuesday and it's before 14:00, use today
    if (currentDay === TUESDAY && now.getHours() < 14) {
      daysUntilTuesday = 0;
    }
    
    // Create dates for the next Friday and Tuesday
    const nextFriday = new Date(now);
    nextFriday.setDate(now.getDate() + daysUntilFriday);
    nextFriday.setHours(13, 0, 0, 0);
    
    const nextTuesday = new Date(now);
    nextTuesday.setDate(now.getDate() + daysUntilTuesday);
    nextTuesday.setHours(14, 0, 0, 0);
    
    // Choose the closest date
    let chosenDate;
    if (nextFriday <= nextTuesday) {
      chosenDate = nextFriday;
    } else {
      chosenDate = nextTuesday;
    }
    
    // Format the date as "Weekday DD.MM.YY HH:00"
    const weekday = chosenDate.getDay() === FRIDAY ? "Friday" : "Tuesday";
    const day = chosenDate.getDate();
    const month = chosenDate.getMonth() + 1; // JavaScript months are 0-based
    const year = chosenDate.getFullYear().toString().substr(-2); // Get last two digits
    const hour = chosenDate.getDay() === FRIDAY ? 13 : 14;
    
    // Format with leading zeros for day and month if needed
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;
    
    return `${weekday} ${formattedDay}.${formattedMonth}.${year} ${hour}:00`;
  }

  // Handler for initiating the form creation process
  const handleOpenCreateFormDialog = () => {
    // Generate default name suggestion
    const defaultName = getNextFridayOrTuesday();
    setNewFormName(defaultName);
    setShowFormNameDialog(true);
  };

  // Handler for creating a new form
  const handleCreateForm = async () => {
    if (!newFormName.trim()) {
      alert("Please enter a form name");
      return;
    }
    
    try {
      setLoading(true);
      setShowFormNameDialog(false);
      
      await createNewForm(newFormName);
      // Refresh the forms list
      await fetchForms();
      // Select the newly created form
      setSelectedForm(newFormName);
      // Reset form name
      setNewFormName("");
    } catch (err) {
      console.error('Failed to create new form:', err);
      setError('Failed to create new form. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for canceling form creation
  const handleCancelFormCreation = () => {
    setShowFormNameDialog(false);
    setNewFormName("");
  };

  // Handler for deleting a form
  const handleDeleteForm = async (formName: string) => {
    if (formName === "Home") return;
    
    try {
      setLoading(true);
      await deleteForm(formName);
      // Refresh the forms list
      await fetchForms();
      // If the deleted form was selected, go back to home
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

  // Function to save visibility state to the backend
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

  // Handler for showing the Add New Product page
  const handleShowAddNewProduct = () => {
    setShowAddNewProduct(true);
    setShowDeleteProduct(false); // Hide delete product page
    setShowOrdersClients(false);
    setShowOrdersProducts(false);
    setShowEditSourdough(false);
  };

  // Handler for showing the Delete Product page
  const handleShowDeleteProduct = () => {
    setShowDeleteProduct(true);
    setShowAddNewProduct(false); // Hide add product page
    setShowOrdersClients(false);
    setShowOrdersProducts(false);
    setShowEditSourdough(false);
  };

  // Handler for saving a new product
  const handleSaveNewProduct = async (product: ProductData) => {
    // Here you would implement the API call to save the new product
    console.log('Saving new product:', product);
    
    // For now, we'll just close the add product page
    setShowAddNewProduct(false);
    
    // You could refresh the products list here if needed
  };

  // Handler for canceling product creation
  const handleCancelNewProduct = () => {
    setShowAddNewProduct(false);
  };

  // Handler for canceling product deletion
  const handleCancelDeleteProduct = () => {
    setShowDeleteProduct(false);
  };

  // Inside App.tsx where you render the FormEditor
  useEffect(() => {
    const fetchProductsForForm = async () => {
      // Skip if Home page is selected or if the form is not yet loaded
      if (selectedForm === "Home" || !forms.includes(selectedForm)) {
        return;
      }

      try {
        setLoading(true);
        const productsData = await getProducts(selectedForm);
        setProducts(productsData.products);
        // Store the comment too
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
  }, [selectedForm, forms]);

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
        forms={forms} 
        onSelectForm={handleSelectForm} // Use our new handler here
        onCreateForm={handleOpenCreateFormDialog}
        onDeleteForm={handleDeleteForm}
        currentForm={selectedForm}
        onSaveVisibility={saveVisibilityChanges}
        onAddNewProduct={handleShowAddNewProduct}
        onDeleteProduct={handleShowDeleteProduct}
        onViewClients={handleViewClients}
        onViewProducts={handleViewProducts}
        onEditSourdough={handleShowEditSourdough}
      />
      <div className="orders-container">
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
          zIndex: 20
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