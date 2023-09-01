import Login from "../components/login.js";
import Signup from "../components/signup.js";
import Messages from "../components/messages.js";
import Home from "../components/home.js";
import About from "../components/about.js";
import BookedShows from "../components/booked_shows.js";
import CreateTheatre from "../components/create_theatre.js";
import CreateShow from "../components/create_show.js";
import CreateTags from "../components/create_tags.js";
import PlayShow from "../components/play_show.js";
import Running from "../components/running.js";
import Theatres from "../components/theatres.js";
import Shows from "../components/shows.js";
import Theatre from "../components/theatre.js";
import Show from "../components/show.js";
import EditTheatre from "../components/edit_theatre.js";
import EditShow from "../components/edit_show.js";
import EditTag from "../components/edit_tag.js";
import store from "./store.js";

const routes = [
    {
        path: "/signup",
        component: Signup
    },
    {
        path: "/login",
        component: Login,
    },
    {
        path: "/",
        component: Home,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: "/messages",
        component: Messages,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: "/about",
        component: About,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: "/booked_shows",
        component: BookedShows,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: "/createtheatre",
        component: CreateTheatre,
        meta: {
            requiresAdmin: true,
            requiresAuth: true
        }
    },
    {
        path: "/createshow",
        component: CreateShow,
        meta: {
            requiresAdmin: true,
            requiresAuth: true
        }
    },
    {
        path: "/createtags",
        component: CreateTags,
        meta: {
            requiresAdmin: true,
            requiresAuth: true
        }
    },
    {
        path: "/play/:id",
        component: PlayShow,
        meta: {
            requiresAdmin: true,
            requiresAuth: true
        }
    },
    {
        path: "/running/:id",
        component: Running,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: "/theatres",
        component: Theatres,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: "/shows",
        component: Shows,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: "/theatre/:id",
        component: Theatre,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: "/show/:id",
        component: Show,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: "/edittheatre/:id",
        component: EditTheatre,
        meta: {
            requiresAdmin: true,
            requiresAuth: true
        }
    },
    {
        path: "/editshow/:id",
        component: EditShow,
        meta: {
            requiresAdmin: true,
            requiresAuth: true
        }
    },
    {
        path: "/edittag/:id",
        component: EditTag,
        meta: {
            requiresAdmin: true,
            requiresAuth: true
        }
    }
];

const router = new VueRouter({
    routes,
});

router.beforeEach((to, from, next) => {
    const isLoggedIn = store.getters.isLoggedIn;
    
    if (to.meta.requiresAuth && !isLoggedIn) {
        next('/login');
    } else if ((to.path === '/login' || to.path === '/signup') && isLoggedIn) {
        next('/');
    } else {
        next();
    }

    if (isLoggedIn) {
        const tier = store.getters.getUser.tier;

        if (to.meta.requiresAdmin && (tier != 2)) {
            next('/');
        } else {
            next();
        }
    }
});

export default router;