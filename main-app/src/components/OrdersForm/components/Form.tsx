import { useState, useEffect } from 'react';
import Product from './Product';
import { 
  submitOrder, 
  updateOrder, 
  deleteOrder, 
  getProducts, 
  getProductsOrdered,
  getDates,
  moveOrder
} from '../services/api';

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

interface Order {
  id: string;
  name: string;
  phone: string;
  date: string;
  comment: string;
  selectedProducts: { 
    [key: string]: {
      selected: boolean;
      extras: { [extraName: string]: number };
    } 
  };
  totalAmount: number;
  timestamp: string;
}

interface FormProps {
  date: string;
  products: ProductData[];
  initialOrder?: Order | null;
  onUpdate?: (orderData: any) => void;
  onDelete?: () => void;
  loading?: boolean;
  onPlaceAnotherOrder?: () => void;
  above_comment?: string;
  panelOpen?: boolean;
}

function Form({ 
  date, 
  products, 
  initialOrder,
  onUpdate,
  onDelete,
  loading: externalLoading = false,
  onPlaceAnotherOrder,
  above_comment,
  panelOpen
}: FormProps) {
  // Initialize state from initialOrder if provided
  const [comment, setComment] = useState(initialOrder?.comment || '');
  const [name, setName] = useState(initialOrder?.name || '');
  const [phone, setPhone] = useState(initialOrder?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [inventoryErrors, setInventoryErrors] = useState<{[key: string]: string}>({});
  const [errors, setErrors] = useState({ name: '', phone: '' });
  
  // New state for move functionality
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [targetForm, setTargetForm] = useState('');
  const [availableForms, setAvailableForms] = useState<string[]>([]);
  const [moveLoading, setMoveLoading] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track selected products and their extras
  const [selectedProducts, setSelectedProducts] = useState<{[key: string]: {
    selected: boolean;
    extras: {[extraName: string]: number};
  }}>({});
  
  // Initialize selectedProducts when products change or when initialOrder is provided
  useEffect(() => {
    const initialSelections: {[key: string]: {selected: boolean; extras: {[extraName: string]: number}}} = {};
    
    products.forEach(prod => {
      const extraSelections: {[extraName: string]: number} = {};
      prod.extras.forEach(extra => {
        extraSelections[extra.name] = extra.minAmount;
      });
      
      // If we have an initial order, use its data
      if (initialOrder?.selectedProducts[prod.name]) {
        initialSelections[prod.name] = {
          selected: true,
          extras: initialOrder.selectedProducts[prod.name].extras
        };
      } else {
        initialSelections[prod.name] = {
          selected: false,
          extras: extraSelections
        };
      }
    });
    
    setSelectedProducts(initialSelections);
    
    // Reset success state when products change
    setSubmitSuccess(false);
    setSubmitError(null);
  }, [products, initialOrder]);

  // Fetch available forms when component mounts
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const dates = await getDates();
        // Filter out current form
        setAvailableForms(dates.filter(f => f !== date));
      } catch (err) {
        console.error('Failed to fetch forms:', err);
      }
    };
    
    if (initialOrder) {
      fetchForms();
    }
  }, [date, initialOrder]);

  // Validate inventory when selected products change
  useEffect(() => {
    validateInventory();
  }, [selectedProducts]);

  // Calculate total amount based on selected products and extras
  const calculateTotal = () => {
    let total = 0;
    
    products.forEach(prod => {
      const productSelection = selectedProducts[prod.name];
      
      if (productSelection && productSelection.selected) {
        // Add extras prices
        prod.extras.forEach(extra => {
          const extraAmount = productSelection.extras[extra.name] || 0;
          total += extraAmount * extra.price;
        });
      }
    });
    
    return total;
  };
  
  // Handler for product selection change
  const handleProductSelect = (productName: string, isSelected: boolean) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productName]: {
        ...prev[productName],
        selected: isSelected
      }
    }));
  };
  
  // Handler for extra amount change
  const handleExtraChange = (productName: string, extraName: string, amount: number) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productName]: {
        ...prev[productName],
        extras: {
          ...prev[productName].extras,
          [extraName]: amount
        }
      }
    }));
  };

  // Validate required fields
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      phone: ''
    };
    
    // Validate name field
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    // Validate phone field
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    }

    // Check if at least one product is selected
    const hasSelectedProduct = Object.values(selectedProducts).some(product => product.selected);
    if (!hasSelectedProduct) {
      setSubmitError('Please select at least one product');
      isValid = false;
    } else {
      setSubmitError(null);
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const validateInventory = async () => {
    try {
      // Fetch current product data to get latest inventory
      const { products: currentProducts } = await getProducts(date);
      const products_ordered_before = await getProductsOrdered(date);

      const newInventoryErrors: {[key: string]: string} = {};

      // Check inventory for each selected product
      Object.keys(selectedProducts).forEach(productName => {
        const productSelection = selectedProducts[productName];
        if (productSelection.selected) {
          // Find the current product data
          const currentProduct = currentProducts.find((p: any) => p.name === productName);
          
          if (currentProduct) {
            // Check extras inventory
            var orderedAmount = 0;
            currentProduct.extras.forEach((extra: any) => {
                orderedAmount = orderedAmount + (productSelection.extras[extra.name] || 0);
            });
            var availableInventory = (currentProduct.inventory || 0)-products_ordered_before[productName];
            if (initialOrder && onUpdate) {
              var add_amount = (initialOrder && initialOrder.selectedProducts[productName]) ? 
                Object.values(initialOrder.selectedProducts[productName].extras).reduce((acc, amount) => acc + amount, 0) : 0;
              availableInventory += add_amount;
            }
            if (orderedAmount > availableInventory) {
                newInventoryErrors[productName] = `We only have ${availableInventory} left`;
            }
          }
        }
      });

      // Set inventory errors
      setInventoryErrors(newInventoryErrors);
      
      // Return true if no inventory errors
      return Object.keys(newInventoryErrors).length === 0;
    } catch (error) {
      console.error('Error validating inventory:', error);
      return false;
    }
  };

  const handleSubmitOrder = async () => {
    // Validate form and check inventory
    if (!validateForm()) {
      return;
    }

    // Validate inventory before submission
    const inventoryValid = await validateInventory();
    if (!inventoryValid) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Prepare order data
      const orderData = {
        name,
        phone,
        date,
        comment,
        selectedProducts: Object.keys(selectedProducts).reduce((acc, productName) => {
          const product = selectedProducts[productName];
          if (product.selected) {
            acc[productName] = {
              extras: product.extras,
              selected: true
            };
          }
          return acc;
        }, {} as { [key: string]: any }),
        totalAmount: calculateTotal()
      };
      
      if (initialOrder && onUpdate) {
        // Update existing order
        await updateOrder(initialOrder.id, orderData);
        setSubmitSuccess(true);
        if (onUpdate) onUpdate(orderData);
      } else {
        // Submit new order to backend
        await submitOrder(orderData);
        
        // Reset form on success
        setName('');
        setPhone('');
        setComment('');
        
        // Reset product selections
        const initialSelections: {[key: string]: {selected: boolean; extras: {[extraName: string]: number}}} = {};
        products.forEach(prod => {
          const extraSelections: {[extraName: string]: number} = {};
          prod.extras.forEach(extra => {
            extraSelections[extra.name] = extra.minAmount;
          });
          
          initialSelections[prod.name] = {
            selected: false,
            extras: extraSelections
          };
        });
        setSelectedProducts(initialSelections);
        
        setSubmitSuccess(true);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setSubmitError(initialOrder 
        ? 'Failed to update your order. Please try again.' 
        : 'Failed to submit your order. Please try again.');
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialOrder || !onDelete) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this order? This action cannot be undone.');
    if (!confirmDelete) return;
    
    try {
      setIsSubmitting(true);
      await deleteOrder(initialOrder.id);
      if (onDelete) onDelete();
    } catch (err) {
      setSubmitError('Failed to delete order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle moving an order to another form
  const handleMoveOrder = async () => {
    if (!initialOrder || !targetForm) return;
    
    try {
      setMoveLoading(true);
      setMoveError(null);
      
      const response = await moveOrder(initialOrder.id, targetForm);
      
      if (response.success) {
        // Show success message
        setSubmitSuccess(true);
        setMoveError(null);
        
        // Close move dialog
        setShowMoveDialog(false);
        
        // If we have an onUpdate callback, use it
        if (onUpdate) {
          onUpdate({ ...initialOrder, date: targetForm });
        }
      } else {
        setMoveError(response.error || 'Failed to move order');
      }
    } catch (error) {
      setMoveError('Failed to move order. Please try again.');
    } finally {
      setMoveLoading(false);
    }
  };

  // If we're in edit mode and products haven't loaded yet
  if (initialOrder && products.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '300px' 
      }}>
        <p>Loading products for editing...</p>
      </div>
    );
  }
  
  return (

    <>

    { !initialOrder && 
    <>

    
    {(!panelOpen && !isMobile) && <div style={{ height: '22px' }} />}


    <div style={{ 
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      marginRight: 'calc(-50vw + 50%)',
      backgroundColor: '#CCB79f',
      textAlign: 'center',
      padding: '20px 0',
      marginTop: isMobile ? '0px' : '-16px',
      marginBottom: '0'
    }}>
      <img 
        src="/logo.png" 
        alt="Company Logo" 
        style={{ 
          maxWidth: '350px', 
          width: '100%', 
          height: 'auto' 
        }} 
      />
    </div>
    </>
    }

    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>
        {initialOrder ? 'Edit Order' : 'Order Form'} for {date}
      </h1>
      
      {/* Move Order Dialog */}
      {showMoveDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Move Order to Another Form</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Select Target Form:
              </label>
              <select
                value={targetForm}
                onChange={(e) => setTargetForm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  marginBottom: '20px'
                }}
                disabled={moveLoading}
              >
                <option value="">Select a form</option>
                {availableForms.map(form => (
                  <option key={form} value={form}>{form}</option>
                ))}
              </select>
              
              {moveError && (
                <div style={{ color: 'red', marginBottom: '10px' }}>
                  {moveError}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setShowMoveDialog(false)}
                disabled={moveLoading}
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
                onClick={handleMoveOrder}
                disabled={moveLoading || !targetForm}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: (moveLoading || !targetForm) ? 0.7 : 1
                }}
              >
                {moveLoading ? 'Moving...' : 'Move Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {submitSuccess ? (
        <div style={{
          padding: '20px',
          backgroundColor: '#dff0d8',
          borderRadius: '4px',
          color: '#3c763d',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h3>
            {initialOrder 
              ? (showMoveDialog ? 'Order moved successfully!' : 'Order updated successfully!') 
              : 'Your order has been submitted successfully!'}
          </h3>
          <p>
            {initialOrder 
              ? (showMoveDialog 
                  ? `Order has been moved to ${targetForm}` 
                  : 'The order has been updated with your changes.')
              : 'Thank you for your order. You will receive a confirmation message on your phone.'}
          </p>
          
          {!initialOrder && onPlaceAnotherOrder && (
            <button
              onClick={() => {setSubmitSuccess(false); onPlaceAnotherOrder();}}
              style={{
                backgroundColor: '#5cb85c',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                marginTop: '15px',
                cursor: 'pointer'
              }}
            >
              Place Another Order
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h2>Products</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {products.map((product, index) => (
                <Product 
                    key={index} 
                    name={product.name} 
                    description={product.description} 
                    extras={product.extras}
                    soldOut={product.soldOut}
                    onSelect={(isSelected: boolean) => handleProductSelect(product.name, isSelected)}
                    onExtraChange={(extraName: string, amount: number) => handleExtraChange(product.name, extraName, amount)}
                    isSelected={selectedProducts[product.name]?.selected || false}
                    selectedExtras={selectedProducts[product.name]?.extras || {}}
                    inventoryError={inventoryErrors[product.name]} // Pass inventory error
                />
              ))}
            </div>
            
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '18px', 
              textAlign: 'right', 
              margin: '20px 0' 
            }}>
              Total Price: {calculateTotal().toFixed(2)} ILS
            </div>
            
            <div>
              <label>
                <div style={{ marginBottom: '5px' }}>{above_comment || "The bread comes sliced unless you specify otherwise here. You can also add additional notes here."}</div>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ width: '100%', minHeight: '80px', padding: '8px' }}
                />
              </label>
            </div>
          </div>
          
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            padding: '20px'
          }}>
            <h2>Client Details</h2>
            <div style={{ margin: '10px 0' }}>
              <label>
                Name: <span style={{ color: 'red' }}>*</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim()) {
                      setErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    marginTop: '5px',
                    border: errors.name ? '1px solid red' : '1px solid #ccc'
                  }}
                  required
                />
                {errors.name && (
                  <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                    {errors.name}
                  </div>
                )}
              </label>
            </div>
            
            <div style={{ margin: '10px 0' }}>
              <label>
                Phone Number: <span style={{ color: 'red' }}>*</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (e.target.value.trim()) {
                      setErrors(prev => ({ ...prev, phone: '' }));
                    }
                  }}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    marginTop: '5px',
                    border: errors.phone ? '1px solid red' : '1px solid #ccc'
                  }}
                  required
                />
                {errors.phone && (
                  <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                    {errors.phone}
                  </div>
                )}
              </label>
            </div>
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            margin: '20px 0'
          }}>
            {submitError && (
              <div style={{ 
                color: 'red', 
                backgroundColor: '#f8d7da', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '15px' 
              }}>
                {submitError}
              </div>
            )}
            
            {!initialOrder && (
              <p>
                At the end of the order, the app will send a message to your phone with your name, 
                the items you ordered, and the total amount due. Please make sure the message is 
                correct and includes all order details 🙏🏻. On Tuesdays and Fridays, after baking 
                is complete, a message with the total amount due will be sent. I would appreciate 
                your confirmation that this message is acceptable to you.
              </p>
            )}

            <div style={{ height: '30px' }}></div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              {initialOrder && (
                <>
                  <button 
                    onClick={handleDelete}
                    disabled={isSubmitting || externalLoading}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      padding: '12px 24px',
                      fontSize: '16px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: (isSubmitting || externalLoading) ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      opacity: (isSubmitting || externalLoading) ? 0.7 : 1,
                      minWidth: '180px'
                    }}
                  >
                    Delete Order
                  </button>
                  
                  <button 
                    onClick={() => setShowMoveDialog(true)}
                    disabled={isSubmitting || externalLoading}
                    style={{
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      padding: '12px 24px',
                      fontSize: '16px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: (isSubmitting || externalLoading) ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      opacity: (isSubmitting || externalLoading) ? 0.7 : 1,
                      minWidth: '180px'
                    }}
                  >
                    Move to Another Form
                  </button>
                </>
              )}
              
              <button 
                onClick={handleSubmitOrder}
                disabled={isSubmitting || externalLoading}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '12px 24px',
                  fontSize: '16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (isSubmitting || externalLoading) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  opacity: (isSubmitting || externalLoading) ? 0.7 : 1,
                  minWidth: '180px'
                }}
              >
                {isSubmitting 
                  ? (initialOrder ? 'Updating...' : 'Submitting...') 
                  : (initialOrder ? 'Update Order' : 'Complete Order')}
              </button>
            </div>
            
            <div style={{ height: '80px' }}></div>
          </div>
        </>
      )}
    </div>
    </>
  );
}

export default Form;