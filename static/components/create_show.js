import router from "../js/router.js";

const CreateShow = Vue.component("create_show", {
    template: `
                <div class="row">
                    <div class="col-lg-4"></div>
                    <div class="form-wrapper col-lg-4">
                        <label class="error" v-if="error">{{ error }}</label>
                        <h2 class="title">Create Show</h2>
                        <form class="form" @submit.prevent="create_show">
                            <div>
                                <label for="name" class="form-label">Name</label>
                                <input type="text" id="name" v-model="name" required class="form-control"/>
                            </div>
                            <div>
                                <label for="rating" class="form-label">Rating</label>
                                <input type="text" id="rating" v-model="rating" required class="form-control"/>
                            </div>
                            <div>
                                <label for="ticket_price" class="form-label">Ticket Price</label>
                                <input type="number" id="ticket_price" v-model="ticket_price" required class="form-control"/>
                            </div>
                            <div>
                                <label for="tags" class="form-label">Tags</label>
                                <select id="tags" name="tags" multiple v-model="selected_tags" class="form-select">
                                    <option v-for="tag in tags" :value="tag.id">{{ tag.name }}</option>
                                </select>
                            </div>
                            <button class="btn btn-primary btn-lg submit" type="submit">Create</button>
                        </form>
                    </div>
                    <div class="col-lg-4"></div>
                </div>
              `,
    
    data() {
        return {
            name: '',
            rating: '',
            ticket_price: null,
            tags: [],
            selected_tags: [],
            error: ''
        }
    },
    
    methods: {
        create_show() {
            fetch('/api/shows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: this.name,
                    rating: this.rating,
                    ticket_price: this.ticket_price,
                    tags: this.selected_tags,
                    theatres: this.selected_theatres
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
        }
    },

    mounted() {
        this.fetchTags();
    }
})

export default CreateShow;