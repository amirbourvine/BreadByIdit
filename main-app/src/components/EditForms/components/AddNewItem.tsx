import React, { useState, useRef } from 'react';
import { addProduct, uploadProductImage } from '../services/api';

interface AddNewItemProps {
  onSave: (product: any) => void;
  onCancel: () => void;
  formName?: string;
}

function AddNewItem({ onSave, formName = "generic_products" }: AddNewItemProps) {
  const [productName, setProductName] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [extras, setExtras] = useState<Array<{ name: string; minAmount: number; maxAmount: number; price: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddExtra = () => {
    setExtras([...extras, { name: '', minAmount: 0, maxAmount: 10, price: 0 }]);
  };

  const handleExtraChange = (index: number, field: string, value: any) => {
    const updatedExtras = [...extras];
    updatedExtras[index] = { ...updatedExtras[index], [field]: value };
    setExtras(updatedExtras);
  };

  const handleDeleteExtra = (index: number) => {
    const updatedExtras = [...extras];
    updatedExtras.splice(index, 1);
    setExtras(updatedExtras);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.match('image/jpeg')) {
        setImageError('Only JPG/JPEG files are allowed');
        setSelectedImage(null);
        setImagePreview(null);
        return;
      }
      
      setImageError(null);
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const newProduct = {
        name: productName,
        description: productDescription,
        extras: extras,
        soldOut: false,
        existent: true,
        hasImage: !!selectedImage
      };
      
      if (selectedImage) {
        const imageName = productName.toLowerCase() + '.jpg';
        await uploadProductImage(selectedImage, imageName);
      }
      
      await addProduct(formName, newProduct);
      
      onSave(newProduct);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      boxSizing: 'border-box',
      // backgroundColor: '#f9fafb',
      // borderRadius: '12px',
      // boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      position: 'relative'
    }}>
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.75rem', 
          color: '#1F2937',
          flex: '1 1 100%',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          Add New Product
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{ 
        display: 'grid', 
        gap: '1.5rem'
      }}>
        {/* Product Name */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '600',
            color: '#374151'
          }}>
            Product Name:
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '600',
            color: '#374151'
          }}>
            Description:
          </label>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              minHeight: '150px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '600',
            color: '#374151'
          }}>
            Product Image (JPG only):
          </label>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg"
              onChange={handleImageChange}
              style={{
                flex: '1',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '1rem',
                minWidth: '250px'
              }}
            />
            {selectedImage && (
              <button
                type="button"
                onClick={clearImageSelection}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
          </div>
          {imageError && <div style={{ color: '#EF4444', marginTop: '0.5rem' }}>{imageError}</div>}
          {imagePreview && (
            <div style={{ marginTop: '1rem', maxWidth: '300px' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  width: '100%', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
                }} 
              />
            </div>
          )}
        </div>

        {/* Extras */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1rem' 
          }}>
            <label style={{ 
              fontWeight: '600',
              color: '#374151'
            }}>
              Extras:
            </label>
            <button
              type="button"
              onClick={handleAddExtra}
              style={{
                padding: '8px 12px',
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              + Add Extra
            </button>
          </div>

          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            paddingRight: '10px' 
          }}>
            {extras.map((extra, index) => (
              <div 
                key={index} 
                style={{ 
                  border: '1px solid #E5E7EB', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '1rem' 
                }}>
                  <div style={{ fontWeight: '500', color: '#374151' }}>Extra #{index + 1}</div>
                  <button
                    type="button"
                    onClick={() => handleDeleteExtra(index)}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: '#EF4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                  gap: '1rem' 
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Name:</label>
                    <input
                      type="text"
                      value={extra.name}
                      onChange={(e) => handleExtraChange(index, 'name', e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '6px' 
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Min:</label>
                    <input
                      type="number"
                      value={extra.minAmount}
                      onChange={(e) => handleExtraChange(index, 'minAmount', parseInt(e.target.value))}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '6px' 
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Max:</label>
                    <input
                      type="number"
                      value={extra.maxAmount}
                      onChange={(e) => handleExtraChange(index, 'maxAmount', parseInt(e.target.value))}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '6px' 
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Price:</label>
                    <input
                      type="number"
                      value={extra.price}
                      onChange={(e) => handleExtraChange(index, 'price', parseFloat(e.target.value))}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '6px' 
                      }}
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '1rem',
          paddingBottom: '2rem'
        }}>
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              width: '100%',
              maxWidth: '300px',
              transition: 'background-color 0.3s ease'
            }}
            disabled={isSubmitting}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
          >
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddNewItem;