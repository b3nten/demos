package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	publicDir := getenv("PUBLIC_DIR", "public")
	port := getenv("PORT", "8001")

	absPublicDir, err := filepath.Abs(publicDir)
	if err != nil {
		log.Fatalf("resolve public dir: %v", err)
	}

	info, err := os.Stat(absPublicDir)
	if err != nil {
		log.Fatalf("public dir not found: %s (%v)", absPublicDir, err)
	}
	if !info.IsDir() {
		log.Fatalf("public path is not a directory: %s", absPublicDir)
	}

	fileServer := http.FileServer(http.Dir(absPublicDir))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join(absPublicDir, filepath.Clean(r.URL.Path))
		if stat, err := os.Stat(path); err == nil && !stat.IsDir() {
			fileServer.ServeHTTP(w, r)
			return
		}
		if stat, err := os.Stat(path); err == nil && stat.IsDir() {
			indexPath := filepath.Join(path, "index.html")
			if _, err := os.Stat(indexPath); err == nil {
				fileServer.ServeHTTP(w, r)
				return
			}
		}

		http.ServeFile(w, r, filepath.Join(absPublicDir, "index.html"))
	})

	addr := ":" + port
	fmt.Printf("Serving %s at http://localhost%s\n", absPublicDir, addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}

func getenv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
