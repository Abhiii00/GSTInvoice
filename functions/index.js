const admin = require("firebase-admin");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore"); // ✅ Use v2 functions

// Initialize Firebase Admin SDK
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gstinvoicesystem-6c5ed.firebaseio.com",
});

const db = admin.firestore();

// ✅ Correct Firestore Trigger Syntax for v2 Functions
exports.onBookingStatusChange = onDocumentUpdated("bookings/{bookingId}", async (event) => {
  const newValue = event.data.after.data();
  const previousValue = event.data.before.data();

  console.log(`Previous Status: ${previousValue.status}`);
  console.log(`New Status: ${newValue.status}`);

  if (previousValue.status !== "finished" && newValue.status === "finished") {
    console.log(`Generating invoice for Booking ID: ${event.params.bookingId}`);

    const totalAmount = newValue.totalBookingAmount;
    const gstRate = 18; // Example: 18% GST
    const gstAmount = (totalAmount * gstRate) / 100;
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;

    try {
      await db.collection("invoices").doc(event.params.bookingId).set({
        name: newValue.name,
        totalAmount: totalAmount,
        gstAmount: gstAmount,
        cgst: cgst,
        sgst: sgst,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("✅ Invoice stored successfully!");
    } catch (error) {
      console.error("❌ Error saving invoice:", error);
    }
  }
});
