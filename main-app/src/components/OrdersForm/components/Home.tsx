import { useState, useEffect } from 'react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://13.49.120.33/api/products/generic_products');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products || []);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Unable to load products');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (productName: any) => {
    return `http://13.49.120.33/api/images/${encodeURIComponent(productName)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header with Logo */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* About Section */}
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-12" dir="rtl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-right">
            קצת עליי...
          </h2>
          
          <div className="space-y-6 text-lg leading-relaxed">
            {/* Black text section */}
            <div className="text-gray-800 text-right">
              <p className="mb-4">
                הי, שמי עדית. אני אופה. בוגרת קורס קונדיטוריה ב"אסטלה", והשתלמויות מקצועיות של&nbsp;
                <span className="font-semibold">master bakers</span>
                &nbsp;מגרמניה וצרפת, כולל סדנה של הכנת מאפים מתוקים ממחמצת.
              </p>
              <p>
                הבצק ללחמים שלי נעשה במלוש איטלקי&nbsp;
                <span className="font-semibold">SUNMIX</span>
                &nbsp;והאפייה בתנור&nbsp;
                <span className="font-semibold">rofco</span>
                , תנור לחם מקצועי מבלגיה.
              </p>
            </div>

            {/* Orange text section */}
            <div className="bg-orange-50 p-6 rounded-xl border-r-4 border-orange-400">
              <h3 className="text-2xl font-bold text-orange-600 mb-4 text-right">
                קצת על הלחמים...
              </h3>
              <p className="text-orange-800 text-right">
                הלחמים הם על בסיס מחמצת, קמח ומים.&nbsp;
                <span className="font-bold">*ללא*</span>
                &nbsp;שמרים תעשייתיים או חומרים משמרים. 
                אחרי לישה במלוש וקיפולים במשך כ-5 שעות הם מעוצבים לסלסילות התפחה שנכנסות למקרר ל-24 שעות תפיחה לפחות.
              </p>
            </div>

            {/* Black text section */}
            <div className="text-gray-800 text-right">
              <h3 className="text-xl font-bold mb-3">בנוסף:</h3>
              <p>
                ניתן לקבל את הלחם פרוס. מומלץ לשמור את הלחם במקפיא החל מהיום השני לאפייתו 
                ולחמם חימום קל בטוסטר קופץ על מנת להחזירו לחיים.
              </p>
            </div>

            {/* Purple contact section */}
            <div className="bg-purple-100 p-6 rounded-xl border-2 border-purple-300">
              <p className="text-purple-800 text-xl font-bold text-right">
                טלפון: עדית- 050-5991166
              </p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8" dir="rtl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-right">
            המוצרים שלנו
          </h2>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-gray-600">טוען מוצרים...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">{error}</p>
              <button 
                onClick={fetchProducts}
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                נסה שוב
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: any, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-square bg-white rounded-lg mb-4 overflow-hidden shadow-md">
                    <img
                      src={getImageUrl(product.name)}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e: any) => {
                        e.target.src = '/api/placeholder/200/200';
                        e.target.alt = 'תמונה לא זמינה';
                      }}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 text-right">
                    {product.name}
                  </h3>
                  {product.price && (
                    <p className="text-orange-600 font-semibold text-right mt-2">
                      ₪{product.price}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">אין מוצרים להצגה כרגע</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg">
            עדית - מאפיית לחמי מחמצת מסורתיים
          </p>
          <p className="text-purple-300 font-semibold mt-2">
            050-5991166
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;