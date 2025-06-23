import { useEffect, useState } from 'react';
import './Home.css';

interface Product {
  name: string;
  image: string;
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://13.49.120.33/api/products/generic_products');
        const data = await response.json();
        if (data.success && data.products) {
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
      {/* Header with Logo */}
      <header>
        <img src="/logo.png" alt="Logo" className="logo" />
      </header>

      {/* About Section */}
      <section className="about-section">
        <h1>קצת עליי...</h1>
        <div className="text-content">
          <p className="black">
            הי, שמי עדית. אני אופה. בוגרת קורס קונדיטוריה ב"אסטלה", והשתלמויות מקצועיות של 
            master bakers מגרמניה וצרפת, כולל סדנה של הכנת מאפים מתוקים ממחמצת. הבצק ללחמים 
            שלי נעשה במלוש איטלקי- SUNMIX והאפייה- בתנור rofco, תנור לחם מקצועי מבלגיה.
          </p>
          <p className="orange">
            קצת על הלחמים... הלחמים הם על בסיס מחמצת, קמח ומים. *ללא* שמרים תעשייתיים או 
            חומרים משמרים. אחרי לישה במלוש וקיפולים במשך כ-5 שעות הם מעוצבים לסלסילות 
            התפחה שנכנסות למקרר ל-24 שעות תפיחה לפחות.
          </p>
          <p className="black">
            בנוסף: ניתן לקבל את הלחם פרוס. מומלץ לשמור את הלחם במקפיא החל מהיום השני 
            לאפייתו ולחמם חימום קל בטוסטר קופץ על מנת להחזירו לחיים.
          </p>
          <p className="purple">טלפון: עדית- 050-5991166</p>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <h1>המוצרים שלנו</h1>
        <div className="products-grid">
          {products.map((product, index) => (
            <div key={index} className="product-card">
              <img 
                src={`http://13.49.120.33/api/images/${encodeURIComponent(product.image)}`} 
                alt={product.name} 
                className="product-image"
              />
              <h3>{product.name}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;