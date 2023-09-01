const Messages = Vue.component("messages", {
    template: `
                <div>
                    <label class="error" v-if="error">{{ error }}</label>
                    <h3 v-if="message">{{ message }}</h3>
                    <table class="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Message</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="message in messages">
                                <td>{{ message.time }}</td>
                                <td>{{ message.contents }}</td>
                                <td><button class="btn btn-danger btn-sm" @click="delete_message(message.id)">Delete</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
              `,
        
    data() {
        return {
            messages: [],
            message: '',
            error: ''
        }
    },

    methods: {
        async fetchMessages() {
            const id = this.$store.getters.getUser.id;
            fetch(`/api/messages/${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.messages = data.messages;
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

        async delete_message(id) {
            fetch(`/api/messages/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                this.messages = this.messages.filter(message => message.id != id)
                this.message = '';
                this.error = '';
            })
            .catch(error => {
                this.error = error
            })
        }
    },

    mounted() {
        this.fetchMessages();
    }
})

export default Messages;