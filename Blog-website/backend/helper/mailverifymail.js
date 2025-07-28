const nodemailer = require("nodemailer");

exports.sendVerifyCode = (email, name, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "doraemonarea123987@gmail.com",
      pass: process.env.PASS,
    },
  });
  // console.log(email)
  const mailOptions = {
    from: "doraemonarea123987@gmail.com",
    to: email,
    subject: "ALL Blogs Email Verification Code",
    html: `<div 
      style=
      "max-width:700px;
      margin-bottom:1rem;
      display:flex;
      align-items:center;
      gap:10px;
      font-family:Roboto;
      font-weight:600;
      color:#3b5998"
    >
      <span>
        Action required : Verify Your Email
      </span>
    </div>
    <div
    style=
      "padding:1rem 0;
      border-top:1px solid #e5e5e5;
      border-bottom:1px solid #e5e5e5;
      color:#141823;
      font-size:17px;
      font-family:Roboto"
    >
      <span>
        Hello ${name}
      </span>
      <div 
        style="padding:20px 0"
      >
        <span style="padding:1.5rem 0">
          To Verify your Email, put below code into otp box
        </span>
      </div>
      <a 
        style="width:200px;
        padding:10px 15px;
        background:#4c649b;
        color:#fff;
        text-decoration:none;
        font-weight:600"
      >
        Verification Code: ${code}
      </a>
      <br>
      <div style="padding-top:20px">
        <span style="margin:1.5rem 0;color:#898f9c">
        </span>
      </div>
    </div>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
    }
  });
};
