import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import EditForms from './components/EditForms/App';
import OrdersForm from './components/OrdersForm/App';

function AppRouter() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  if (id === 'manager') {
    return <EditForms />;
  } else if (id === 'client') {
    return <OrdersForm />;
  } else {
    return <div>Invalid ID parameter. Use ?id=manager or ?id=client</div>;
  }
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AppRouter />} />
      </Routes>
    </Router>
  );
}

export default App;