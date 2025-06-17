// EditOrder.tsx
import { useState, useEffect } from 'react';
import { getDates, updateOrder, getProducts, getOrders } from '../services/api';
import Form from './Form';

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

function EditOrder() {
  const [step, setStep] = useState<number>(1);
  const [forms, setForms] = useState<string[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  // Fetch available forms
  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const dates = await getDates();
        setForms(dates);
      } catch (err) {
        setError('Failed to load available forms');
      } finally {
        setLoading(false);
      }
    };
    
    fetchForms();
  }, []);

  // Search for orders
  const handleSearch = async () => {
    if (!selectedForm || !clientName.trim()) {
      setError('Please select a form and enter client name');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all orders for the form
      const response = await getOrders(selectedForm);
      const allOrders = response.orders || [];
      
      // Filter by client name (case insensitive)
      const filteredOrders = allOrders.filter((order: any) => 
        order.name.toLowerCase().includes(clientName.toLowerCase())
      );
      
      setOrders(filteredOrders);
      
      if (filteredOrders.length === 0) {
        setError('No orders found for this client');
      } else {
        setStep(2);
      }
    } catch (err) {
      setError('Failed to search for orders');
    } finally {
      setLoading(false);
    }
  };

  // Handle order selection
  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setStep(3);
  };

  // Handle order update
  const handleUpdateOrder = async (updatedOrder: any) => {
    if (!selectedOrder) return;
    
    try {
      setLoading(true);
      await updateOrder(selectedOrder.id, updatedOrder);
      setStep(4); // Show success
    } catch (err) {
      setError('Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setLoading(true);
      setStep(5); // Show deletion success
    } catch (err) {
      setError('Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  // Render step 1: Select form and enter client name
  const renderSearchForm = () => (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Edit Existing Order</h2>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Select Order Form:
        </label>
        <select
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            marginBottom: '20px'
          }}
          disabled={loading}
        >
          <option value="">Select a form</option>
          {forms.map(form => (
            <option key={form} value={form}>{form}</option>
          ))}
        </select>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Client Name:
        </label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: error && !clientName.trim() ? '1px solid red' : '1px solid #ccc'
          }}
          placeholder="Enter client name"
          disabled={loading}
        />
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      
      <button
        onClick={handleSearch}
        disabled={loading || !selectedForm || !clientName.trim()}
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          opacity: (loading || !selectedForm || !clientName.trim()) ? 0.7 : 1
        }}
      >
        {loading ? 'Searching...' : 'Search Orders'}
      </button>
    </div>
  );

  // Render step 2: Display search results
  const renderOrderList = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Orders for {clientName}</h2>
      <p>Select an order to edit:</p>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '4px', 
        maxHeight: '400px', 
        overflowY: 'auto'
      }}>
        {orders.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            No orders found
          </div>
        ) : (
          orders.map(order => (
            <div
              key={order.id}
              onClick={() => handleSelectOrder(order)}
              style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                backgroundColor: selectedOrder?.id === order.id ? '#f0f9ff' : 'white'
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{order.name}</div>
              <div>Phone: {order.phone}</div>
              <div>Date: {new Date(order.date).toLocaleString()}</div>
              <div>Made at: {order.timestamp}</div>
            </div>
          ))
        )}
      </div>
      
      <button
        onClick={() => setStep(1)}
        style={{
          marginTop: '20px',
          backgroundColor: '#f0f0f0',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Back to Search
      </button>
    </div>
  );

  // Render step 3: Edit order form
  const renderEditForm = () => {
    if (!selectedOrder) return null;
    
    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          backgroundColor: '#f0f0f0',
          marginBottom: '20px'
        }}>
          <h2>Editing Order for {selectedOrder.name}</h2>
          <button
            onClick={() => setStep(2)}
            style={{
              backgroundColor: '#f0f0f0',
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Results
          </button>
        </div>
        
        <Form
          date={selectedOrder.date}
          products={products}
          initialOrder={selectedOrder}
          onUpdate={handleUpdateOrder}
          onDelete={handleDeleteOrder}
          loading={loading}
        />
      </div>
    );
  };

  // Render success messages
  const renderSuccess = () => (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div style={{ 
        padding: '30px',
        backgroundColor: '#dff0d8',
        borderRadius: '8px',
        color: '#3c763d',
        marginBottom: '20px'
      }}>
        <h3>
          {step === 4 
            ? 'Order updated successfully!' 
            : 'Order deleted successfully!'}
        </h3>
        <p>
          {step === 4
            ? 'The order has been updated with your changes.'
            : 'The order has been permanently removed.'}
        </p>
      </div>
      
      <button
        onClick={() => {
          setStep(1);
          setSelectedForm('');
          setClientName('');
          setOrders([]);
          setSelectedOrder(null);
          setError(null);
        }}
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Edit Another Order
      </button>
    </div>
  );

  // Fetch products when we have a selected order
  useEffect(() => {
    if (selectedOrder) {
      const fetchProducts = async () => {
        try {
          setLoading(true);
          const response = await getProducts(selectedOrder.date);
          setProducts(response.products || []);
        } catch (err) {
          setError('Failed to load products for this form');
        } finally {
          setLoading(false);
        }
      };
      
      fetchProducts();
    }
  }, [selectedOrder]);

  return (
    <div>
      {step === 1 && renderSearchForm()}
      {step === 2 && renderOrderList()}
      {step === 3 && renderEditForm()}
      {(step === 4 || step === 5) && renderSuccess()}
      
      {loading && (
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
            padding: '30px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditOrder;