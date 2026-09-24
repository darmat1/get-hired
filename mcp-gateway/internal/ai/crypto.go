package ai

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/hex"
	"errors"
	"strings"
)

// Decrypt decrypts a string previously encrypted with AES-256-GCM.
func Decrypt(data, hexKey string) (string, error) {
	if len(hexKey) != 64 {
		return "", errors.New("ENCRYPTION_KEY must be a 64-character hex string")
	}

	key, err := hex.DecodeString(hexKey)
	if err != nil {
		return "", err
	}

	parts := strings.Split(data, ":")
	if len(parts) != 3 {
		return "", errors.New("Invalid encrypted data format")
	}

	iv, err := hex.DecodeString(parts[0])
	if err != nil {
		return "", err
	}

	authTag, err := hex.DecodeString(parts[1])
	if err != nil {
		return "", err
	}

	ciphertext, err := hex.DecodeString(parts[2])
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesgcm, err := cipher.NewGCMWithNonceSize(block, 16)
	if err != nil {
		return "", err
	}

	// Go's gcm.Open expects the ciphertext and auth tag to be concatenated: ciphertext || tag
	ciphertextWithTag := append(ciphertext, authTag...)

	plaintext, err := aesgcm.Open(nil, iv, ciphertextWithTag, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}
