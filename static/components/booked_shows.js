const BookedShows = Vue.component("booked_shows", {
    template: `
                <div>
                    <h2> Booked Shows </h2>
                    <label class="error" v-if="error">{{ error }}</label>
                    <h3 v-if="message">No booked Shows</h3>
                    <table class="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th>Show</th>
                                <th>Theatre</th>
                                <th>Tickets</th>
                                <th>Timing</th>
                                <th>Cancel</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="booking in bookings">
                                <td><router-link :to="'/running/' + booking.running_id">{{ booking.show_name }}</router-link></td>
                                <td>{{ booking.theatre_name }}</td>
                                <td>{{ booking.tickets }}</td>
                                <td>{{ booking.start_time }} - {{ booking.end_time }}</td>
                                <td><button class="btn btn-danger btn-sm" @click="cancel_booking(booking.id)">Cancel</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
              `,
    
    data() {
        return {
            bookings: [],
            error: '',
            message: ''
        }
    },

    methods: {
        async fetchShows() {
            const id = this.$store.getters.getUser.id;
            fetch(`/api/booked_shows/${id}`, {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.bookings = data.bookings;
                    this.message = '';
                    this.error = '';
                } else {
                    this.message = data.message;
                    this.error = '';
                }
            })
            .catch(error => {
                this.error = error;
                this.message = '';
            })
        },

        async cancel_booking(id) {
            fetch(`/api/cancel_booking/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.bookings = this.bookings.filter(booking => booking.id != id);
                    this.error = '';
                } else {
                    this.error = data.message;
                }
            })
            .catch(error => {
                this.error = error;
            })
        }
    },

    mounted() {
        this.fetchShows();
    }
  });
  
  export default BookedShows;