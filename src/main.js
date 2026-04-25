import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import './assets/style.css'
import { initTheme } from './composables/useTheme.js'

initTheme()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
