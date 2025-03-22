// controllers/emailController.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBuyerFollowUpEmail = async (buyer, purchase, item) => {
  const meetingDetails = purchase.meetingDetails?.time 
    ? `Scheduled Meetup Date & Time: ${new Date(purchase.meetingDetails.time).toLocaleString()}`
    : "Scheduled Meetup Date & Time: Not yet scheduled - please coordinate with the seller";

  const email = {
    from: process.env.EMAIL_USER,
    to: buyer.email,
    subject: 'Your Order has been Confirmed! Thank You for Your Purchase!',
    text: `
Hi ${buyer.username},

Thank you for shopping with Spawn! Your payment has been securely processed through our escrow system powered by Paystack. Your funds will remain in escrow until you confirm that you are satisfied with your purchase. Please review your order details below:

- Order Number: ${purchase._id}
- Item(s): ${item.title}
- Total Amount: ₦${item.price.toLocaleString()}
- Payment Method: Escrow via Paystack
- Location: ${item.location}
- ${meetingDetails}

**Important Policy Reminders:**
- **Pickup & Inspection Window**: You are required to pick up your item within 48 to 72 hours from the scheduled meetup. During this period, please inspect the item carefully. If you encounter any issues, you must file a complaint within this timeframe.
- **Item Acceptance**: If you are satisfied with your purchase, please confirm your acceptance on our platform. Once confirmed, the escrow funds will be released to the seller.
- **On-App Transactions Only**: All payments and communications must be conducted exclusively through Spawn. Do not arrange any business off-platform.
- **Liability Disclaimer**: Spawn is not liable for any agreements or transactions made outside of our platform. By proceeding, you agree to our Terms & Conditions.

You can track your order status at any time by clicking [here](https://yourapp.com/declutter/purchase/${purchase._id}). If you have any questions or require assistance, please contact our support team at support@spawn.com.

Thank you for choosing Spawn! We look forward to a smooth transaction and hope you enjoy your purchase!

Best regards,
The Spawn Team
    `,
  };

  try {
    await transporter.sendMail(email);
    console.log(`Buyer email sent to ${buyer.email}`);
  } catch (error) {
    console.error(`Failed to send buyer email to ${buyer.email}:`, error.message);
    throw error;
  }
};

const sendSellerNotificationEmail = async (seller, purchase, item, buyer) => {
  const meetingDetails = purchase.meetingDetails?.time 
    ? `Scheduled Meetup Date & Time: ${new Date(purchase.meetingDetails.time).toLocaleString()}`
    : "Scheduled Meetup Date & Time: Not yet scheduled - please coordinate with the buyer";

  const email = {
    from: process.env.EMAIL_USER,
    to: seller.email,
    subject: 'New Order Received – Action Required!',
    text: `
    Hi ${seller.username},
    
    Great news! A customer has purchased your product(s) listed on Spawn. Please review the order details below:
    
    - Order Number: ${purchase._id}
    - Item Sold: ${item.title}
    - Buyer’s Name: ${buyer.username}
    - Payment Method: Escrow via Paystack (Funds will be released only after the buyer confirms acceptance)
    - ${meetingDetails}
    - Scheduled Meetup Location: ${item.location}
    
    **Important Policy Reminders:**
    - **Pickup & Inspection Window**: The buyer must pick up the item within 48 to 72 hours from the scheduled meetup. During this period, they will inspect the item and report any issues.
    - **Item Acceptance & Escrow Release**: If the buyer confirms that the item meets their expectations within the inspection period, the funds will be released from escrow to you. In case of any issues, the buyer must file a complaint through our platform.
    - **On-App Transactions Only**: All communications and transactions must be handled through the app. Arrangements made off-platform are not permitted.
    - **Liability Disclaimer**: Spawn is not liable for any transactions or agreements made outside our platform. By accepting this order, you agree to our Terms & Conditions.
    
    Please prepare the item for the scheduled meetup. You can manage your orders and update the status by logging into your seller dashboard [here](https://yourapp.com/declutter/manage-items). If you have any questions, our seller support team is available at support@spawn.com.
    
    Thank you for partnering with Spawn. We look forward to a secure and successful transaction!
    
    Best regards,
    The Spawn Team
        `,
  };

  try {
    await transporter.sendMail(email);
    console.log(`Seller email sent to ${seller.email}`);
  } catch (error) {
    console.error(`Failed to send seller email to ${seller.email}:`, error.message);
    throw error;
  }
};

module.exports = { sendBuyerFollowUpEmail, sendSellerNotificationEmail };