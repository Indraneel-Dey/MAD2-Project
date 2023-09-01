import router from "../js/router.js"

const Theatre = Vue.component("theatre", {
    template: `
                <div>
                    <h1>Theatre</h1>
                    <label class="error" v-if="error">{{ error }}</label>
                    <div v-if="theatre" class="row">
                        <div class="col-lg-6">
                            <h3>{{ theatre.name }}</h3>
                            <p style="text-align: center">Address: {{ theatre.place }}</p>
                            <p style="text-align: center">Capacity: {{ theatre.capacity }}</p>
                            <p style="text-align: center">Customers: {{ theatre.customers }}</p>
                            <p style="text-align: center">Earnings: {{ theatre.earnings }}</p>
                        </div>
                        <div class="col-lg-6">
                            <h3>Running Shows:</h3>
                            <h3 v-if="theatre.shows.len == 0">No running shows</h3>
                            <table class="table table-bordered table-hover">
                                <thead>
                                    <tr>
                                        <th>Show</th>
                                        <th>Timing</th>
                                        <th v-if="$store.getters.getUser.tier == 2">Cancel</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="show in theatre.shows">
                                        <td> <router-link :to="'/running/' + show.id">{{ show.name }}</router-link> </td>
                                        <td> {{ show.start_time }} - {{ show.end_time }} </td>
                                        <td v-if="$store.getters.getUser.tier == 2"> <button class="btn btn-danger btn-sm" @click="cancel_show(show.id)" v-if="$store.getters.getUser.tier == 2">Cancel Show</button> </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="btn-group center">
                            <router-link :to="'/edittheatre/' + theatre.id"><button class="btn btn-warning btn-lg" v-if="$store.getters.getUser.tier == 2">Edit</button></router-link>
                            <form v-if="$store.getters.getUser.tier == 2" @submit.prevent="delete_theatre">
                                <button class="btn btn-danger btn-lg" type="submit" onclick="return confirm('Are you sure you want to delete this theatre?')">Delete</button>
                            </form>
                        </div><br>
                    </div>
                    <div style="text-align: center">
                        <button class="btn btn-primary btn-lg" @click="download"><i class="fa fa-download"></i> Download</button>
                    </div>
                </div>
              `,
    
    data() {
        return {
            theatre: null,
            error: ''
        }
    },
    
    methods: {
        async fetchTheatre() {
            const id = this.$route.params.id
            fetch(`/api/theatre/${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.theatre = data.theatre;
                    this.error = '';
                } else {
                    this.theatre = null;
                    this.error = data.message;
                    router.push('/theatres');
                }
            })
            .catch(error => {
                this.error = error;
            });
        },

        async delete_theatre() {
            const id = this.$route.params.id
            fetch(`/api/theatre/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.error = '';
                    router.push('/theatres');
                } else {
                    this.error = data.message;
                    if (data.message == 'Theatre does not exist') {
                        router.push('/theatres');
                    }
                }
            })
            .catch(error => {
                this.error = error;
            });
        },

        async cancel_show(id) {
            fetch(`/api/running/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.error = '';
                    this.fetchTheatre();
                } else {
                    this.error = data.message;
                    if (data.message != 'Show has already started playing') {
                        router.push('/');
                    }
                }
            })
            .catch(error => {
                this.error = error;
            })
        },

        async download() {
            const id = this.$route.params.id;
            try {
                const response = await fetch(`/api/download_theatre/${id}`);
                const blob = await response.blob();
                const filename = `theatre_${id}.docx`;
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                this.error = error;
            }
        }
    },

    mounted() {
        this.fetchTheatre();
    }
})

export default Theatre;