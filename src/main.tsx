import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.getElementById("root")!;

document.body.classList.add('react-mounted');

createRoot(rootElement).render(<App />);