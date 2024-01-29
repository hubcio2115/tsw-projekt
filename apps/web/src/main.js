import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { createApp } from "vue";

import { router } from "~/router";

import App from "./App.vue";
import "./main.css";

const pinia = createPinia();
const app = createApp(App);

app.use(VueQueryPlugin);
app.use(pinia);
app.use(router);

app.mount("#app");
