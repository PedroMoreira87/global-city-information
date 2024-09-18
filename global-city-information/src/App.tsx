import { Toaster } from 'react-hot-toast';

import Home from './pages/Home/Home.tsx';

function App() {
  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      <Home />
    </div>
  );
}

export default App;
