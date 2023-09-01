import router from "../js/router.js";

const CreateTheatre = Vue.component("create_theatre", {
    template: `
                <div class="row">
                    <div class="col-lg-4"></div>
                    <div class="form-wrapper col-lg-4">
                        <label class="error" v-if="error">{{ error }}</label>
                        <h2 class="title">Create Theatre</h2>
                        <form class="form" @submit.prevent="create_theatre">
                            <div>
                                <label for="name" class="form-label">Name</label>
                                <input type="text" id="name" v-model="name" required class="form-control"/>
                            </div>
                            <div>
                                <label for="place" class="form-label">Address</label>
                                <input type="text" id="place" v-model="place" required class="form-control"/>
                            </div>
                            <div>
                                <label for="capacity" class="form-label">Capacity</label>
                                <input type="number" id="capacity" v-model="capacity" required class="form-control"/>
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
            place: '',
            capacity: null,
            error: ''
        }
    },
    
    methods: {
        create_theatre() {
            fetch('/api/theatres', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: this.name,
                    place: this.place,
                    capacity: this.capacity
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
                }
            })
            .catch(error => {
                this.error = error;
            });
        },
    }
})

export default CreateTheatre;