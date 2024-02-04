const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "fs3s-mail.sfrd.sdi.local",
  port: 25,
  secure: false,
  tls: { rejectUnauthorized: false },
});

const sender =
  '"Hot Mill Walkthrough" <NoReplyHMWalkthrough@steeldynamics.com>';

module.exports.sendEmail = async (htmlBody, to, subject) => {
  const results = await transporter.sendMail({
    from: sender,
    to: to,
    subject: subject,
    html: htmlBody,
  });
  if (results.accepted) {
    console.log("Email sent successfully");
    return true;
  } else if (results.rejected) {
    console.log(
      "The following email address(es) were rejected: ",
      results.rejected
    );
    return false;
  } else if (results.pending) {
    console.log(
      "The following email address(es) is busy and pending: ",
      results.pending
    );
    return false;
  }
  console.log("For some reason an email was not sent and reached end of sendEmail.js")
  return false;
};
