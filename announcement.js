import { db } from "./firebase.js";

import {
  ref,
  push,
  set,
  get,
  remove
} from "firebase/database";


async function createAnnouncement(
  title,
  description,
  category,
  userId,
  site,
  adminOnly
) {
  const announcementsRef = ref(db, "announcements");

  const newAnnouncementRef = push(announcementsRef);

  const announcement = {
    id: newAnnouncementRef.key,
    title: title,
    description: description,
    category: category,
    userId: userId,
    createdAt: Date.now(),
    site: site,
    adminOnly: adminOnly
  };

  await set(newAnnouncementRef, announcement);

  return announcement;
}


async function getAllAnnouncements() {
  const announcementsRef = ref(db, "announcements");

  const snapshot = await get(announcementsRef);

  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.val();

  const announcements = Object.values(data);


  announcements.sort(
    (a, b) => b.createdAt - a.createdAt
  );

  return announcements;
}



async function deleteAnnouncement(id) {
  const announcementRef = ref(
    db,
    `announcements/${id}`
  );

  await remove(announcementRef);
}


export {
  createAnnouncement,
  getAllAnnouncements,
  deleteAnnouncement
};