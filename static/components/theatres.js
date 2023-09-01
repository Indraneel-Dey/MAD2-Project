const Theatres = Vue.component("theatres", {
    template: `
                <div>
                    <div class="row">
                        <div class="col-lg-4" style="text-align: center">
                            <button class="btn btn-primary btn-lg" @click="download"><i class="fa fa-download"></i> Download</button>
                        </div>
                        <div class="col-lg-4" style="text-align: center">
                            Search Theatre &nbsp;&nbsp;&nbsp;
                            <form @submit.prevent="search_theatre">
                                <input type="text" v-model="search" name="search" class="default">
                                <button type="submit" class="btn btn-info" style="width: initial"><i class="fa fa-search"></i></button>
                            </form>
                        </div>
                        <div class="col-lg-4" style="text-align: center">
                            Search Theatre by Place &nbsp;&nbsp;&nbsp;
                            <form @submit.prevent="search_theatre_place">
                                <input type="text" v-model="search_place" name="search_place" class="default">
                                <button type="submit" class="btn btn-info" style="width: initial"><i class="fa fa-search"></i></button>
                            </form>
                        </div>
                    </div>
                    <h1>Theatres</h1>
                    <label class="error" v-if="error">{{ error }}</label>
                    <h3 v-if="message">{{ message }}</h3>
                    <table class="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <td>Theatre</td>
                                <td>Address</td>
                                <td>Capacity</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="theatre in theatres">
                                <td><router-link :to="'/theatre/' + theatre.id">{{ theatre.name }}</router-link></td>
                                <td>{{ theatre.place }}</td>
                                <td>{{ theatre.capacity }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
              `,
    
    data() {
        return {
            theatres: [],
            search: '',
            search_place: '',
            error: '',
            message: ''
        }
    },
    
    methods: {
        async fetchTheatres() {
            fetch('/api/theatres', {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.theatres = data.theatres;
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

        async search_theatre() {
            fetch('/api/search_theatre', {
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
                    this.theatres = data.theatres;
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

        async search_theatre_place() {
            fetch('/api/search_theatre_place', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    search: this.search_place
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.theatres = data.theatres;
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
                const response = await fetch(`/api/download_theatres`);
                const blob = await response.blob();
                const filename = 'theatre_data.csv';
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
        this.fetchTheatres();
    }
})

export default Theatres;