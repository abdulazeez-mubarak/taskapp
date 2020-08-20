const sgMail = require ('@sendgrid/mail')



sgMail.setApiKey(process.env.SENDGRID_API_KEY)
 

const sendWelcomeEmail = (email, name) => {
sgMail.send({
    to: email,
    from: 'obaadword@gmail.com',
    subject: 'Welcome to Oba Task App!',
    text: 'We are glad you are here ${name}. Welcome to our family'
}) 
}

const sendCancellationEmail = (email, name) => {
    sgMail.send ({
        to: email, 
        from: 'obaadword@gmail.com', 
        subject: 'Subject', 
        text: 'test'

    })
}

sgMail.send ({
    to: 'obaadword@gmail.com', 
    from: 'obaadword@gmail.com', 
    subject: 'Subject', 
    text: 'We are not glad about it. Thanks for your awesome time with us'

})

module.exports = { 
    sendWelcomeEmail,
    sendCancellationEmail
}