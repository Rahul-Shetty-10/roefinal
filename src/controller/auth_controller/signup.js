const db = require('../../db/db');
const {sendVerificationEmail} = require('../../helper/sendmail');
const jwt = require('jsonwebtoken');

module.exports.signup = async (req, res) => {
    const { Email } = req.body;

    try {
        db.query('SELECT * FROM users WHERE Email = ? and isActive = ?', [Email,true], async (error, results) => {

            if (results.length > 0) {
                return res.render('user/index', { error: 'Email already exist' })
            }
            else {
                // If email does not exist, proceed to create verification token
                const verification_token = jwt.sign({ email: Email }, process.env.JWT_SECRET, {
                    expiresIn: '1h'
                });

                const verificationLink = `https://republicofengineers.com/verify-email?token=${verification_token}`;

                // Send verification email
                sendVerificationEmail(Email, verificationLink, verification_token);

                // Render success message
                return res.render('user/index', { error: `Verification email is sent to ${Email}` });
            }
        });

    } catch (error) {
        console.error('Error checking existing user or sending verification email:', error);
        return res.render('user/error500');
    }
};
