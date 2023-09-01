const Shows = Vue.component("shows", {
    template: `
                <div>
                    <div class="row">
                        <div class="col-lg-3" style="text-align: center">
                            <button class="btn btn-primary btn-lg" @click="download"><i class="fa fa-download"></i> Download</button>
                        </div>
                        <div class="col-lg-3" style="text-align: center">
                            Search Show by Name &nbsp;&nbsp;&nbsp;
                            <form @submit.prevent="search_show">
                                <input type="text" v-model="search" name="search" class="default">
                                <button type="submit" class="btn btn-info" style="width: initial"><i class="fa fa-search"></i></button>
                            </form>
                        </div>
                        <div class="col-lg-3" style="text-align: center">
                            Search Show by Rating &nbsp;&nbsp;&nbsp;
                            <form @submit.prevent="search_show_rating">
                                <select v-model="search_rating" name="search_rating" class="default">
                                    <option value="G">G</option>
                                    <option value="PG">PG</option>
                                    <option value="PG-13">PG-13</option>
                                    <option value="R">R</option>
                                    <option value="NC-17">NC-17</option>
                                </select>
                                <button type="submit" class="btn btn-info" style="width: initial"><i class="fa fa-search"></i></button>
                            </form>
                        </div>
                        <div class="col-lg-3" style="text-align: center">
                            Search Show by Tags &nbsp;&nbsp;&nbsp;
                            <form @submit.prevent="search_show_tags">
                                <select v-model="search_tags" name="search_tags" class="default">
                                    <option v-for="tag in tags" :value="tag.id">{{ tag.name }}</option>
                                </select>
                                <button type="submit" class="btn btn-info" style="width: initial"><i class="fa fa-search"></i></button>
                            </form>
                        </div>
                    </div>
                    <h1>Shows</h1>
                    <label class="error" v-if="error">{{ error }}</label>
                    <h3 v-if="message">{{ message }}</h3>
                    <table class="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <td>Show</td>
                                <td>Rating</td>
                                <td>Ticket Price</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="show in shows">
                                <td><router-link :to="'/show/' + show.id">{{ show.name }}</router-link></td>
                                <td>{{ show.rating }}</td>
                                <td>{{ show.ticket_price }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
              `,
    
    data() {
        return {
            shows: [],
            tags: [],
            search: '',
            search_rating: '',
            search_tags: '',
            error: '',
            message: ''
        }
    },
    
    methods: {
        async fetchShows() {
            fetch('/api/shows', {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.shows = data.shows;
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
            });
        },

        async fetchTags() {
            fetch('/api/tags', {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.tags = data.tags;
                    this.message = '';
                    this.error = '';
                } else {
                    this.message = '';
                    this.error = '';
                }
            })
            .catch(error => {
                this.error = error;
                this.message = '';
            });
        },

        async search_show() {
            fetch('/api/search_show', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    search: this.search
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.shows = data.shows;
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

        async search_show_rating() {
            fetch('/api/search_show_rating', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    search: this.search_rating
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.shows = data.shows;
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

        async search_show_tags() {
            fetch('/api/search_show_tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    search: this.search_tags
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.shows = data.shows;
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

        async download() {
            try {
                const response = await fetch(`/api/download_shows`);
                const blob = await response.blob();
                const filename = 'show_data.csv';
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
        this.fetchTags();
        this.fetchShows();
    }
})

export default Shows;