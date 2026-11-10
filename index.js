import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import sgMail from "@sendgrid/mail";

initializeApp();
const db = getFirestore();

export const sendAnnouncementEmail = onDocumentCreated(
  {
    document: "announcements/{announcementId}",
    secrets: ["SENDGRID_API_KEY"],
  },
  async (event) => {
    // Set SendGrid API key inside the handler where the secret is accessible
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }
    const data = snapshot.data();

    // Check if email dispatch was requested
    if (!data.sendEmail || !data.recipientId) {
      console.log("Email dispatch not requested for this announcement.");
      return;
    }

    try {
      // 1. Fetch the recipient student's email from the /users/{recipientId} collection
      const userDoc = await db.collection("users").doc(data.recipientId).get();
      if (!userDoc.exists) {
        console.error(`Recipient user ID ${data.recipientId} not found in Firestore.`);
        return;
      }

      const recipientEmail = userDoc.data().email;
      if (!recipientEmail) {
        console.error(`User ${data.recipientId} does not have an 'email' field.`);
        return;
      }

      // 2. Build & send email
      const msg = {
        to: recipientEmail,
        from: "no-reply@calconnect.app", // Ensure this sender is verified in SendGrid
        subject: `[CalConnect] ${data.title}`,
        text: data.description,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #0d9488;">New Announcement from CalConnect</h2>
            <h3>${data.title}</h3>
            <p>${data.description}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;"/>
            <p style="font-size: 12px; color: #666;">
              Category: ${data.category} | Site: ${data.site}
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`Successfully sent SendGrid announcement email to ${recipientEmail}`);
    } catch (error) {
      console.error("Error sending email via SendGrid:", error);
    }
  }
);