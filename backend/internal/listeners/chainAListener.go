package listeners

import (
	"context"
	"fmt"
	"log"
	"math/big"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/myselfshivams/Cross-Chain-Bridge/backend/internal/services"
)

type ChainAListener struct {
	bridgeService *services.BridgeService
	chainAGateway common.Address
	chainAAbi     abi.ABI
}

func NewChainAListener(
	bridgeService *services.BridgeService,
	chainAGateway common.Address,
	chainAAbi abi.ABI,
) *ChainAListener {
	return &ChainAListener{
		bridgeService: bridgeService,
		chainAGateway: chainAGateway,
		chainAAbi:     chainAAbi,
	}
}

func (l *ChainAListener) StartListening(client ethereum.LogFilterer) {
	query := ethereum.FilterQuery{
		Addresses: []common.Address{l.chainAGateway},
	}

	logs := make(chan types.Log)
	sub, err := client.SubscribeFilterLogs(context.Background(), query, logs)
	if err != nil {
		log.Fatalf("Error subscribing to Chain A logs: %v", err)
	}

	for {
		select {
		case err := <-sub.Err():
			log.Println("Subscription error on Chain A: ", err)
			return
		case vLog := <-logs:

			event, err := l.chainAAbi.Unpack("Locked", vLog.Data)
			if err == nil {
				user := common.HexToAddress(vLog.Topics[1].Hex())
				amount := event[0].(*big.Int)
				fmt.Printf("Locked event: user=%s, amount=%d\n", user.Hex(), amount)

				l.bridgeService.MintOnChainB(user, amount)
			}
		}
	}
}
