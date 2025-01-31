package services

import (
	"fmt"
	"log"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

type BridgeService struct {
	chainBClient      *YourChainBContractBindings
	relayerPrivateKey string
	chainBGateway     common.Address
}

func NewBridgeService(
	chainBClient *YourChainBContractBindings,
	relayerPrivateKey string,
	chainBGateway common.Address,
) *BridgeService {
	return &BridgeService{
		chainBClient:      chainBClient,
		relayerPrivateKey: relayerPrivateKey,
		chainBGateway:     chainBGateway,
	}
}

func (s *BridgeService) MintOnChainB(user common.Address, amount *big.Int) {
	privateKey, err := crypto.HexToECDSA(s.relayerPrivateKey[2:])
	if err != nil {
		log.Println("Error parsing private key: ", err)
		return
	}
	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, big.NewInt(11155111))
	if err != nil {
		log.Println("Error creating transactor: ", err)
		return
	}

	tx, err := s.chainBClient.Mint(auth, user, amount)
	if err != nil {
		log.Println("Error calling mint on chain B: ", err)
		return
	}
	fmt.Printf("Mint transaction sent on chain B. Tx Hash: %s\n", tx.Hash().Hex())
}
