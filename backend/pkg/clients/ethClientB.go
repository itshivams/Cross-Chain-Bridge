package clients

import (
	"context"
	"log"

	"github.com/ethereum/go-ethereum/ethclient"
)

func NewEthClientB(wsUrl string) *ethclient.Client {
	client, err := ethclient.DialContext(context.Background(), wsUrl)
	if err != nil {
		log.Fatalf("Failed to connect to chain B: %v", err)
	}
	return client
}
