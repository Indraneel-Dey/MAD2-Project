import router from "../js/router.js"

const Running = Vue.component("running", {
    template: `
                <div>
                    <h1>Playing</h1>
                    <label class="error" v-if="error">{{ error }}</label>
                    <div v-if="running">
                        <h3>Show: {{ running.show_name }}</h3>
                        <h3>Theatre: {{ running.theatre_name }}</h3>
                        <p style="text-align: center">Rating: {{ running.rating }}</p>
                        <p style="text-align: center">Ticket Price: {{ running.ticket_price }}</p>
                        <p style="text-align: center">from {{ running.start_time }} to {{ running.end_time }}</p>
                        <div class="row">
                            <div class="col-lg-4"></div>
                            <div class="form-wrapper col-lg-4">
                                <form class="form" @submit.prevent="book_show">
                                    <div>
                                        <label for="tickets" class="form-label">Number of tickets:</label>
                                        <input type="number" id="tickets" v-model="tickets" required class="form-control"/>
                                    </div>
                                    <button class="btn btn-primary btn-lg submit"type="submit">Book</button>
                                </form>
                            </div>
                            <div class="col-lg-4"></div>
                        </div>
                    </div>
                </div>
              `,
    
    data() {
        return {
            running: null,
            tickets: null,
            error: ''
        }
    },
    
    methods: {
        async fetchRunning() {
            const id = this.$route.params.id
            fetch(`/api/running/${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.running = data.running;
                    this.error = '';
                } else {
                    this.running = null;
                    this.error = data.message;
                    router.push('/');
                }
            })
            .catch(error => {
                this.error = error;
            });
        },

        async book_show() {
            const user_id = this.$store.getters.getUser.id;
            const running_id = this.$route.params.id;
            fetch(`/api/book_show/${user_id}/${running_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tickets: this.tickets
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.error = '';
                    router.push('/booked_shows');
                } else {
                    this.error = data.message;
                    if (data.message == 'Show or Theatre does not exist') {
                        router.push('/');
                    };
                }
            })
            .catch(error => {
                this.error = error
            });
        }
    },

    mounted() {
        this.fetchRunning();
    }
})

export default Running;