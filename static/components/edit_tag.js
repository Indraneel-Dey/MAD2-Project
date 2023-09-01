import router from "../js/router.js";

const EditTag = Vue.component("edit_tag", {
    template: `
                <div class="row">
                    <div class="col-lg-4"></div>
                    <div class="form-wrapper col-lg-4">
                        <label class="error" v-if="error">{{ error }}</label>
                        <h2 class="title">Edit Tag</h2>
                        <form class="form" @submit.prevent="edit_tag">
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
        async fetchTag() {
            const id = this.$route.params.id
            fetch(`/api/tag/${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.name = data.tag.name;
                    this.error = '';
                } else {
                    this.name = '';
                    this.error = data.message;
                    router.push('/createtags');
                }
            })
            .catch(error => {
                this.error = error;
            });
        },

        async edit_tag() {
            const id = this.$route.params.id
            fetch(`/api/tag/${id}`, {
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
                    router.push('/createtags');
                } else {
                    this.error = data.message;
                    router.push('/createtags');
                }
            })
            .catch(error => {
                this.error = error;
            })
        }
    },

    mounted() {
        this.fetchTag();
    }
})

export default EditTag;