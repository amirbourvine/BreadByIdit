import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getProducts, ProductData } from '../services/api';

interface EditContentsProps {
  onClose: () => void;
}

interface FlourDiversion {
  name: string;
  percentage: number;
  substitute: number;
}

interface ProductContent {
  name: string;
  flour: number;
  water: number;
  salt: number;
  sourdough: {
    type: 'none' | 'black' | 'halfHalf' | 'white';
    weight: number;
    is20Percent: boolean;
  };
  flours: FlourDiversion[];
  minimized: boolean;
}

const EditContents: React.FC<EditContentsProps> = ({ onClose }) => {
  const [products, setProducts] = useState<ProductContent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenericProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts('generic_products');
        const productsList = response.products;
        
        const parsedProducts = productsList.map((product: ProductData) => {
          // Parse existing data with fallbacks
          let sourdoughType: 'none' | 'black' | 'halfHalf' | 'white' = 'none';
          let sourdoughWeight = 0;
          
          if (product.sourdough_black) {
            sourdoughType = 'black';
            sourdoughWeight = product.sourdough_black;
          } else if (product.sourdough_half_half) {
            sourdoughType = 'halfHalf';
            sourdoughWeight = product.sourdough_half_half;
          } else if (product.sourdough_white) {
            sourdoughType = 'white';
            sourdoughWeight = product.sourdough_white;
          }

          return {
            name: product.name,
            flour: product.flour || 0,
            water: product.water || 0,
            salt: product.salt || 0,
            sourdough: {
              type: sourdoughType,
              weight: sourdoughWeight,
              is20Percent: product.sourdough?.is20Percent || (sourdoughWeight==(product.flour || 0)*0.2)
            },
            flours: product.flours?.map(f => ({
              name: f.name,
              percentage: f.percentage,
              substitute: f.substitute || 0
            })) || [],
            minimized: true
          };
        });

        setProducts(parsedProducts);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGenericProducts();
  }, []);

  const toggleProduct = (productName: string) => {
    setProducts(prev => prev.map(p => 
      p.name === productName ? { ...p, minimized: !p.minimized } : p
    ));
  };

  const handleNumberInput = (productName: string, field: 'flour' | 'water' | 'salt', value: string) => {
    const numericValue = Math.max(0, parseInt(value) || 0);
    setProducts(prev => prev.map(p => {
      if (p.name === productName) {
        const updated = { ...p, [field]: numericValue };
        
        // Update sourdough weight if 20% is checked
        if (field === 'flour' && updated.sourdough.is20Percent && updated.sourdough.type !== 'none') {
          updated.sourdough.weight = Math.round(numericValue * 0.2);
        }
        
        return updated;
      }
      return p;
    }));
  };

  const handleSourdoughTypeChange = (productName: string, type: 'none' | 'black' | 'halfHalf' | 'white') => {
    setProducts(prev => prev.map(p => {
      if (p.name === productName) {
        const newSourdough = {
          ...p.sourdough,
          type,
          weight: type === 'none' ? 0 : p.sourdough.weight
        };
        
        if (type !== 'none' && p.sourdough.is20Percent) {
          newSourdough.weight = Math.round(p.flour * 0.2);
        }

        return { ...p, sourdough: newSourdough };
      }
      return p;
    }));
  };

  const handleSourdoughWeightChange = (productName: string, value: string) => {
    const numericValue = Math.max(0, parseInt(value) || 0);
    setProducts(prev => prev.map(p => {
      if (p.name === productName) {
        return { 
          ...p, 
          sourdough: {
            ...p.sourdough,
            weight: numericValue,
            is20Percent: false
          }
        };
      }
      return p;
    }));
  };

  const toggle20Percent = (productName: string) => {
    setProducts(prev => prev.map(p => {
      if (p.name === productName) {
        const is20Percent = !p.sourdough.is20Percent;
        const weight = is20Percent ? Math.round(p.flour * 0.2) : p.sourdough.weight;
        
        return {
          ...p,
          sourdough: {
            ...p.sourdough,
            is20Percent,
            weight
          }
        };
      }
      return p;
    }));
  };

  const handleFlourPercentageChange = (productName: string, index: number, value: string) => {
    const numericValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    setProducts(prev => prev.map(p => {
      if (p.name === productName) {
        const newFlours = [...p.flours];
        newFlours[index].percentage = numericValue;
        
        // Ensure total percentage doesn't exceed 100
        const total = newFlours.reduce((sum, f) => sum + f.percentage, 0);
        if (total > 100) return p;
        
        return { ...p, flours: newFlours };
      }
      return p;
    }));
  };

  const handleFlourSubstituteChange = (productName: string, index: number, value: string) => {
    const numericValue = Math.max(0, parseInt(value) || 0);
    setProducts(prev => prev.map(p => {
      if (p.name === productName) {
        const newFlours = [...p.flours];
        newFlours[index].substitute = numericValue;
        
        // Ensure total substitute doesn't exceed 10
        const total = newFlours.reduce((sum, f) => sum + f.substitute, 0);
        if (total > 10) return p;
        
        return { ...p, flours: newFlours };
      }
      return p;
    }));
  };

  const addNewFlour = (productName: string) => {
    setProducts(prev => prev.map(p => {
      if (p.name === productName) {
        return {
          ...p,
          flours: [...p.flours, { name: '', percentage: 0, substitute: 0 }]
        };
      }
      return p;
    }));
  };

  const removeFlour = (productName: string, index: number) => {
    setProducts(prev => prev.map(p => {
      if (p.name === productName) {
        const newFlours = [...p.flours];
        newFlours.splice(index, 1);
        return { ...p, flours: newFlours };
      }
      return p;
    }));
  };

  const totalPercentage = (flours: FlourDiversion[]) => 
    flours.reduce((sum, f) => sum + f.percentage, 0);

  const totalSubstitute = (flours: FlourDiversion[]) => 
    flours.reduce((sum, f) => sum + f.substitute, 0);

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      
      const payload = {
        amounts: products.reduce((acc, product) => {
          acc[product.name] = {
            // Legacy fields
            black: product.sourdough.type === 'black' ? product.sourdough.weight : 0,
            halfHalf: product.sourdough.type === 'halfHalf' ? product.sourdough.weight : 0,
            white: product.sourdough.type === 'white' ? product.sourdough.weight : 0,
            
            // New fields
            flour: product.flour,
            water: product.water,
            salt: product.salt,
            flours: product.flours
          };
          return acc;
        }, {} as { [key: string]: any })
      };

      const response = await fetch('http://13.49.120.33/api/udpate_sourdough', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save contents');
      const data = await response.json();
      
      if (!data.success) throw new Error(data.error || 'Failed to save contents');
      
      setSuccessMessage('Contents updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to update contents:', err);
      setError(err.message || 'Failed to save changes. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '16px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Edit Contents</h2>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Close
          </button>
        </div>
      </div>

      {loading && <p>Loading products...</p>}

      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#FEE2E2', 
          color: '#B91C1C', 
          borderRadius: '4px',
          marginBottom: '16px',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#D1FAE5', 
          color: '#065F46', 
          borderRadius: '4px',
          marginBottom: '16px',
          fontSize: '0.875rem'
        }}>
          {successMessage}
        </div>
      )}

      {products.map(product => (
        <div key={product.name} style={{ 
          marginBottom: '16px', 
          border: '1px solid #E5E7EB', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div 
            style={{ 
              padding: '12px',
              backgroundColor: '#F9FAFB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => toggleProduct(product.name)}
          >
            <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{product.name}</div>
            {product.minimized ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {!product.minimized && (
            <div style={{ padding: '16px', backgroundColor: 'white' }}>
              {/* Base Ingredients - Responsive Grid */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    Flour (g)
                  </label>
                  <input
                    type="number"
                    value={product.flour}
                    onChange={(e) => handleNumberInput(product.name, 'flour', e.target.value)}
                    style={{
                      padding: '8px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '4px',
                      width: '100%',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    Water (g)
                  </label>
                  <input
                    type="number"
                    value={product.water}
                    onChange={(e) => handleNumberInput(product.name, 'water', e.target.value)}
                    style={{
                      padding: '8px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '4px',
                      width: '100%',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    Salt (g)
                  </label>
                  <input
                    type="number"
                    value={product.salt}
                    onChange={(e) => handleNumberInput(product.name, 'salt', e.target.value)}
                    style={{
                      padding: '8px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '4px',
                      width: '100%',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              {/* Sourdough Section - Responsive Layout */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  marginBottom: '12px', 
                  fontSize: '1rem', 
                  fontWeight: '600' 
                }}>
                  Sourdough
                </h3>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <select
                    value={product.sourdough.type}
                    onChange={(e) => handleSourdoughTypeChange(
                      product.name, 
                      e.target.value as 'none' | 'black' | 'halfHalf' | 'white'
                    )}
                    style={{
                      padding: '8px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '4px',
                      width: '100%',
                      maxWidth: '200px',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="none">None</option>
                    <option value="black">Black</option>
                    <option value="halfHalf">Half-Half</option>
                    <option value="white">White</option>
                  </select>

                  {product.sourdough.type !== 'none' && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <input
                        type="number"
                        value={product.sourdough.weight}
                        onChange={(e) => handleSourdoughWeightChange(product.name, e.target.value)}
                        disabled={product.sourdough.is20Percent}
                        style={{
                          padding: '8px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '4px',
                          width: '100%',
                          maxWidth: '120px',
                          opacity: product.sourdough.is20Percent ? 0.7 : 1,
                          fontSize: '0.875rem'
                        }}
                        placeholder="Weight (g)"
                      />
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        fontSize: '0.875rem'
                      }}>
                        <input
                          type="checkbox"
                          checked={product.sourdough.is20Percent}
                          onChange={() => toggle20Percent(product.name)}
                          style={{ width: '16px', height: '16px' }}
                        />
                        <span>20% of flour</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Flour Diversion Section - Responsive Layout */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <h3 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600',
                      margin: 0
                    }}>
                      Flour Diversion
                    </h3>
                    <button 
                      onClick={() => addNewFlour(product.name)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Add Flour
                    </button>
                  </div>
                </div>

                {product.flours.map((flour, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '8px', 
                    marginBottom: '12px',
                    padding: '12px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '4px'
                  }}>
                    <input
                      type="text"
                      placeholder="Flour name"
                      value={flour.name}
                      onChange={(e) => {
                        const newFlours = [...product.flours];
                        newFlours[index].name = e.target.value;
                        setProducts(prev => prev.map(p => 
                          p.name === product.name ? { ...p, flours: newFlours } : p
                        ));
                      }}
                      style={{
                        padding: '8px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '4px',
                        width: '100%',
                        fontSize: '0.875rem'
                      }}
                    />
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr auto',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      <div>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '0.75rem',
                          color: '#6B7280',
                          marginBottom: '2px'
                        }}>
                          Percentage
                        </label>
                        <input
                          type="number"
                          value={flour.percentage}
                          onChange={(e) => handleFlourPercentageChange(product.name, index, e.target.value)}
                          style={{
                            padding: '6px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                            width: '100%',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '0.75rem',
                          color: '#6B7280',
                          marginBottom: '2px'
                        }}>
                          Substitute
                        </label>
                        <input
                          type="number"
                          value={flour.substitute}
                          onChange={(e) => handleFlourSubstituteChange(product.name, index, e.target.value)}
                          disabled={product.sourdough.type === 'none'}
                          style={{
                            padding: '6px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                            width: '100%',
                            opacity: product.sourdough.type === 'none' ? 0.7 : 1,
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                      <button
                        onClick={() => removeFlour(product.name, index)}
                        style={{
                          padding: '6px 8px',
                          backgroundColor: '#EF4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          alignSelf: 'end'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '8px', 
                  marginTop: '12px',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ 
                    color: totalPercentage(product.flours) !== 100 ? '#EF4444' : 'inherit',
                    fontWeight: '500'
                  }}>
                    Total Percentage: {totalPercentage(product.flours)}%
                  </div>
                  {product.sourdough.type !== 'none' && (
                    <div style={{ 
                      color: totalSubstitute(product.flours) !== 10 ? '#EF4444' : 'inherit',
                      fontWeight: '500'
                    }}>
                      Total Substitute: {totalSubstitute(product.flours)}/10
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '12px', 
        marginTop: '24px'
      }}>
        <button
          onClick={handleSaveChanges}
          style={{
            padding: '12px 20px',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            order: 1
          }}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '12px 20px',
            backgroundColor: '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            order: 2
          }}
        >
          Cancel
        </button>
      </div>
      <div style={{ height: "50px" }} />
    </div>
  );
};

export default EditContents;