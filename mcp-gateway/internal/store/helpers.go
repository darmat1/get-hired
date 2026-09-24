package store

import (
	"encoding/json"

	"github.com/jackc/pgx/v5"
)

// isNoRows returns true when err is pgx.ErrNoRows.
func isNoRows(err error) bool {
	return err == pgx.ErrNoRows
}

// marshalJSON converts v to a JSON string for use in $N::jsonb parameters.
func marshalJSON(v any) string {
	if v == nil {
		return "null"
	}
	b, err := json.Marshal(v)
	if err != nil {
		return "null"
	}
	return string(b)
}
