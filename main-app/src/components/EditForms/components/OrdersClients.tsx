import { useState, useEffect } from 'react';

interface Order {
  id: string;
  name: string;
  phone: string;
  comment: string;
  totalAmount: number;
  selectedProducts: {
    [key: string]: {
      extras: {
        [key: string]: number;
      };
    };
  };
}

interface OrdersClientsProps {
  formName: string;
}

function OrdersClients({ formName }: OrdersClientsProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/orders?date=${encodeURIComponent(formName)}`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error || 'Failed to fetch orders');
        setOrders(data.orders.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [formName]);

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const filteredOrders = orders.filter(order =>
    order.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Orders for {formName}</h1>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            marginBottom: '16px'
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading orders...</div>
      ) : error ? (
        <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>{error}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredOrders.map(order => (
            <div 
              key={order.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#f3f4f6',
                  cursor: 'pointer'
                }}
                onClick={() => toggleOrder(order.id)}
              >
                <div style={{ fontWeight: '500' }}>{order.name}</div>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transform: `rotate(${expandedOrders[order.id] ? '180deg' : '0deg'})`,
                    transition: 'transform 0.2s'
                  }}
                >
                  ▼
                </button>
              </div>

              {expandedOrders[order.id] && (
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Phone:</div>
                      <div>{order.phone}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Total Amount:</div>
                      <div>{order.totalAmount.toFixed(2)} ILS</div>
                    </div>
                    {order.comment && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>Comment:</div>
                        <div>{order.comment}</div>
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                    <div style={{ fontWeight: '500', marginBottom: '12px' }}>Selected Products:</div>
                    {Object.entries(order.selectedProducts).map(([productName, product]) => (
                      <div key={productName} style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: '500' }}>{productName}</div>
                        {Object.entries(product.extras).map(([extraName, amount]) => (
                          <div 
                            key={extraName}
                            style={{ 
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginLeft: '12px',
                              color: '#4b5563'
                            }}
                          >
                            <span>x{amount}</span>
                            <span>{extraName}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    <div style={{ height: "50px" }} />
    </div>
  );
}

export default OrdersClients;