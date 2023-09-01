import router from "../js/router.js";

const PlayShow = Vue.component("play_show", {
    template: `
                <div class="row">
                    <div class="col-lg-4"></div>
                    <div class="form-wrapper col-lg-4">
                        <label class="error" v-if="error">{{ error }}</label>
                        <h2 class="title">Play Show</h2>
                        <form class="form" @submit.prevent="play_show">
                            <div>
                                <label for="tags" class="form-label">Theatre</label>
                                <select id="theatre" name="theatre" v-model="selected_theatre" class="form-select">
                                    <option v-for="theatre in theatres" :value="theatre.id">{{ theatre.name }}</option>
                                </select>
                            </div>
                            <div>
                                <label for="date">Date:</label>
                                <input type="date" id="date" name="date" v-model="date" required class="form-control"/>
                            </div>
                            <div>
                                <label for="start_time" class="form-label">Start Time:</label>
                                <input type="time" id="start_time" name="start_time" v-model="start_time" required class="form-control"/>
                            </div>
                            <div>
                                <label for="end_time" class="form-label">End Time:</label>
                                <input type="time" id="end_time" name="end_time" v-model="end_time" required class="form-control"/>
                            </div>
                            <button class="btn btn-primary btn-lg submit" type="submit">Play</button>
                        </form>
                    </div>
                    <div class="col-lg-4"></div>
                </div>
              `,
    
    data() {
        return {
            theatres: [],
            selected_theatre: null,
            date: null,
            start_time: null,
            end_time: null,
            error: ''
        }
    },
    
    methods: {
        async fetchTheatres() {
            fetch('/api/theatres')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.theatres = data.theatres;
                    this.error = '';
                }
            })
            .catch(error => {
                this.error = error;
            });
        },

        play_show() {
            const id = this.$route.params.id
            fetch(`/api/play_show/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    theatre_id: this.selected_theatre,
                    date: this.date,
                    start_time: this.start_time,
                    end_time: this.end_time
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.error = '';
                    const id = data.id;
                    router.push(`/show/${id}`);
                } else {
                    this.error = data.message;
                    router.push('/shows');
                }
            })
            .catch(error => {
                this.error = error;
            });
        }
    },

    mounted() {
        this.fetchTheatres();
    }
})

export default PlayShow;