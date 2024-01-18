import { createApp } from "vue";
import "./main.css";
import { router } from "~/router";
import App from "./App.vue";
import { VueQueryPlugin } from "@tanstack/vue-query";

const app = createApp(App);

app.use(VueQueryPlugin);
app.use(router);

app.mount("#app");
