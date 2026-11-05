import { createRoot } from 'react-dom/client';
import '@fontsource/bowlby-one/400.css';
import '@fontsource/nunito/500.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/900.css';
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')!).render(<App />);
