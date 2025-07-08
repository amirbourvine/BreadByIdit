import { useEffect, useState } from 'react';
import './Home.css';
import { getProducts } from '../services/api';

interface Product {
  name: string;
  image: string;
}

interface HomeProps {
  pages?: string[];
  onSelectForm?: (form: string) => void;
}

const Home = ({ pages = [], onSelectForm }: HomeProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const rearrangeText = (text: string): string => {
    // English letter detection - if word contains any English letters, it's English
    const englishRegex = /[a-zA-Z]/;
    
    // Split text into words, preserving spaces
    const words = text.trim().split(/\s+/);
    
    // Debug: log the original text and words
    console.log('Original text:', text);
    console.log('Words:', words);
    
    // Find sections of Hebrew and English
    interface Section {
      type: 'hebrew' | 'english';
      words: string[];
    }
    
    const sections: Section[] = [];
    let currentSection: Section | null = null;
    
    words.forEach((word: string) => {
      const hasEnglish: boolean = englishRegex.test(word);
      const wordType: 'hebrew' | 'english' = hasEnglish ? 'english' : 'hebrew';
      
      console.log(`Word: "${word}" -> Type: ${wordType}`);
      
      if (currentSection === null || currentSection.type !== wordType) {
        // Start new section
        currentSection = { type: wordType, words: [word] };
        sections.push(currentSection);
      } else {
        // Add to current section
        currentSection.words.push(word);
      }
    });
    
    console.log('Sections:', sections);
    
    // Check if we have exactly 3 sections with pattern: hebrew -> english -> hebrew
    if (sections.length === 3 && 
        sections[0].type === 'hebrew' && 
        sections[1].type === 'english' && 
        sections[2].type === 'hebrew') {
      
      const hebrew1: string = sections[0].words.join(' ');
      const english: string = sections[1].words.join(' ');
      const hebrew2: string = sections[2].words.join(' ');
      
      const result = `${hebrew2} ${english} ${hebrew1}`;
      console.log('Rearranged:', result);
      return result;
    }
    
    // Also handle case where we have 2 sections: swap them
    if (sections.length === 2) {
      const first: string = sections[0].words.join(' ');
      const second: string = sections[1].words.join(' ');
      
      // Swap: first second -> second first
      const result = `${second} ${first}`;
      console.log('Rearranged (2 sections - swapped):', result);
      return result;
    }
    
    console.log('No rearrangement needed');
    return text;
  };

  // Filter out "Home" page from forms list
  const filteredPages = pages.filter(page => page !== "Home");

  const handleFormSelect = (form: string) => {
    if (onSelectForm) {
      onSelectForm(form);
    }
  };

  const formButtonStyle = {
    padding: '14px 16px',
    backgroundColor: '#374151',
    borderRadius: '8px',
    textAlign: 'center' as const,
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500' as const,
    width: '100%',
    maxWidth: '300px',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    margin: '8px'
  };

  

  return (
    <>
    <div style={{ 
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      marginRight: 'calc(-50vw + 50%)',
      backgroundColor: '#CCB79f',
      textAlign: 'center',
      padding: '20px 0',
      marginTop: isMobile ? '0px' : '0px',
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

    <div className="home-container">

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

      {/* Forms Section */}
      {filteredPages.length > 0 && (
        <section className="forms-section">
          <h1>הזמינו בטפסים שלנו</h1>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: '16px',
            margin: '20px 0' 
          }}>
            {filteredPages.map((page) => (
              <button
                key={page}
                style={formButtonStyle}
                onClick={() => handleFormSelect(page)}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }}
              >
                {page}
              </button>
            ))}
          </div>
        </section>
      )}

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
                {rearrangeText(product.name)}
              </h3>
            </div>
          ))}
        </div>
      </section>
    </div>
    </>
  );
};

export default Home;