const Login = Vue.component("login", {
    template: `
                <div class="row">
                    <div class="col-lg-4"></div>
                    <div class="form-wrapper col-lg-4">
                        <label class="error" v-if="error">{{ error }}</label>
                        <h2 class="title">Login</h2>
                        <form class="form" @submit.prevent="handleSubmit">
                            <div>
                                <label for="username" class="form-label">Username</label>
                                <input type="text" id="username" v-model="username" required class="form-control"/>
                            </div>
                            <div>
                                <label for="password" class="form-label">Password</label>
                                <input id="password" v-model="password" :type="type" required class="form-control"/>
                                Show Password <input type="checkbox" v-model="text" class="form-check-input"/>
                            </div>
                            <div>
                                <label for="remember" class="form-label">Remember me</label>
                                <input type="checkbox" id="remember" v-model="remember" class="form-check-input"/>
                            </div>
                            <button class="btn btn-info btn-lg submit" type="submit">Login</button>
                        </form>
                        <div style="text-align: center">
                            <router-link to="/signup">Signup</router-link>
                        </div>
                    </div>
                    <div class="col-lg-4"></div>
                </div>
              `,
    
    data() {
        return {
            username: '',
            password: '',
            remember: false,
            text: false,
            type: 'password',
            error: ''
        }
    },
    
    methods: {
        handleSubmit() {
            this.$store.dispatch('login', {
                username: this.username,
                password: this.password,
                remember: this.remember
          });
        }
    },

    watch: {
        text(boolean) {
            this.type = 'password';
            if (boolean) {
                this.type = 'text'
            } else {
                this.type = 'password'
            }
        },

        '$store.state.login_error'(newVal) {
            this.error = newVal;
        }
    }
})

export default Login;