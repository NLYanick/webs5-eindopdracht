const { BrevoClient, BrevoError } = require("@getbrevo/brevo");

const client = new BrevoClient({
    apiKey: process.env.MAILER_API_KEY,
    timeoutInSeconds: 30
});

const primaryColor = '#242424';
const secondaryColor = '#8e51ff';

function handleError(error) {
  if (error instanceof BrevoError) {
    console.error(`API error ${error.statusCode}:`, error.message);
  } else {
    console.error('Unexpected error:', error);
  }
  throw error;
}

async function sendEmail(emails, htmlContent) {
    try {
        const to = Array.isArray(emails)
            ? emails.map(email => ({ email }))
            : [{ email: emails }];

        await client.transactionalEmails.sendTransacEmail({
            subject: "Reset Your Password",
            sender: { name: "Chat App", email: process.env.SENDER_EMAIL },
            to,
            htmlContent
        });
    } catch (error) {
        handleError(error);
    } 
}

async function sendGreetingEmail(email,username) {
    try {
        await sendEmail(email,
            ` <html> 
                <body style="font-family: Arial, sans-serif; color: white; margin: 0; padding: 0;"> 
                <div style="text-align: center; padding-top: 30px;">
                    <h1 padding: 15px 0;">Welcome</h1>
                    <div style="margin-top: 40px;">
                    <p style="margin-bottom: 30px">Welcome here ${username}</p>
                    </div>
                </div>

                <hr style="height: 2px; border-width: 0; margin-top: 50px; background-color: #8e51ff">
                </body> 
            </html>
            `.trim()
        );
    } catch (error) {
        handleError(error);
    } 
}

async function sendScoreEmail(email,username,score,targetId) {
    try {
        await sendEmail(email,
            ` <html> 
                <body style="font-family: Arial, sans-serif; color: white; margin: 0; padding: 0;"> 
                <div style="text-align: center; padding-top: 30px;">
                    <h1 padding: 15px 0;">Score calculated</h1>
                    <div style="margin-top: 40px;">
                    <p style="margin-bottom: 30px">hello ${username}</p>
                    <p style="margin-bottom: 30px">Your score on the target with id: ${targetId} has been calculated</p>
                    <p style="margin-bottom: 30px">Your score is ${score}</p>
                    </div>
                </div>

                <hr style="height: 2px; border-width: 0; margin-top: 50px; background-color: #8e51ff">
                </body> 
            </html>
            `.trim()
        );
    } catch (error) {
        handleError(error);
    } 
}

async function sendReminderEmails(emails,targetId,timeLeft) {
    try {
        await sendEmail(emails,
            ` <html> 
                <body style="font-family: Arial, sans-serif; color: white; margin: 0; padding: 0;"> 
                <div style="text-align: center; padding-top: 30px;">
                    <h1 padding: 15px 0;">Reminder</h1>
                    <div style="margin-top: 40px;">
                    <p style="margin-bottom: 30px">You have not handed in a submission on the target with id: ${targetId}</p>
                    <p style="margin-bottom: 30px">Your time left is: ${timeLeft}</p>
                    </div>
                </div>

                <hr style="height: 2px; border-width: 0; margin-top: 50px; background-color: #8e51ff">
                </body> 
            </html>
            `.trim()
        );
    } catch (error) {
        handleError(error);
    } 
}

module.exports = {sendGreetingEmail, sendScoreEmail}