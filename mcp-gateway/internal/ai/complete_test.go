package ai

import (
	"context"
	"errors"
	"testing"
	"time"
)

type fakeProvider struct {
	id    string
	err   error
	calls int
}

func (f *fakeProvider) ID() string { return f.id }
func (f *fakeProvider) Complete(ctx context.Context, key string, r Request) (Response, error) {
	f.calls++
	if f.err != nil {
		return Response{}, f.err
	}
	return Response{Content: "ok from " + f.id}, nil
}

func TestFreeQuotaWindow(t *testing.T) {
	now := time.Now()
	old := now.Add(-8 * 24 * time.Hour)
	recent := now.Add(-1 * time.Hour)
	if FreeQuotaCount(7, &old, now) != 0 {
		t.Fatal("window older than 7 days must reset")
	}
	if FreeQuotaCount(7, &recent, now) != 7 {
		t.Fatal("recent usage must count")
	}
	if FreeQuotaCount(3, nil, now) != 3 {
		t.Fatal("nil last usage keeps the stored count, same as TS")
	}
}

func TestFallbackToNextProvider(t *testing.T) {
	a := &fakeProvider{id: "openrouter", err: errors.New("boom")}
	b := &fakeProvider{id: "gemini"}
	c := &Client{Providers: []Provider{a, b}, ServerKeys: map[string]string{"openrouter": "k", "gemini": "k"}}
	res, err := c.Complete(context.Background(), Request{UserPrompt: "hi"}, "")
	if err != nil || res.Content != "ok from gemini" || a.calls != 1 {
		t.Fatalf("res=%+v err=%v", res, err)
	}
}

func TestOrderOverride(t *testing.T) {
	a := &fakeProvider{id: "openrouter"}
	b := &fakeProvider{id: "gemini"}
	c := &Client{Providers: []Provider{a, b}, Order: []string{"gemini", "openrouter"}, ServerKeys: map[string]string{"openrouter": "k", "gemini": "k"}}
	res, _ := c.Complete(context.Background(), Request{UserPrompt: "hi"}, "")
	if res.Content != "ok from gemini" || a.calls != 0 {
		t.Fatalf("order ignored: %+v", res)
	}
}
