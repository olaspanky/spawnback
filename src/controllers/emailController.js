
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailStyle = `
  <style>
    .container { max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
    .content { padding: 30px; line-height: 1.6; color: #444; }
    .highlight { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .details { border-left: 4px solid #007bff; padding-left: 15px; margin: 20px 0; }
    .button { background-color: #007bff; color: white!important; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 0.9em; color: #666; }
  </style>
`;

const createEmailTemplate = (header, content) => `
  <!DOCTYPE html>
  <html>
  <head>${emailStyle}</head>
  <body>
    <div class="container">
      <div class="header">
        <h2 style="color: #2c3e50; margin: 0;">Spawn Marketplace</h2>
      </div>
      
      <div class="content">
        ${header}
        ${content}
      </div>

      <div class="footer">
        <p>© 2023 Spawn Marketplace. All rights reserved.<br>
        Need help? Contact <a href="mailto:support@spawn.com" style="color: #007bff;">support@spawn.com</a></p>
      </div>
    </div>
  </body>
  </html>
`;

const sendBuyerFollowUpEmail = async (buyer, purchase, item) => {
  const meetingDetails = purchase.meetingDetails?.time 
    ? `<strong>Scheduled Meetup:</strong> ${new Date(purchase.meetingDetails.time).toLocaleString()}`
    : `<strong>Scheduled Meetup:</strong> <span style="color: #dc3545;">Not yet scheduled</span> - please coordinate with the seller`;

  const emailContent = createEmailTemplate(
    `<h3 style="color: #28a745; margin-top: 0;">Order Confirmed! 🎉</h3>`,
    `
      <p>Hi ${buyer.username},</p>
      <p>Thank you for choosing Spawn! Your payment is securely held in escrow via Paystack until you confirm satisfaction.</p>
      
      <div class="details">
        <h4 style="margin-top: 0; color: #2c3e50;">Order Details</h4>
        <p>📦 Order Number: <strong>${purchase._id}</strong></p>
        <p>🛒 Item: ${item.title}</p>
        <p>💵 Total: <strong>₦${item.price.toLocaleString()}</strong></p>
        <p>📍 Location: ${item.location}</p>
        <p>${meetingDetails}</p>
      </div>

      <div class="highlight">
        <h4 style="margin-top: 0; color: #856404;">❗ Important Policies</h4>
        <ul style="padding-left: 20px;">
          <li>48-72 hour inspection window after pickup</li>
          <li>Funds release only after your confirmation</li>
          <li>Strictly on-platform transactions</li>
        </ul>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="https://spawn-nine.vercel.app/declutter/purchase/${purchase._id}" class="button">
          Track Your Order
        </a>
      </p>
    `
  );

  const email = {
    from: process.env.EMAIL_USER,
    to: buyer.email,
    subject: 'Your Spawn Order is Confirmed! 🎉',
    html: emailContent,
  };
  try {
    await transporter.sendMail(email);
    console.log(`Buyer email sent to ${buyer.email}`);
  } catch (error) {
    console.error(`Failed to send buyer email to ${buyer.email}:`, error.message);
    throw error;
  }

  // ... rest of the function remains the same
};

const sendSellerNotificationEmail = async (seller, purchase, item, buyer) => {
  const meetingDetails = purchase.meetingDetails?.time 
    ? `<strong>Scheduled Meetup:</strong> ${new Date(purchase.meetingDetails.time).toLocaleString()}`
    : `<strong>Scheduled Meetup:</strong> <span style="color: #dc3545;">Not yet scheduled</span> - coordinate with buyer`;

  const emailContent = createEmailTemplate(
    `<h3 style="color: #007bff; margin-top: 0;">New Sale! 💰</h3>`,
    `
      <p>Hi ${seller.username},</p>
      <p>Congratulations! Your item has been purchased. Funds will be released after buyer confirmation.</p>
      
      <div class="details">
        <h4 style="margin-top: 0; color: #2c3e50;">Transaction Details</h4>
        <p>📦 Order Number: <strong>${purchase._id}</strong></p>
        <p>🛒 Item Sold: ${item.title}</p>
        <p>👤 Buyer: ${buyer.username}</p>
        <p>📍 Meetup Location: ${item.location}</p>
        <p>${meetingDetails}</p>
      </div>

      <div class="highlight">
        <h4 style="margin-top: 0; color: #856404;">❗ Action Required</h4>
        <ul style="padding-left: 20px;">
          <li>Prepare item for meetup</li>
          <li>Coordinate pickup details</li>
          <li>Complete transaction through app</li>
        </ul>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="https://spawn-nine.vercel.app/declutter/manage-items" class="button">
          Manage Orders
        </a>
      </p>
    `
  );

  const email = {
    from: process.env.EMAIL_USER,
    to: seller.email,
    subject: 'New Sale! Prepare Your Item for Pickup 🚚',
    html: emailContent,
  };

  try {
    await transporter.sendMail(email);
    console.log(`Seller email sent to ${seller.email}`);
  } catch (error) {
    console.error(`Failed to send seller email to ${seller.email}:`, error.message);
    throw error;
  }};

module.exports = { sendBuyerFollowUpEmail, sendSellerNotificationEmail };