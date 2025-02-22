const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const {onBookingStatusChange} = require('./index')

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gstinvoicesystem-6c5ed.firebaseio.com",
});

const db = admin.firestore();

app.put("/update-status/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  
  try {
    console.log(`🔄 Updating status for Booking ID: ${bookingId}`);
    
    await db.collection("bookings").doc(bookingId).update({
      status: "finished",
    });

    console.log(`✅ Booking ${bookingId} updated successfully.`);
    res.status(200).json({ message: `Booking ${bookingId} updated successfully.` });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Error updating status: " + error.message });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
