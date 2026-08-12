const express = require("express");
const path = require("path");
const fs = require("fs");
const { Resend } = require("resend");

const app = express();

const PORT = Number(process.env.PORT || 8080);
const PUBLIC = path.join(__dirname, "public");
const REVIEWS_FILE = path.join(__dirname, "reviews.json");

function readReviews() {
  try {
    if (!fs.existsSync(REVIEWS_FILE)) return [];
    return JSON.parse(
      fs.readFileSync(REVIEWS_FILE, "utf8")
    );
  } catch {
    return [];
  }
}

function writeReviews(items) {
  fs.writeFileSync(
    REVIEWS_FILE,
    JSON.stringify(items.slice(-50), null, 2),
    "utf8"
  );
}

const clean = (value, maxLength) =>
  String(value ?? "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);

app.use(express.json({ limit: "50kb" }));
app.use(express.static(PUBLIC));

/* HEALTH CHECK */
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    emailConfigured: Boolean(process.env.RESEND_API_KEY)
  });
});

/* GET REVIEWS */
app.get("/api/reviews", (req, res) => {
  res.json({
    ok: true,
    reviews: readReviews().reverse()
  });
});

/* POST REVIEW */
app.post("/api/reviews", async (req, res) => {
  const name = clean(req.body.name, 80);
  const email = clean(req.body.email, 160);
  const message = clean(req.body.message, 1200);
  const rating = Number(req.body.rating);

  if (
    !name ||
    !email ||
    !message ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return res.status(400).json({
      ok: false,
      message: "Please complete all fields and choose a 1–5 star rating."
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      ok: false,
      message: "Please enter a valid email address."
    });
  }

  const review = {
    name,
    email,
    rating,
    message,
    date: new Date().toISOString()
  };

  /* SAVE REVIEW FIRST */
  const reviews = readReviews();
  reviews.push(review);
  writeReviews(reviews);

  /* EMAIL NOTIFICATION USING RESEND */
  let emailSent = false;

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "Daniel Ayegba Portfolio <onboarding@resend.dev>",
        to: [
          process.env.REVIEW_TO || "danieljoseph8449@gmail.com"
        ],
        replyTo: email,
        subject: `Portfolio review – ${rating}/5 from ${name}`,
        text:
          `Name: ${name}\n` +
          `Email: ${email}\n` +
          `Rating: ${rating}/5\n\n` +
          `${message}`
      });

      emailSent = true;
      console.log("REVIEW EMAIL SENT SUCCESSFULLY");
    } catch (error) {
      console.error("EMAIL ERROR:", error.message);
    }
  } else {
    console.error("EMAIL ERROR: RESEND_API_KEY is not configured");
  }

  if (emailSent) {
    return res.json({
      ok: true,
      message: "Review sent successfully. It is now displayed below."
    });
  }

  return res.json({
    ok: true,
    message:
      "Review saved successfully. Email notification could not be delivered."
  });
});

/* SERVE PORTFOLIO */
app.use((req, res) => {
  res.sendFile(path.join(PUBLIC, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Daniel Ayegba Portfolio running at http://127.0.0.1:${PORT}`
  );
});
