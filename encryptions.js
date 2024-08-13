const crypto = require('crypto');

class Encryption {
    /// Make the encryption class singleton, so no multiple keys will be generated.
    constructor() {
        if(!Encryption.instance) {
            this.serverPublicKey = null;
            this.serverPrivateKey = null;
            this.sharedSecret = null;
            this.generateKeyPair();
            Encryption.instance = this;
        }
        return Encryption.instance;
    }

    /// Generates a keypair using Elliptic Curve algorithm
    generateKeyPair() {
        if (!this.serverPrivateKey && !this.serverPublicKey) {
            const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
                namedCurve: 'prime256v1' // This is the equivalent of ECGenParameterSpec("prime256v1")
            });

            this.serverPublicKey = publicKey;
            this.serverPrivateKey = privateKey;

            console.log('Keypair generated:');
            console.log(this.getPublicKey());
        }
    }

    /// Get public key in base64 format
    getPublicKey() {
        if (this.serverPublicKey) {
            return this.serverPublicKey.export({ type: 'spki', format: 'pem' });
        }
        return null;
    }

    /// Makes a secret using the user's public and the server's private key
    makeSecret(userPublicKeyBase64) {
        if (!this.sharedSecret){
            const userPublicKey = crypto.createPublicKey(userPublicKeyBase64);

            this.sharedSecret = crypto.diffieHellman({
                publicKey: userPublicKey,
                privateKey: this.serverPrivateKey
            });
        }
    }

    /// Encrypt message using the shared secret
    encryptMessage(message) {
        if (!this.sharedSecret) {
            throw new Error('There is no shared secret set.');
        }
    
        const iv = crypto.randomBytes(12); // 12 bytes for IV
        const cipher = crypto.createCipheriv('aes-256-gcm', this.sharedSecret.slice(0, 32), iv);
        let encryptedMessage = cipher.update(message, 'utf8', 'base64');
        encryptedMessage += cipher.final('base64');
        const tag = cipher.getAuthTag(); // Get the authentication tag
    
        // Combine IV, encrypted message, and tag into a single buffer
        const result = Buffer.concat([
            iv,
            Buffer.from(encryptedMessage, 'base64'),
            tag
        ]);
    
        return result.toString('base64'); // Encode the result as Base64
    }
}

const instance = new Encryption();

module.exports = instance;