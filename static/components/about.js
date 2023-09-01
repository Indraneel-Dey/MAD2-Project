const About = Vue.component("about", {
    template: `
                <div>
                    <h2> About Us </h2>
                    <p style="text-align: center">This app was made by Indraneel Dey for his Modern Application Development 2 course project.</p><br>
                    <p style="text-align: center">The frontend is made using Vue framework of Javascript making it more dynamic and various new features
                    such as Celery/Redis for async jobs and caching have been added.</p><br>
                    <p style="text-align: center">Visit the website of IIT Madras degree program in Data Science and Programming <a href="https://study.iitm.ac.in/ds/">here</a></p>
                    <br>
                    <p style="text-align: center">Number of users: {{ number }}</p>
                    <label class="error" v-if="error">{{ error }}</label>
                </div>
              `,
            
    data() {
        return {
            number: null,
            error: ''
        }
    },

    methods: {
        fetchUsers() {
            fetch('/api/users', {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                this.number = data.number;
            })
            .catch(error => {
                this.error = error;
            })
        }
    },

    mounted() {
        this.fetchUsers();
    }
});
  
export default About;