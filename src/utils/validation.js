const validator = require("validator");
const sanitizeHtml = require("sanitize-html");
const bcrypt = require("bcryptjs");

const validateSignUpData = (req) => {
  const { name, email, password, googleId } = req.body;
  //console.log(password)
  if (!email || !validator.isEmail(email)) {
    throw new Error("A valid email is required");
  }

  if (!name || name.trim().length < 3) {
    throw new Error("Name must be at least 3 characters long");
  }

  // If this is NOT a Google signup, we must validate password
  if (!googleId) {
    if (!password || !validator.isStrongPassword(password)) {
      throw new Error(
        "Password must be strong: at least 8 characters, with uppercase, lowercase, number, and symbol."
      );
    }
  }

  // Sanitize input (optional, if you want to clean before DB insert)
  req.body.name = sanitizeHtml(name.trim());
  req.body.email = email.toLowerCase().trim();
};

const validateLoginData = (req) => {
  const { email, password, googleId } = req.body;

  if (!email || !validator.isEmail(email)) {
    throw new Error("A valid email is required");
  }

  if (!password && !googleId) {
    throw new Error("Either password or Google account is required");
  }

  // Sanitize
  req.body.email = email.toLowerCase().trim();
  if (password) req.body.password = sanitizeHtml(password);
  if (googleId) req.body.googleId = sanitizeHtml(googleId);
};

const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    throw new Error("Token verification failed");
  }
};

const validateEditProfileData = (req) => {
  const allowedFields = ["name", "avatar", "age", "gender"];
  const incomingFields = Object.keys(req.body);

  const isValidUpdate = incomingFields.every((field) =>
    allowedFields.includes(field)
  );

  if (!isValidUpdate) {
    throw new Error("Invalid fields in update request");
  }
};


const validateReview = (req) => {
  const { productId, rating, comment, imageUrl } = req.body;
  //console.log(req.body)
  // Validate productId (MongoDB ObjectId)
  if (!productId || !validator.isMongoId(productId)) {
    throw new Error("Invalid or missing product ID.");
  }

  // Validate rating
  if (
    rating === undefined ||
    typeof rating !== "number" ||
    rating < 1 ||
    rating > 5
  ) {
    throw new Error("Rating must be a number between 1 and 5.");
  }

  // Validate comment (optional)
  if (comment && typeof comment === "string") {
    const trimmedComment = comment.trim();
    if (trimmedComment.length > 1000) {
      throw new Error("Comment must not exceed 1000 characters.");
    }
    req.body.comment = sanitizeHtml(trimmedComment);
  }

  // Validate imageUrl (optional)
  if(imageUrl) {
    if (!Array.isArray(imageUrl)) {
      throw new Error("imageUrl must be an array of URL strings.");
    }
  
    const invalidUrls = imageUrl.filter(
      (url) =>
        typeof url !== "string" ||
        !validator.isURL(url, {
          protocols: ["http", "https"],
          require_protocol: true,
        })
    );
  
    if (invalidUrls.length > 0) {

      throw new Error("One or more image URLs are invalid.");
    }
  console.log("Invalid URLs :  " ,invalidUrls)
    // Trim and sanitize all URLs

  }

  // Sanitize final safe inputs
  req.body.productId = productId;
  req.body.rating = rating;
  req.body.imageUrl = imageUrl.map((url) => url.trim());
  console.log("Final URLs :  ", req.body.imageUrl);
};

const validateReviewEdit = (req) => {
  const { reviewId, rating, comment, imageUrl } = req.body;

  if (!validator.isMongoId(reviewId)) {
    throw new Error("Invalid or missing review ID.");
  }

  // Validate rating
  if (
    rating === undefined ||
    typeof rating !== "number" ||
    rating < 1 ||
    rating > 5
  ) {
    throw new Error("Rating must be a number between 1 and 5.");
  }

  // Validate comment (optional)
  if (comment && typeof comment === "string") {
    const trimmedComment = comment.trim();
    if (trimmedComment.length > 1000) {
      throw new Error("Comment must not exceed 1000 characters.");
    }
    req.body.comment = sanitizeHtml(trimmedComment);
  }

  // Validate imageUrl (optional)
  if (imageUrl) {
    if (!Array.isArray(imageUrl)) {
      throw new Error("imageUrl must be an array of URL strings.");
    }

    const invalidUrls = imageUrl.filter(
      (url) =>
        typeof url !== "string" ||
        !validator.isURL(url, {
          protocols: ["http", "https"],
          require_protocol: true,
        })
    );

    if (invalidUrls.length > 0) {
      throw new Error("One or more image URLs are invalid.");
    }
    console.log("Invalid URLs :  ", invalidUrls);
    // Trim and sanitize all URLs
  }

  // Sanitize final safe inputs
  req.body.rating = rating;
};

module.exports = {
  validateEditProfileData,
  validateLoginData,
  validateSignUpData,
  verifyGoogleToken,
  validateReview,
  validateReviewEdit
};
