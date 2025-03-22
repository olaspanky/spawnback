// // controllers/emailController.js
// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const sendBuyerFollowUpEmail = async (buyer, purchase, item) => {
//   const meetingDetails = purchase.meetingDetails?.time 
//     ? `Scheduled Meetup Date & Time: ${new Date(purchase.meetingDetails.time).toLocaleString()}`
//     : "Scheduled Meetup Date & Time: Not yet scheduled - please coordinate with the seller";

//   const email = {
//     from: process.env.EMAIL_USER,
//     to: buyer.email,
//     subject: 'Your Order has been Confirmed! Thank You for Your Purchase!',
//     text: `
// Hi ${buyer.username},

// Thank you for shopping with Spawn! Your payment has been securely processed through our escrow system powered by Paystack. Your funds will remain in escrow until you confirm that you are satisfied with your purchase. Please review your order details below:

// - Order Number: ${purchase._id}
// - Item(s): ${item.title}
// - Total Amount: ₦${item.price.toLocaleString()}
// - Payment Method: Escrow via Paystack
// - Location: ${item.location}
// - ${meetingDetails}

// **Important Policy Reminders:**
// - **Pickup & Inspection Window**: You are required to pick up your item within 48 to 72 hours from the scheduled meetup. During this period, please inspect the item carefully. If you encounter any issues, you must file a complaint within this timeframe.
// - **Item Acceptance**: If you are satisfied with your purchase, please confirm your acceptance on our platform. Once confirmed, the escrow funds will be released to the seller.
// - **On-App Transactions Only**: All payments and communications must be conducted exclusively through Spawn. Do not arrange any business off-platform.
// - **Liability Disclaimer**: Spawn is not liable for any agreements or transactions made outside of our platform. By proceeding, you agree to our Terms & Conditions.

// You can track your order status at any time by clicking [here](https://spawn-nine.vercel.app/declutter/purchase/${purchase._id}). If you have any questions or require assistance, please contact our support team at support@spawn.com.

// Thank you for choosing Spawn! We look forward to a smooth transaction and hope you enjoy your purchase!

// Best regards,
// The Spawn Team
//     `,
//   };

//   try {
//     await transporter.sendMail(email);
//     console.log(`Buyer email sent to ${buyer.email}`);
//   } catch (error) {
//     console.error(`Failed to send buyer email to ${buyer.email}:`, error.message);
//     throw error;
//   }
// };

// const sendSellerNotificationEmail = async (seller, purchase, item, buyer) => {
//   const meetingDetails = purchase.meetingDetails?.time 
//     ? `Scheduled Meetup Date & Time: ${new Date(purchase.meetingDetails.time).toLocaleString()}`
//     : "Scheduled Meetup Date & Time: Not yet scheduled - please coordinate with the buyer";

//   const email = {
//     from: process.env.EMAIL_USER,
//     to: seller.email,
//     subject: 'New Order Received – Action Required!',
//     text: `
//     Hi ${seller.username},
    
//     Great news! A customer has purchased your product(s) listed on Spawn. Please review the order details below:
    
//     - Order Number: ${purchase._id}
//     - Item Sold: ${item.title}
//     - Buyer’s Name: ${buyer.username}
//     - Payment Method: Escrow via Paystack (Funds will be released only after the buyer confirms acceptance)
//     - ${meetingDetails}
//     - Scheduled Meetup Location: ${item.location}
    
//     **Important Policy Reminders:**
//     - **Pickup & Inspection Window**: The buyer must pick up the item within 48 to 72 hours from the scheduled meetup. During this period, they will inspect the item and report any issues.
//     - **Item Acceptance & Escrow Release**: If the buyer confirms that the item meets their expectations within the inspection period, the funds will be released from escrow to you. In case of any issues, the buyer must file a complaint through our platform.
//     - **On-App Transactions Only**: All communications and transactions must be handled through the app. Arrangements made off-platform are not permitted.
//     - **Liability Disclaimer**: Spawn is not liable for any transactions or agreements made outside our platform. By accepting this order, you agree to our Terms & Conditions.
    
//     Please prepare the item for the scheduled meetup. You can manage your orders and update the status by logging into your seller dashboard [here](https://spawn-nine.vercel.app/declutter/manage-items). If you have any questions, our seller support team is available at support@spawn.com.
    
//     Thank you for partnering with Spawn. We look forward to a secure and successful transaction!
    
//     Best regards,
//     The Spawn Team
//         `,
//   };

//   try {
//     await transporter.sendMail(email);
//     console.log(`Seller email sent to ${seller.email}`);
//   } catch (error) {
//     console.error(`Failed to send seller email to ${seller.email}:`, error.message);
//     throw error;
//   }
// };

// module.exports = { sendBuyerFollowUpEmail, sendSellerNotificationEmail };

// controllers/emailController.js
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