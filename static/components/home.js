const Home = Vue.component("home", {
    template: `
                <div>
                    <label class="error" v-if="error">{{ error }}</label>
                    <h1>Currently Playing Shows</h1>
                    <h3 v-if="running_message">{{ running_message }}</h3>
                    <table class="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th>Show</th>
                                <th>Rating</th>
                                <th>Theatre</th>
                                <th>Ticket Price</th>
                                <th>Timing</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="running in running_data">
                                <td><router-link :to="'/running/' + running.id">{{ running.show_name }}</router-link></td>
                                <td>{{ running.rating }}</td>
                                <td>{{ running.theatre_name }}</td>
                                <td>Rs {{ running.ticket_price }}</td>
                                <td>{{ running.start_time }} - {{ running.end_time }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <h1>Upcoming Shows</h1>
                    <h3 v-if="upcoming_message">{{ upcoming_message }}</h3>
                    <table class="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th>Show</th>
                                <th>Rating</th>
                                <th>Theatre</th>
                                <th>Ticket Price</th>
                                <th>Timing</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="running in upcoming_data">
                                <td><router-link :to="'/running/' + running.id">{{ running.show_name }}</router-link></td>
                                <td>{{ running.rating }}</td>
                                <td>{{ running.theatre_name }}</td>
                                <td>Rs {{ running.ticket_price }}</td>
                                <td>{{ running.start_time }} - {{ running.end_time }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
              `,
    
    data() {
        return {
            running_data: [],
            upcoming_data: [],
            error: '',
            running_message: '',
            upcoming_message: ''
        }
    },
    
    methods: {
        async fetchRunning() {
            fetch('/api/current_shows')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.running_data = data.data;
                    this.running_message = '';
                    this.error = '';
                } else {
                    this.running_message = data.message;
                    this.error = '';
                }
            })
            .catch(error => {
                this.error = error;
                this.running_message = '';
            });
        },

        async fetchUpcoming() {
            fetch('/api/upcoming_shows')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.upcoming_data = data.data;
                    this.upcoming_message = '';
                    this.error = '';
                } else {
                    this.upcoming_message = data.message;
                    this.error = '';
                }
            })
            .catch(error => {
                this.error = error;
                this.upcoming_message = '';
            });
        }
    },

    mounted() {
        this.fetchRunning();
        this.fetchUpcoming();
    }
})

export default Home;