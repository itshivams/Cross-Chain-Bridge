package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	RelayerPrivateKey string
	ChainAWsUrl       string
	ChainBWsUrl       string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found or couldn't load.")
	}
	return &Config{
		RelayerPrivateKey: os.Getenv("RELAYER_PRIVATE_KEY"),
		ChainAWsUrl:       os.Getenv("CHAIN_A_WS_URL"),
		ChainBWsUrl:       os.Getenv("CHAIN_B_WS_URL"),
	}
}
