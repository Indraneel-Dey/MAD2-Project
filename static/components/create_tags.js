const CreateTags = Vue.component("create_tags", {
    template: `
                <div>
                    <div class="row">
                        <div class="col-lg-4"></div>
                        <div class="form-wrapper col-lg-4">
                            <label class="error" v-if="error">{{ error }}</label>
                            <h2 class="title">Create Tags</h2>
                            <form class="form" @submit.prevent="create_tag">
                                <div>
                                    <label for="name" class="form-label">Name</label>
                                    <input type="text" id="name" v-model="name" required class="form-control"/>
                                </div>
                                <button class="btn btn-primary btn-lg submit" type="submit">Create</button>
                            </form>
                        </div>
                        <div class="col-lg-4"></div>
                    </div>
                    <p v-if="message" style="background-color: rgba(0,0,255,0.6); text-align: center">{{ message }}</p>
                    <br>
                    <table class="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <td>Tag</td>
                                <td>Edit</td>
                                <td>Delete</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="tag in tags">
                                <td>{{ tag.name }}</td>
                                <td><router-link :to="'/edittag/' + tag.id"><button class="btn btn-warning btn-lg">Edit</button></router-link></td>
                                <td><button class="btn btn-danger btn-lg" @click="delete_tag(tag.id)">Delete</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
              `,
    
    data() {
        return {
            name: '',
            tags: [],
            error: '',
            message: ''
        }
    },
    
    methods: {
        create_tag() {
            fetch('/api/tags', {
                method: 'POST',
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
                    this.name = '';
                    this.error = '';
                    this.fetchTags();
                } else {
                    this.error = data.message;
                    this.message = '';
                }
            })
            .catch(error => {
                this.error = error;
            });
        },

        async fetchTags() {
            fetch('/api/tags')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.tags = data.tags;
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

        async delete_tag(id) {
            fetch(`/api/tag/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                this.message = '';
                this.error = '';
                this.tags = this.tags.filter(tag => tag.id != id);
            })
            .catch(error => {
                this.error = error;
                this.message = '';
            })
        }
    },

    mounted() {
        this.fetchTags();
    }
})

export default CreateTags;