import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './theme/crt.css'
import './theme/paper.css'

createApp(App).use(createPinia()).mount('#app')
