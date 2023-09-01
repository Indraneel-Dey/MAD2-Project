import router from "../js/router.js";

const EditTheatre = Vue.component("edit_theatre", {
    template: `
                <div class="row">
                    <div class="col-lg-4"></div>
                    <div class="form-wrapper col-lg-4">
                        <label class="error" v-if="error">{{ error }}</label>
                        <h2 class="title">Edit Theatre</h2>
                        <form class="form" @submit.prevent="edit_theatre">
                            <div>
                                <label for="name" class="form-label">Name</label>
                                <input type="text" id="name" v-model="name" required class="form-control"/>
                            </div>
                            <button class="btn btn-warning btn-lg submit" type="submit">Edit</button>
                        </form>
                    </div>
                    <div class="col-lg-4"></div>
                </div>
              `,
    
    data() {
        return {
            name: '',
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
                    this.name = data.theatre.name;
                    this.error = '';
                } else {
                    this.name = '';
                    this.error = data.message;
                    router.push('/theatres');
                }
            })
            .catch(error => {
                this.error = error;
            });
        },

        edit_theatre() {
            const id = this.$route.params.id
            fetch(`/api/theatre/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: this.name
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.error = '';
                    const id = data.id;
                    router.push(`/theatre/${id}`);
                } else {
                    this.error = data.message;
                    router.push('/theatres');
                }
            })
            .catch(error => {
                this.error = error;
            });
        }
    },

    mounted() {
        this.fetchTheatre();
    }
})

export default EditTheatre;