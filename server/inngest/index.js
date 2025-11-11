import { Inngest } from "inngest";
import User from "../models/UserModel.js";

// Create a client to send and receive events

const inngest = new Inngest({ id: "real-time-vehicle-track" });

//Inngest function to save user data to database

const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({ event }) => {
        // Logic to save user data to database
        const {id, first_name, last_name, email_addresses, image_url} = event.data;
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.create(userData);
    }
)

//Inngest function to delete user from database

const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-with-clerk'},
    {event: 'clerk/user.deleted'},
    async ({ event }) => {
        // Logic to delete user data from database
        const {id} = event.data;
        await User.findByIdAndDelete(id);
    }
)

//Inngest function to update user in database

const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({ event }) => {
        // Logic to update user data in database
        const {id, first_name, last_name, email_addresses, image_url} = event.data;
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.findByIdAndUpdate(id, userData);
    }
)

// Create an empty array where we'll export future Inngest functions
const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];

export { inngest, functions };