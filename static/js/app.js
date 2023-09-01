import router from "./router.js";
import store from "./store.js";

const app = new Vue({
    el: "#app",
    delimiters: ["${", "}"],
    router: router,
    store: store,
    data: {},

    methods: {
        handleLogout() {
            this.$store.dispatch('logout');
        }
    },

    created() {
        fetch('/api/check_loggedin')
        .then(response => response.json())
        .then(data => {
            if (data.isLoggedIn) {
                store.commit('SET_LOGGED_IN', true);
                store.commit('SET_USER', data.user);
                router.push('/');
            } else {
                store.commit('SET_LOGGED_IN', false);
                store.commit('SET_USER', null);
            }
        })
        .catch(error => {
            store.commit('SET_LOGIN_ERROR', error);
        })
    }
});