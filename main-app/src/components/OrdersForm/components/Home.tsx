import { useEffect, useState } from 'react';
import './Home.css';
import { getProducts } from '../services/api';

interface Product {
  name: string;
  image: string;
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts('generic_products');
        if (data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home-container">
      {/* Logo added at the top of the form with larger size */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
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

      {/* About Section */}
      <section className="about-section">
        <h1>קצת עליי...</h1>
        <div className="text-content">
          <p className="black">
            הי, שמי עדית. אני אופה. בוגרת קורס קונדיטוריה ב"אסטלה", והשתלמויות מקצועיות של 
            master bakers מגרמניה וצרפת, כולל סדנה של הכנת מאפים מתוקים ממחמצת. הבצק ללחמים 
            שלי נעשה במלוש איטלקי- SUNMIX והאפייה- בתנור rofco, תנור לחם מקצועי מבלגיה.
          </p>
          <h1>קצת על הלחמים...</h1>
          <p className="orange">
           הלחמים הם על בסיס מחמצת, קמח ומים. ללא שמרים תעשייתיים או 
            חומרים משמרים. אחרי לישה במלוש וקיפולים במשך כ-5 שעות הם מעוצבים לסלסילות 
            התפחה שנכנסות למקרר ל-24 שעות תפיחה לפחות.
          </p>
          <p className="black">
           ניתן לקבל את הלחם פרוס. מומלץ לשמור את הלחם במקפיא החל מהיום השני 
            לאפייתו ולחמם חימום קל בטוסטר קופץ על מנת להחזירו לחיים.
          </p>
          <p className="purple" style={{ textAlign: 'center' }}>
            טלפון: עדית- 050-5991166
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <h1>המוצרים שלנו</h1>
        <div className="products-grid">
          {products.map((product, index) => (
            <div key={index} className="product-card">
              <img 
                src={`http://13.49.120.33/api/images/${encodeURIComponent(product.name)}`} 
                alt={product.name} 
                className="product-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.jpg';
                }}
              />
              <h3 className="product-name">
  {product.name}
</h3>

            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;