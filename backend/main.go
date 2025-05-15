package main

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

const (
	uploadPath = "uploads"
	outputPath = "outputs"
	downloadPath = "/tmp"
)

func main() {
	ensurePaths()

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:  []string{"*"},
		AllowMethods:  []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:  []string{"Origin", "Content-Type", "Accept"},
	}))

  router.GET("/", func(c *gin.Context) {
	c.String(http.StatusOK, "Welcome to the Video to Audio Converter API")
})

// Static file serving
router.Static("/outputs", outputPath)
router.Static("/download", downloadPath)

// API Routes
router.POST("/convert", handleConvert)
router.POST("/upload", handleUpload) 

// listen and serve on 0.0.0.0:5000
router.Run(":5000") 
}

func ensurePaths() {
	for _, path := range []string{uploadPath, outputPath} {
		if _, err :=os.Stat(path); os.IsNotExist(err) {
			_ = os.MkdirAll(path, os.ModePerm)
		}
	}
}

func sanitizeFileName(name string) string {
	re := regexp.MustCompile(`[<>:"/\\|?*]`)
	safe := re.ReplaceAllString(name, "")
	return safe
}

func handleConvert(c *gin.Context) {
	var request struct {
		VideoUrl string `json:"videoUrl"`
	}
	if err := c.BindJSON(&request); err != nil || request.VideoUrl == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Video URL"})
		return
	}

	titleCmd := exec.Command("yt-dlp", "--get-title", request.VideoUrl)
	titleOutput, err := titleCmd.Output()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch video title"})
		return
	}
	
	title := sanitizeFileName(string(titleOutput)) // Remove bad characters
	
	// inputFile := filepath.Join(uploadPath, request.VideoUrl)
	outputFile := filepath.Join(downloadPath, fmt.Sprintf("%s.mp3", title))

	cmd := exec.Command("yt-dlp", "-x", "--audio-format", "mp3", "-o", outputPath, request.VideoUrl)
	output, err := cmd.CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Download/Conversion failed", "details": string(output)})
		return
	}

	finalPath := filepath.Join(downloadPath, title+".mp3")
	if _, err := os.Stat(finalPath); os.IsNotExist(err) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Converted MP3 not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Conversion successful", "output": outputFile})
}

func handleUpload(c *gin.Context) {
	file, err := c.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to upload file"})
		return
	}

	inputFile := filepath.Join(uploadPath, file.Filename)
	if err := c.SaveUploadedFile(file, inputFile); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	outputPath := filepath.Join(downloadPath, file.Filename+".mp3")
	cmd := exec.Command("ffmpeg", "-i", inputFile, "-c:a", "libmp3lame", outputPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		_ = os.Remove(inputFile)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to convert video", "details": string(output)})
		return
	}
	_ = os.Remove(inputFile)

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%q", file.Filename+".mp3"))
    c.Header("Content-Type", "application/octet-stream")
	c.JSON(http.StatusOK, gin.H{
		"message": "File uploaded and converted successfully",
		"output": outputPath,
		"download_url": "http://localhost:5000/download/" + file.Filename + ".mp3",
	})	
}