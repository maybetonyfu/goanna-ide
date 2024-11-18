import App from './App.svelte'
import { mount } from 'svelte';
import './app.css'
import './hint.css'
const app = mount(App, {target: document.getElementById('app')})

export default app
