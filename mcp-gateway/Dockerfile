# Multi-stage build: compile with the full Go toolchain, ship only the
# static binary + CA certs (needed for the HTTPS calls this makes to
# GETHIRED_BASE_URL). No shell, no package manager, nothing else in the
# final image — smallest possible footprint for a small VPS.

FROM golang:1.25-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /out/mcp-gateway .

FROM scratch
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /out/mcp-gateway /mcp-gateway
USER 65534:65534
EXPOSE 8080
ENTRYPOINT ["/mcp-gateway"]
