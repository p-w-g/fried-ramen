import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import { reportError } from './errors';
import './assets/main.css';

const app = createApp(App);
app.config.errorHandler = reportError;
window.addEventListener('unhandledrejection', (event) =>
  reportError(event.reason),
);
app.use(createPinia()).use(router).mount('#app');
