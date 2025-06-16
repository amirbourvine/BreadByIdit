import { useState, useEffect } from 'react';

interface Order {
  name: string;
  selectedProducts: {
    [key: string]: {
      extras: {
        [key: string]: number;
      };
    };
  };
}

interface ProductDetails {
  total_amount: number;
  extras: {
    [key: string]: {
      amount: number;
      names: string[];
    };
  };
}

interface ProductContent {
  flour?: number;
  water?: number;
  salt?: number;
  flours?: {
    name: string;
    percentage: number;
    substitute?: number;
  }[];
  sourdough_white?: number;
  sourdough_half_half?: number;
  sourdough_black?: number;
}

interface OrdersProductsProps {
  formName: string;
}

function OrdersProducts({ formName }: OrdersProductsProps) {
  const [products, setProducts] = useState<{ [key: string]: ProductDetails }>({});
  const [productContents, setProductContents] = useState<{ [key: string]: ProductContent }>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<{ [key: string]: boolean }>({});
  const [sourdoughAmounts, setSourdoughAmounts] = useState<{ 
    [productName: string]: { white: number; halfHalf: number; black: number } 
  }>({});

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch('api/api/products/generic_products');
        const data = await response.json();
        if (data.success) {
          const contents: { [key: string]: ProductContent } = {};
          const amounts: { [key: string]: any } = {};
          
          data.products.forEach((product: any) => {
            contents[product.name] = {
              flour: product.flour || 0,
              water: product.water || 0,
              salt: product.salt || 0,
              flours: product.flours || [],
              sourdough_white: product.sourdough_white,
              sourdough_half_half: product.sourdough_half_half,
              sourdough_black: product.sourdough_black
            };

            amounts[product.name] = {
              white: product.sourdough_white || 0,
              halfHalf: product.sourdough_half_half || 0,
              black: product.sourdough_black || 0
            };
          });
          
          setProductContents(contents);
          setSourdoughAmounts(amounts);
        }
      } catch (err) {
        console.error('Error fetching product data:', err);
      }
    };

    fetchProductData();
  }, []);

  // Calculate sourdough totals
  const { totalWhite, totalHalfHalf, totalBlack } = Object.entries(products).reduce(
    (acc, [productName, productDetails]) => {
      const amounts = sourdoughAmounts[productName] || { white: 0, halfHalf: 0, black: 0 };
      return {
        totalWhite: acc.totalWhite + (amounts.white * productDetails.total_amount),
        totalHalfHalf: acc.totalHalfHalf + (amounts.halfHalf * productDetails.total_amount),
        totalBlack: acc.totalBlack + (amounts.black * productDetails.total_amount)
      };
    },
    { totalWhite: 0, totalHalfHalf: 0, totalBlack: 0 }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`api/api/orders?date=${encodeURIComponent(formName)}`);
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error || 'Failed to fetch data');
        setProducts(data.orders.products || {});
        setOrders(data.orders.orders || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formName]);

  const getCustomerQuantities = (productName: string, extraName: string) => {
    const quantities: { [customer: string]: number } = {};

    orders.forEach(order => {
      const product = order.selectedProducts[productName];
      if (product && product.extras[extraName]) {
        quantities[order.name] = (quantities[order.name] || 0) + product.extras[extraName];
      }
    });

    return quantities;
  };

  const toggleProduct = (productName: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productName]: !prev[productName]
    }));
  };

  const filteredProducts = Object.entries(products).filter(([productName]) =>
    productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateFlourTotal = (productName: string) => {
    const content = productContents[productName];
    return (content?.flour || 0) * (products[productName]?.total_amount || 0);
  };

  const calculateWaterValues = (productName: string) => {
    const content = productContents[productName];
    const flourTotal = calculateFlourTotal(productName);
    const waterTotal = (content?.water || 0) * (products[productName]?.total_amount || 0);
    const waterNew = waterTotal - (flourTotal * 0.1);
    
    return {
      w1: waterNew * 0.95,
      w2: waterNew * 0.05,
      total: waterTotal
    };
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Products Summary for {formName}</h1>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by product name..."
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
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading products...</div>
      ) : error ? (
        <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>{error}</div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredProducts.map(([productName, details]) => {
              const content = productContents[productName] || {};
              const flourTotal = calculateFlourTotal(productName);
              const waterValues = calculateWaterValues(productName);
              const saltTotal = (content.salt || 0) * details.total_amount;
              const currentSourdough = sourdoughAmounts[productName] || { white: 0, halfHalf: 0, black: 0 };

              return (
                <div 
                  key={productName}
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
                    onClick={() => toggleProduct(productName)}
                  >
                    <div style={{ fontWeight: '500' }}>{productName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span>Total: {details.total_amount}</span>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          transform: `rotate(${expandedProducts[productName] ? '180deg' : '0deg'})`,
                          transition: 'transform 0.2s'
                        }}
                      >
                        ▼
                      </button>
                    </div>
                  </div>

                  {expandedProducts[productName] && (
                    <div style={{ padding: '16px' }}>
                      {/* Extras Section */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px'
                      }}>
                        {Object.entries(details.extras).map(([extraName, extra]) => {
                          const customerQuantities = getCustomerQuantities(productName, extraName);

                          return (
                            <div 
                              key={extraName}
                              style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '16px',
                                backgroundColor: '#f9fafb'
                              }}
                            >
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginBottom: '8px'
                              }}>
                                <div style={{ fontWeight: '500' }}>{extraName}</div>
                                <div>x{extra.amount}</div>
                              </div>
                              
                              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                                <div style={{ 
                                  fontSize: '0.875rem',
                                  color: '#4b5563',
                                  marginBottom: '4px'
                                }}>
                                  Ordered by:
                                </div>
                                {Object.entries(customerQuantities).map(([name, quantity]) => (
                                  <div 
                                    key={name}
                                    style={{ 
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      padding: '4px 0'
                                    }}
                                  >
                                    <span>{name}</span>
                                    <span>x{quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    
                      {/* New Content Section */}
                      {content.flour && content.flour>0 && (
                        <div style={{ marginTop: '24px' }}>
                          <h3 style={{ marginBottom: '16px', color: '#374151' }}>Production Requirements</h3>
                          
                          {/* Flour Breakdown */}
                          {content.flours && content.flours.length > 0 && (
                            <div style={{ marginBottom: '24px' }}>
                              <h4 style={{ marginBottom: '12px', color: '#4b5563' }}>Flour Types</h4>
                              <div style={{ 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '12px'
                              }}>
                                {content.flours.map((flour, index) => {
                                  const total = ((flour.percentage - (flour.substitute || 0)) / 100) * flourTotal;
                                  return (
                                    <div 
                                      key={index}
                                      style={{
                                        padding: '12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        backgroundColor: '#f8fafc'
                                      }}
                                    >
                                      <div style={{ 
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '8px'
                                      }}>
                                        <span>{flour.name}</span>
                                        <span>{(flour.percentage - (flour.substitute || 0))}%</span>
                                      </div>
                                      <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>
                                        {total.toFixed(2)}g
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Water Calculations */}
                          <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ marginBottom: '12px', color: '#4b5563' }}>Water Breakdown</h4>
                            <div style={{ 
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                              gap: '12px'
                            }}>
                              <div style={{
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                backgroundColor: '#f0f9ff'
                              }}>
                                <div style={{ fontSize: '0.875rem', color: '#0369a1' }}>Total Water</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>
                                  {waterValues.total.toFixed(2)}g
                                </div>
                              </div>
                              <div style={{
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                backgroundColor: '#f0fdf4'
                              }}>
                                <div style={{ fontSize: '0.875rem', color: '#15803d' }}>W1 (95%)</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>
                                  {waterValues.w1.toFixed(2)}g
                                </div>
                              </div>
                              <div style={{
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                backgroundColor: '#fef2f2'
                              }}>
                                <div style={{ fontSize: '0.875rem', color: '#b91c1c' }}>W2 (5%)</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>
                                  {waterValues.w2.toFixed(2)}g
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          

                          {/* Salt and Sourdough */}
                          <h4 style={{ marginBottom: '12px', color: '#4b5563' }}>Salt and Sourdough</h4>
                          <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '12px'
                          }}>
                            <div style={{
                              padding: '12px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              backgroundColor: '#fefce8'
                            }}>
                              <div style={{ fontSize: '0.875rem', color: '#a16207' }}>Total Salt</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>
                                {saltTotal.toFixed(2)}g
                              </div>
                            </div>
                            {currentSourdough.white > 0 && (
                              <div style={{
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                backgroundColor: '#f3e8ff'
                              }}>
                                <div style={{ fontSize: '0.875rem', color: '#6b21a8' }}>White Sourdough</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>
                                  {(currentSourdough.white * details.total_amount).toFixed(2)}g
                                </div>
                              </div>
                            )}
                            {currentSourdough.halfHalf > 0 && (
                              <div style={{
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                backgroundColor: '#ecfccb'
                              }}>
                                <div style={{ fontSize: '0.875rem', color: '#3f6212' }}>Half-Half Sourdough</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>
                                  {(currentSourdough.halfHalf * details.total_amount).toFixed(2)}g
                                </div>
                              </div>
                            )}
                            {currentSourdough.black > 0 && (
                              <div style={{
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                backgroundColor: '#ffe4e6'
                              }}>
                                <div style={{ fontSize: '0.875rem', color: '#9f1239' }}>Black Sourdough</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>
                                  {(currentSourdough.black * details.total_amount).toFixed(2)}g
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Sourdough Summary Section */}
          <div style={{ 
            marginTop: '40px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Total Sourdough Requirements</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>White Sourdough</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                  {totalWhite.toFixed(0)}g
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Half-Half Sourdough</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                  {totalHalfHalf.toFixed(0)}g
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Black Sourdough</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                  {totalBlack.toFixed(0)}g
                </div>
              </div>
            </div>
          </div>
          <div style={{ height: "50px" }} />
        </>
      )}
    </div>
  );
}

export default OrdersProducts;