const Signup = Vue.component("signup", {
    template: `
                <div class="row">
                    <div class="col-lg-4"></div>
                    <div class="form-wrapper col-lg-4">
                        <label class="error" v-if="error">{{ error }}</label>
                        <h2 class="title">Sign Up</h2>
                        <form class="form" @submit.prevent="handleSubmit">
                            <div>
                                <label for="username" class="form-label">Username</label>
                                <input type="text" id="username" v-model="username" required class="form-control"/>
                            </div>

                            <div>
                                <label for="email" class="form-label">Email</label>
                                <input type="email" id="email" v-model="email" required class="form-control"/>
                            </div>

                            <div>
                                <label for="password" class="form-label">Password</label>
                                <input id="password" v-model="password" :type="type" required class="form-control"/>
                                Show Password <input type="checkbox" id="show" v-model="text" class="form-check-input"/>
                                <br>
                                Password Strength : {{ strength }}%<br v-if="strength < 100">
                                <label class="error" v-if="strength < 100 && password.length > 0">At least 1 lower case character, 1 upper case character, 1 digit, 1 special character, 8 characters</label>
                            </div>

                            <div>
                                <label for="repeatPassword" class="form-label">Repeat Password</label>
                                <input type="password" id="repeatPassword" v-model="repeatPassword" @input="repeat_password" required class="form-control"/>
                            </div>

                            <label class="error" v-if="invalid && repeatPassword.length > 0">Passwords must match</label>

                            <button class="btn btn-info btn-lg submit" v-if="valid" type="submit">Signup</button>
                        </form>
                        <div style="text-align: center">
                            <router-link to="/login">Login</router-link>
                        </div>
                    </div>
                    <div class="col-lg-4"></div>
                </div>
              `,
    
    data() {
        return {
            username: '',
            email: '',
            password: '',
            repeatPassword: '',
            invalid: true,
            error: '',
            text: false,
            type: 'password',
            weak: {
                lowercase: true,
                uppercase: true,
                digit: true,
                special: true,
                length: true,
            },
            strength: 0
        }
    },

    computed: {
        valid() {
            if (this.invalid == false && this.strength == 100) {
                return true
            } else {
                return false
            }
        }
    },

    methods: {
        handleSubmit() {
            // Dispatch the signup action from the Vuex store
            this.$store.dispatch('signup', {
                username: this.username,
                email: this.email,
                password: this.password
            });
        },

        repeat_password() {
            if (this.repeatPassword != this.password) {
                this.invalid = true
            } else {
                this.invalid = false
            }
        },

        calc_strength() {
            let c = 0;
            for (const i in this.weak) {
                if (this.weak[i] == false) {
                    c += 1;
                }
            }
            this.strength = c / 5 * 100;
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

        password(new_value) {
            this.weak.lowercase = true;
            this.weak.uppercase = true;
            this.weak.digit = true;
            this.weak.special = true;
            this.weak.length = true;

            if (new_value.length > 7) {
                this.weak.length = false;
            }

            for (let i = 0; i < new_value.length; i++) {
                let a = new_value[i];
                let b = new_value.charCodeAt(i);

                if (a >= "a" && a <= "z") {
                    this.weak.lowercase = false;
                }
                else if (a >= "A" && a <= "Z") {
                    this.weak.uppercase = false;
                }
                else if (a >= "0" && a <= "9") {
                    this.weak.digit = false;
                }
                else if ((b >= 32 && b <= 47) || (b >= 58 && b <= 64)) {
                    this.weak.special = false;
                }
            }
            this.calc_strength();
        },

        '$store.state.signup_error'(value) {
            this.error = value;
        }
    }
})

export default Signup;