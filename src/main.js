import './app.css'
import App from './App.svelte'
import { mount } from 'svelte';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


const app = mount(App, {target: document.getElementById('app')})

export default app
