package main

import (
	"github.com/myselfshivams/Cross-Chain-Bridge/backend/internal/config"
	"github.com/myselfshivams/Cross-Chain-Bridge/backend/pkg/clients"

	"log"
	"sync"
)

func main() {
	cfg := config.LoadConfig()

	chainAClient := clients.NewEthClientA(cfg.ChainAWsUrl)
	chainBClient := clients.NewEthClientB(cfg.ChainBWsUrl)

	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()

	}()

	log.Println("Relayer started. Listening for events...")
	wg.Wait()
}
