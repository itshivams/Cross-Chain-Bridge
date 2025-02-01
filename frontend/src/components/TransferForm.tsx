import React, { useState } from "react";
import styles from "../styles/TransferForm.module.css";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faWallet,
  faBell,
  faCopy,
  faExchangeAlt,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

const TransferForm = () => {
  const [fromNetwork, setFromNetwork] = useState("");
  const [toNetwork, setToNetwork] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [message, setMessage] = useState("");

  // Function to handle wallet connection
  const handleConnectWallet = () => {
    setMessage("Wallet connected successfully!");
  };

  // Function to swap "From" and "To" networks
  const handleSwapNetworks = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
    setMessage("Networks swapped successfully!");
  };

  // Function to copy text to clipboard
  const handleCopy = () => {
    const textToCopy = "Your wallet address or other text here";
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setMessage("Copied to clipboard!");
      })
      .catch(() => {
        setMessage("Failed to copy to clipboard.");
      });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cross-Chain Bridge</h1>
        <div className={styles.headerRight}>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search for a token..."
              className={styles.searchInput}
            />
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          </div>
          <div className={styles.wallet}>
            <FontAwesomeIcon icon={faWallet} />
            <span>4</span>
          </div>
          <FontAwesomeIcon icon={faBell} />
          <button
            className={styles.connectButton}
            onClick={handleConnectWallet}
          >
            Connect wallet
          </button>
        </div>
      </header>

      <main>
        {/* Display messages */}
        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Bridge tokens</h2>
            <div className={styles.cardActions}>
              <FontAwesomeIcon
                icon={faCopy}
                onClick={handleCopy}
                style={{ cursor: "pointer" }}
              />
              <FontAwesomeIcon
                icon={faExchangeAlt}
                onClick={handleSwapNetworks}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
          <p className={styles.cardText}>
            Transfer your tokens from one network to another.
          </p>
          <Link href="#" passHref>
            <span className={styles.showMore}>Show more</span>
          </Link>

          <div className={styles.grid}>
            <div>
              <p className={styles.label}>From this network</p>
              <div className={styles.selectWrapper}>
                <select
                  className={styles.select}
                  value={fromNetwork}
                  onChange={(e) => setFromNetwork(e.target.value)}
                >
                  <option>Select source chain</option>
                  <option>Ethereum</option>
                  <option>Polygon</option>
                  <option>Optimism</option>
                </select>
                <FontAwesomeIcon icon={faChevronDown} className={styles.icon} />
              </div>
            </div>
            <div>
              <p className={styles.label}>To this network</p>
              <div className={styles.selectWrapper}>
                <select
                  className={styles.select}
                  value={toNetwork}
                  onChange={(e) => setToNetwork(e.target.value)}
                >
                  <option>Select source chain</option>
                  <option>Ethereum</option>
                  <option>Polygon</option>
                  <option>Optimism</option>
                </select>
                <FontAwesomeIcon icon={faChevronDown} className={styles.icon} />
              </div>
            </div>
          </div>

          <div className={styles.grid}>
            <div>
              <p className={styles.label}>You send</p>
              <input
                type="text"
                className={styles.input}
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
              />
            </div>
            <div>
              <p className={styles.label}>You receive</p>
              <input
                type="text"
                className={styles.input}
                value={receiveAmount}
                onChange={(e) => setReceiveAmount(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardFooter}>
            <div>
              <p className={styles.total}>Total (send + gas)</p>
              <p className={styles.totalAmount}>$0.00</p>
              <p className={styles.fee}>Includes a 0.875% MetaMask fee</p>
            </div>
            <button
              className={styles.connectButton}
              onClick={handleConnectWallet}
            >
              Connect wallet
            </button>
          </div>
        </div>

        <p className={styles.terms}>
          By confirming, you agree to MetaMask's
          <Link href="https://consensys.io/terms-of-use" passHref>
            <span className={styles.termsLink}>Terms of Use</span>
          </Link>
        </p>
      </main>
    </div>
  );
};

export default TransferForm;
