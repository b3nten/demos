package main

import (
	"fmt"
	"net/http"
	"os"
)

func main() {
	publicDir := env("PUBLIC_DIR", "public")
	port := env("PORT", "8000")
	svr := http.FileServer(http.Dir(publicDir))
	fmt.Println("Serving", publicDir, "on port", port)
	if err := http.ListenAndServe(":"+port, svr); err != nil {
		panic(err)
	}
}

func env(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
