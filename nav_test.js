const express = require('express');
const encryptionService = require('./encryptions');

const router = express.Router();
router.use(express.json());

// req: User's public key
// returns: Server's public key
router.post('/activate', (req, res) => {
    try {
        const userPublicKeyBase64 = req.body.publicKey;

        encryptionService.makeSecret(userPublicKeyBase64);

        res.json({
            publicKey: encryptionService.getPublicKey()
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e });
    }
});

router.get('/encrypt', (req, res) => {
    try {
        const encryptedMessage = encryptionService.encryptMessage('Hello, World!');
        res.json({ encryptedMessage });
    } catch(e) {
        console.log(e);
        res.status(500).json({ error: e });
    }
});

module.exports = router;