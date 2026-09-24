// PARITY: src/app/api/agent/v1/templates/route.ts, src/app/api/agent/mcp/route.ts — keep in sync, see mcp-gateway/PARITY.md
package store

// Templates returns the list of available resume templates.
// Mirrors the TEMPLATES constant in the TS route — keep in sync.
func Templates() []map[string]any {
	return []map[string]any{
		{"id": "professional", "name": "Classic", "atsReady": true},
		{"id": "modern", "name": "Modern", "atsReady": false},
		{"id": "corporate", "name": "Corporate", "atsReady": false},
		{"id": "divider", "name": "Divider", "atsReady": true},
		{"id": "timeline", "name": "Timeline", "atsReady": false},
		{"id": "modular", "name": "Modular", "atsReady": true},
		{"id": "contrast", "name": "Contrast", "atsReady": false},
		{"id": "banner", "name": "Banner", "atsReady": false},
		{"id": "centered", "name": "Centered", "atsReady": false},
		{"id": "tinted", "name": "Tinted", "atsReady": false},
		{"id": "boxed", "name": "Boxed", "atsReady": false},
		{"id": "symmetry", "name": "Symmetry", "atsReady": true},
		{"id": "cards", "name": "Cards", "atsReady": true},
		{"id": "layered", "name": "Layered", "atsReady": false},
		{"id": "portrait", "name": "Portrait", "atsReady": true},
		{"id": "bold", "name": "Bold", "atsReady": false},
		{"id": "framed", "name": "Framed", "atsReady": true},
		{"id": "minimal", "name": "Minimalist", "atsReady": false},
		{"id": "creative", "name": "Creative", "atsReady": false},
	}
}
