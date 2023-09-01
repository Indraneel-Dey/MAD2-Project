import router from "../js/router.js";

const EditShow = Vue.component("edit_show", {
    template: `
                <div class="row">
                    <div class="col-lg-4"></div>
                    <div class="form-wrapper col-lg-4">
                        <label class="error" v-if="error">{{ error }}</label>
                        <h2 class="title">Edit Show</h2>
                        <form class="form" @submit.prevent="edit_show">
                            <div>
                                <label for="name" class="form-label">Name</label>
                                <input type="text" id="name" v-model="name" required class="form-control"/>
                            </div>
                            <div>
                                <label for="rating" class="form-label">Rating</label>
                                <input type="text" id="rating" v-model="rating" required class="form-control"/>
                            </div>
                            <div>
                                <label for="tags" class="form-label">Tags</label>
                                <select id="tags" name="tags" multiple v-model="selected_tags" class="form-select">
                                    <option v-for="tag in tags" :value="tag.id">{{ tag.name }}</option>
                                </select>
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
            rating: '',
            tags: [],
            selected_tags: [],
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
                    this.name = data.show.name;
                    this.rating = data.show.rating;
                    this.selected_tags = data.show.tags;
                    this.error = '';
                } else {
                    this.name = '';
                    this.rating = '';
                    this.selected_tags = [];
                    this.error = data.message;
                    router.push('/shows');
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
                    this.error = '';
                }
            })
            .catch(error => {
                this.error = error;
            });
        },

        edit_show() {
            const id = this.$route.params.id
            fetch(`/api/show/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: this.name,
                    rating: this.rating,
                    tags: this.selected_tags
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
                    if (data.message == 'Show does not exist') {
                        router.push('/shows');
                    }
                }
            })
            .catch(error => {
                this.error = error;
            });
        }
    },

    mounted() {
        this.fetchTags();
        this.fetchShow();
    }
})

export default EditShow;