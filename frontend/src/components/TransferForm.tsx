import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import styles from "../styles/TransferForm.module.css";
import WalletConnector from "./WalletConnector";

const transferSchema = z.object({
  sourceChain: z.string().nonempty("Source chain is required"),
  targetChain: z.string().nonempty("Target chain is required"),
  asset: z.string().nonempty("Asset is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  recipient: z
    .string()
    .startsWith("0x")
    .length(42, "Invalid recipient address"),
});

export default function TransferForm() {
  const [activeTab, setActiveTab] = useState("transfer");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transferSchema),
  });

  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    alert("Transfer initiated!");
  };

  const connectMetaMask = () => {
    alert("Connecting to MetaMask...");
    // Add MetaMask connection logic here
  };

  const connectWalletConnect = () => {
    alert("Connecting to WalletConnect...");
    // Add WalletConnect connection logic here
  };

  return (
    <div className={styles.formContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Cross-Chain Bridge</h1>
        <div className={styles.walletButtons}>
          <button
            type="button"
            className={styles.walletButton}
            onClick={connectMetaMask}
          >
            <img
              src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/metamask-icon.png"
              alt="MetaMask"
            />
            MetaMask
          </button>
          <button type="button" className={styles.walletButton}>
            <img
              src="https://images.seeklogo.com/logo-png/43/1/walletconnect-logo-png_seeklogo-430923.png?v=1957907400795823728"
              alt="WalletConnect"
            />
            <WalletConnector />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "transfer" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("transfer")}
        >
          Transfer
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "history" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </div>

      {activeTab === "transfer" && (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          {/* Source Chain */}
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="sourceChain">Source Chain</label>
              <select id="sourceChain" {...register("sourceChain")}>
                <option value="">Select source chain</option>
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="binance">Binance Smart Chain</option>
              </select>
              {errors.sourceChain && (
                <p className={styles.error}>{errors.sourceChain.message}</p>
              )}
            </div>
            <div className={styles.field}>
              <label htmlFor="targetChain">Target Chain</label>
              <select id="targetChain" {...register("targetChain")}>
                <option value="">Select target chain</option>
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="binance">Binance Smart Chain</option>
              </select>
              {errors.targetChain && (
                <p className={styles.error}>{errors.targetChain.message}</p>
              )}
            </div>
          </div>

          {/* Asset */}
          <div className={styles.field}>
            <label htmlFor="asset">Asset</label>
            <select id="asset" {...register("asset")}>
              <option value="">Select asset</option>
              <option value="eth">ETH</option>
              <option value="usdt">USDT</option>
              <option value="matic">MATIC</option>
            </select>
            {errors.asset && (
              <p className={styles.error}>{errors.asset.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className={styles.field}>
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.0"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className={styles.error}>{errors.amount.message}</p>
            )}
          </div>

          {/* Recipient Address */}
          <div className={styles.field}>
            <label htmlFor="recipient">Recipient Address</label>
            <input
              id="recipient"
              type="text"
              placeholder="0x..."
              {...register("recipient")}
            />
            {errors.recipient && (
              <p className={styles.error}>{errors.recipient.message}</p>
            )}
          </div>

          <button type="submit" className={styles.submitButton}>
            Connect Wallet to Transfer
          </button>
        </form>
      )}

      {activeTab === "history" && (
        <div className={styles.history}>
          <p>No transfer history yet.</p>
        </div>
      )}
    </div>
  );
}
