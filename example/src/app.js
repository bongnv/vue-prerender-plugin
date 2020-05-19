import Vue from 'vue';
import App from './App.vue';

export const createApp = () => {
  return new Vue({
    render: h => h(App),
  });
};
