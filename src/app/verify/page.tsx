"use client";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { app } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";

/**
 * JobDhari Account Verification Page
 * Handles both Email & Phone verification logic.
 * Designed to be easily extendable for WhatsApp or SMS OTP.
 */

export default function VerifyPage() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ✅ Load Auth user + Firestore data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      setEmailVerified(currentUser.emailVerified);

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setPhoneVerified(data.phoneVerified || false);
          setPhone(data.phone || "");
        }
      } catch (err) {
        console.error("Error fetching user doc:", err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db, router]);

  // ✅ Send email verification again
  const handleResendEmail = async () => {
    if (!user) return;
    try {
      await sendEmailVerification(user);
      setMessage("📧 Verification email sent again. Please check your inbox.");
    } catch (err: any) {
      console.error("Error sending email:", err);
      setMessage("Error sending email verification. Try again later.");
    }
  };

  // ✅ Placeholder for phone OTP sending
  const handleSendOTP = async () => {
    if (!phone) {
      setMessage("⚠️ Please enter your phone number first.");
      return;
    }

    try {
      // Step 2 integration (Meta/Twilio) will replace this section
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("📩 OTP sent successfully! Check your WhatsApp or SMS.");
      } else {
        setMessage("❌ Failed to send OTP. Please try again later.");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setMessage("❌ Error sending OTP. Please try again.");
    }
  };

  // ✅ Placeholder for verifying OTP
  const handleVerifyOTP = async () => {
    if (!otp) {
      setMessage("Please enter the OTP received on your phone.");
      return;
    }

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();
      if (data.success) {
        // Mark phone verified in Firestore
        if (user) {
          await updateDoc(doc(db, "users", user.uid), { phoneVerified: true });
        }
        setPhoneVerified(true);
        setMessage("✅ Phone number verified successfully!");
      } else {
        setMessage("❌ Invalid or expired OTP.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setMessage("❌ Failed to verify OTP. Try again.");
    }
  };

  // ✅ Auto redirect once fully verified
  useEffect(() => {
    if (!loading && emailVerified && phoneVerified) {
      // We’ll later redirect based on user.role
      setTimeout(() => router.push("/dashboard"), 1200);
    }
  }, [emailVerified, phoneVerified, loading, router]);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <p>Loading your account details...</p>
      </div>
    );

  return (
    <div
      style={{
        maxWidth: 450,
        margin: "60px auto",
        background: "#fff",
        borderRadius: "12px",
        padding: "30px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Account Verification</h2>

      {!emailVerified && (
        <div style={{ marginBottom: "25px" }}>
          <p>Your email is not verified yet.</p>
          <button
            onClick={handleResendEmail}
            style={{
              background: "#e86100",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Resend Verification Email
          </button>
        </div>
      )}

      {!phoneVerified && (
        <div style={{ marginBottom: "25px" }}>
          <p>Verify your phone number:</p>
          <input
            type="tel"
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={handleSendOTP}
            style={{
              background: "#007bff",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "5px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Send OTP
          </button>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              margin: "10px 0",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={handleVerifyOTP}
            style={{
              background: "#28a745",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Verify OTP
          </button>
        </div>
      )}

      {emailVerified && phoneVerified && (
        <p style={{ color: "green", fontWeight: 600 }}>
          ✅ All verifications complete! Redirecting...
        </p>
      )}

      {message && <p style={{ color: "blue", marginTop: "20px" }}>{message}</p>}
    </div>
  );
}
