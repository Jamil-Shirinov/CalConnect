import { db } from "./firebase.js";
import { getAllAnnouncements } from "./announcements.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy
} from "firebase/firestore";


/*
 * Helper function:
 * Check that a user ID was provided.
 */
function verifyUser(userId) {
    if (!userId) {
        throw new Error("User ID is required.");
    }
}


/*
 * 1. GET RESIDENT PROFILE
 *
 * Gets the resident's information from users collection.
 * Expected document: users/{userId}
 */
async function getResidentProfile(userId) {
    verifyUser(userId);

    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
        throw new Error("User profile not found.");
    }

    return {
        id: userSnapshot.id,
        ...userSnapshot.data()
    };
}


/*
 * 2. GET RECENT ANNOUNCEMENTS
 *
 * Gets announcements and returns the three most recent ones.
 * Uses getAllAnnouncements() from announcements.js.
 */
async function getRecentAnnouncements() {
    const announcements = await getAllAnnouncements();

    return announcements
        .sort((a, b) => {
            const timeA = a.createdAt ?? 0;
            const timeB = b.createdAt ?? 0;

            return timeB - timeA;
        })
        .slice(0, 3);
}


/*
 * 3. GET UPCOMING MEETINGS
 *
 * Assumed sessions fields:
 * - participants: array containing user IDs
 * - start: timestamp in milliseconds
 *
 * Returns meetings that have not started yet.
 */
async function getUpcomingMeetings(userId) {
    verifyUser(userId);

    const meetingsRef = collection(db, "sessions");

    const q = query(
        meetingsRef,
        where("participants", "array-contains", userId),
        where("start", ">=", Date.now()),
        orderBy("start", "asc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
    }));
}


/*
 * 4. GET RESIDENT FEEDBACK
 *
 * Ben and Ethan's feedback fields:
 * - title
 * - description
 * - category
 * - user
 * - status
 * - isCompleted
 * - createdAt
 * - site
 *
 * The user field stores the resident's user ID,
 * not their name.
 *
 * Returns feedback submitted by the current resident.
 */
async function getResidentFeedback(userId) {
    verifyUser(userId);

    const feedbackRef = collection(db, "feedback");

    const q = query(
        feedbackRef,
        where("user", "==", userId),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
    }));
}


/*
 * 5. GET RESIDENT BOOKINGS
 *
 * Lucas and Anthony's booking fields:
 * - reservedSpot
 * - description
 * - createdAt
 * - site
 * - user
 * - checkIn
 * - checkOut
 * - approved
 *
 * This function only READS bookings.
 * It does not create, update, approve, or cancel them.
 */
async function getUpcomingBookings(userId) {
    verifyUser(userId);

    const bookingsRef = collection(db, "bookings");

    const q = query(
        bookingsRef,
        where("user", "==", userId),
        where("checkOut", ">=", Date.now()),
        orderBy("checkOut", "asc")
    );

    const snapshot = await getDocs(q);

    const bookings = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
    }));

    // Display bookings by check-in time.
    bookings.sort((a, b) =>
        a.checkIn - b.checkIn
    );

    return bookings;
}


/*
 * 6. GET COMPLETE RESIDENT DASHBOARD
 *
 * Combines all the information needed for the home page:
 * - Resident profile
 * - Recent announcements
 * - Upcoming meetings
 * - Resident feedback
 * - Upcoming bookings
 */
async function getResidentDashboard(userId) {
    verifyUser(userId);

    const [
        profile,
        announcements,
        meetings,
        feedback,
        bookings
    ] = await Promise.all([
        getResidentProfile(userId),
        getRecentAnnouncements(),
        getUpcomingMeetings(userId),
        getResidentFeedback(userId),
        getUpcomingBookings(userId)
    ]);

    return {
        profile: profile,

        // Greeting and resident information
        name: profile.name,
        residentAdmin: profile.residentAdmin,

        // Home page sections
        announcements: announcements,
        meetings: meetings,
        feedback: feedback,
        bookings: bookings
    };
}


/*
 * Export dashboard functions.
 */
export {
    getResidentProfile,
    getRecentAnnouncements,
    getUpcomingMeetings,
    getResidentFeedback,
    getUpcomingBookings,
    getResidentDashboard
};