import { db } from "./firebase.js";

import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";


const announcementsCol = collection(db, "announcements");


async function createAnnouncement(
  title,
  description,
  category,
  userId,
  site,
  adminOnly
) {
  const newAnnouncementRef = doc(announcementsCol);

  const announcement = {
    id: newAnnouncementRef.id,
    title: title,
    description: description,
    category: category,
    userId: userId,
    createdAt: Date.now(),
    site: site,
    adminOnly: adminOnly
  };

  await setDoc(newAnnouncementRef, announcement);

  return announcement;
}


async function getAllAnnouncements() {
  const q = query(announcementsCol, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => d.data());
}


async function deleteAnnouncement(id) {
  await deleteDoc(doc(announcementsCol, id));
}


export {
  createAnnouncement,
  getAllAnnouncements,
  deleteAnnouncement
};
