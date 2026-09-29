package ai

import "testing"

// Produced by src/lib/encryption.ts logic with fixed IV 000102…0f:
// key 0011…eeff (x2), plaintext "sk-test-123".
const (
	testKey    = "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff"
	testCipher = "000102030405060708090a0b0c0d0e0f:c5dd26555b6d34397bb6aab4f769d110:97eaacedbac45d11945c13"
)

func TestDecryptMatchesNode(t *testing.T) {
	got, err := Decrypt(testCipher, testKey)
	if err != nil || got != "sk-test-123" {
		t.Fatalf("got %q %v", got, err)
	}
}

func TestDecryptErrors(t *testing.T) {
	if _, err := Decrypt(testCipher, "short"); err == nil {
		t.Fatal("want key length error")
	}
	if _, err := Decrypt("a:b", testKey); err == nil {
		t.Fatal("want format error")
	}
	if _, err := Decrypt("000102030405060708090a0b0c0d0e0f:00000000000000000000000000000000:97eaacedbac45d11945c13", testKey); err == nil {
		t.Fatal("want auth tag error")
	}
}
