import router from "../js/router.js"

const Show = Vue.component("show", {
    template: `
                <div>
                    <h1>Show</h1>
                    <label class="error" v-if="error">{{ error }}</label>
                    <div v-if="show" class="row">
                        <div class="col-lg-6">
                            <h3>{{ show.name }}</h3>
                            <p style="text-align: center">Rating: {{ show.rating }}</p>
                            <p style="text-align: center">Ticket Price: {{ show.ticket_price }}</p>
                            <p style="text-align: center">Viewers: {{ show.viewers }}</p>
                            <p style="text-align: center">Revenue: {{ show.revenue }}</p>
                            <h3>Tags:</h3>
                            <div class="center">
                                <ul class="list-group list-group-horizontal">
                                    <li v-for="tag in show.tags" class="list-group-item">{{ tag.name }}</li>
                                </ul>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <h3>In Theatres:</h3>
                            <table class="table table-bordered table-hover">
                                <thead>
                                    <tr>
                                        <th>Theatre</th>
                                        <th>Timing</th>
                                        <th v-if="$store.getters.getUser.tier == 2">Cancel</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="theatre in show.theatres">
                                        <td> <router-link :to="'/running/' + theatre.id">{{ theatre.name }}</router-link> </td>
                                        <td> {{ theatre.start_time }} - {{ theatre.end_time }} </td>
                                        <td v-if="$store.getters.getUser.tier == 2"> <button class="btn btn-danger btn-sm" @click="cancel_show(theatre.id)" v-if="$store.getters.getUser.tier == 2">Cancel Show</button> </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="btn-group center">
                            <router-link :to="'/editshow/' + show.id"><button class="btn btn-warning btn-lg" v-if="$store.getters.getUser.tier == 2">Edit</button></router-link>
                            <form v-if="$store.getters.getUser.tier == 2" @submit.prevent="delete_show">
                                <button class="btn btn-danger btn-lg" type="submit" onclick="return confirm('Are you sure you want to delete this show?')">Delete</button>
                            </form>
                            <router-link :to="'/play/' + show.id"><button class="btn btn-primary btn-lg" v-if="$store.getters.getUser.tier == 2">Add to theatre</button></router-link>
                        </div><br>
                    </div>
                    <div style="text-align: center">
                        <button class="btn btn-primary btn-lg" @click="download"><i class="fa fa-download"></i> Download</button>
                    </div>
                </div>
              `,
    
    data() {
        return {
            show: null,
            tickets: null,
            selected_theatre: '',
            theatres: [],
            error: ''
        }
    },
    
    methods: {
        async fetchShow() {
            const id = this.$route.params.id
            fetch(`/api/show/${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.show = data.show;
                    this.error = '';
                } else {
                    this.show = null;
                    this.error = data.message;
                    router.push('/');
                }
            })
            .catch(error => {
                this.error = error;
            });
        },

        async delete_show() {
            const id = this.$route.params.id
            fetch(`/api/show/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.error = '';
                    router.push('/shows');
                } else {
                    this.error = data.message;
                    if (data.message == 'Show does not exist') {
                        router.push('/shows');
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
                    this.fetchShow();
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
                const response = await fetch(`/api/download_show/${id}`);
                const blob = await response.blob();
                const filename = `show_${id}.docx`;
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
        this.fetchShow();
    }
})

export default Show;