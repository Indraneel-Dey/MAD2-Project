import router from "./router.js";

const store = new Vuex.Store({
    state: {
        loggedIn: false,
        login_error: '',
        signup_error: '',
        logout_error: '',
        user: null
    },

    getters: {
        isLoggedIn: (state) => state.loggedIn,
        getUser: (state) => state.user,
    },
  
    mutations: {
        SET_LOGGED_IN(state, value) {
            state.loggedIn = value;
        },
        SET_LOGIN_ERROR(state, error) {
            state.login_error = error;
        },
        SET_SIGNUP_ERROR(state, error) {
            state.signup_error = error;
        },
        SET_LOGOUT_ERROR(state, error) {
            state.logout_error = error;
        },
        SET_USER(state, user) {
            state.user = user;
        }
    },
  
    actions: {
        async logout({ commit }) {
            fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    commit('SET_LOGGED_IN', false);
                    commit('SET_USER', null);
                    router.push('/login');
                } else {
                    commit('SET_LOGOUT_ERROR', 'Unable to logout');
                }
            })
            .catch(error => {
                commit('SET_LOGOUT_ERROR', error);
            });
        },

        async login({ commit }, { username, password, remember }) {
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    remember: remember
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    commit('SET_LOGGED_IN', true);
                    commit('SET_USER', data.user);
                    commit('SET_LOGIN_ERROR', '');
                    router.push('/');
                } else {
                    commit('SET_LOGIN_ERROR', data.message);
                }
            })
            .catch(error => {
                commit('SET_LOGIN_ERROR', error);
            });
        },

        async signup({ commit }, { username, email, password }) {
            // Make the signup API request
            fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Signup successful, navigate to home page
                    commit('SET_LOGGED_IN', true);
                    commit('SET_USER', data.user);
                    commit('SET_SIGNUP_ERROR', '');
                    router.push('/');
                } else {
                    commit('SET_SIGNUP_ERROR', data.message);
                }
            })              
            .catch(error => {
                commit('SET_SIGNUP_ERROR', 'An error occured during signup')
            });
        }
    },
});
  
export default store;