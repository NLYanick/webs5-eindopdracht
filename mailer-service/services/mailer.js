const { BrevoClient, BrevoError } = require("@getbrevo/brevo");

const client = new BrevoClient({
    apiKey: process.env.MAILER_API_KEY,
    timeoutInSeconds: 30
});

function handleError(error) {
    if (error instanceof BrevoError) {
        console.error(`API error ${error.statusCode}:`, error.message);
    } else {
        console.error('Unexpected error:', error);
    }
    throw error;
}

async function sendEmail(emails, subject, htmlContent) {
    try {
        const to = Array.isArray(emails)
            ? emails.map(email => ({ email }))
            : [{ email: emails }];

        await client.transactionalEmails.sendTransacEmail({
            subject: subject,
            sender: { name: "WEBS5 Eindopdracht", email: process.env.SENDER_EMAIL },
            to,
            htmlContent,
            textContent: htmlContent.replace(/<[^>]+>/g, '') // Strip HTML tags for text content
        });
    } catch (error) {
        handleError(error);
    } 
}

async function sendGreetingEmail(email,username) {
    try {
        await sendEmail(email, "Welcome",
            ` <html> 
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;"> 
                <div style="text-align: center; padding-top: 30px;">
                    <h1 padding: 15px 0;">Welcome</h1>
                    <div style="margin-top: 40px;">
                    <p style="margin-bottom: 30px">Welcome to WEBS5 Eindopdracht, ${username}! Great to have you on board.</p>
                    <p style="margin-bottom: 30px">We hope you enjoy using our platform and find it useful for your needs.</p>
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
        await sendEmail(email, "Score Calculated",
            ` <html> 
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;"> 
                <div style="text-align: center; padding-top: 30px;">
                    <h1 padding: 15px 0;">Score calculated</h1>
                    <div style="margin-top: 40px;">
                    <p style="margin-bottom: 30px">Hello ${username}</p>
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
        await sendEmail(emails, "Reminder",
            ` <html> 
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;"> 
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

module.exports = {sendGreetingEmail, sendScoreEmail, sendReminderEmails}