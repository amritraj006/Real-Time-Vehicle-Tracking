// inngest/index.js
// --------------------------------------------------
// Inngest background functions triggered by Clerk webhooks.
// These sync user data between Clerk and MongoDB.
//
// On data change → invalidate related Redis caches
// so the next request always gets fresh data.
// --------------------------------------------------

import { Inngest } from "inngest";
import User from "../models/UserModel.js";
import Vehicle from "../models/VehicleModel.js";
import { deleteCache } from "../config/redis.js";

const inngest = new Inngest({ id: "real-time-vehicle-track" });

// ─── User Created ─────────────────────────────────
// Triggered when a new user signs up via Clerk
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    await User.create({
      _id:   id,
      email: email_addresses[0].email_address,
      name:  `${first_name} ${last_name}`,
      image: image_url,
    });

    // New user added — invalidate user list and dashboard stats
    await deleteCache("cache:users:all", "cache:dashboard:stats");
  }
);

// ─── User Deleted ─────────────────────────────────
// Triggered when a user is deleted in Clerk
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;

    // Delete all vehicles for this user, then delete the user
    await Vehicle.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);

    // Invalidate all caches that reference this user
    await deleteCache(
      "cache:users:all",
      "cache:dashboard:stats",
      `cache:vehicles:user:${id}`,
      "cache:vehicles:active"
    );
  }
);

// ─── User Updated ─────────────────────────────────
// Triggered when a user updates their profile in Clerk
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    await User.findByIdAndUpdate(id, {
      email: email_addresses[0].email_address,
      name:  `${first_name} ${last_name}`,
      image: image_url,
    });

    // User data changed — invalidate user list cache
    await deleteCache("cache:users:all");
  }
);

const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];

export { inngest, functions };