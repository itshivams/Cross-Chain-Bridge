import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FiRefreshCw } from "react-icons/fi";

type ApiTransaction = {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  timeStamp: string;
  // Additional fields from Amoy API (optional)
  confirmations?: string;
  contractAddress?: string;
  cumulativeGasUsed?: string;
  gas?: string;
  gasPrice?: string;
  isError?: string;
  nonce?: string;
  txreceipt_status?: string;
};

export type TransactionHistoryProps = {
  address: string;
};

export const TransactionHistory = ({ address }: TransactionHistoryProps) => {
  const [activeTab, setActiveTab] = useState<"sepolia" | "amoy">("sepolia");
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const displayedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const trimString = (str: string, frontChars = 6, backChars = 4) => {
    if (str.length <= frontChars + backChars) return str;
    return `${str.slice(0, frontChars)}...${str.slice(-backChars)}`;
  };

  const formatTimestamp = (unix: string) => {
    const date = new Date(Number(unix) * 1000);
    return date.toLocaleString();
  };

  const fetchTransactions = useCallback(async () => {
    if (activeTab === "sepolia" && !address) return;

    setLoading(true);
    setError("");
    try {
      const url =
        activeTab === "amoy"
          ? "https://backend-hackiitk.itshivam.me/transaction-history?address=0xf9aca397dbccda6b2dd8aa31e22c1787e4870937"
          : `https://backend-hackiitk.itshivam.me/history?address=${address}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const data = await res.json();

      if (activeTab === "amoy") {
        setTransactions(data.result);
      } else {
        setTransactions(data.transactions);
      }
      setCurrentPage(1);
      setExpandedTx(null);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [activeTab, address]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const toggleExpand = (hash: string) => {
    setExpandedTx((prev) => (prev === hash ? null : hash));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <Card className="w-full bg-white/10 backdrop-blur-lg border border-transparent rounded-xl shadow-2xl transition-shadow duration-300">
      {/* Header with tabs and refresh button */}
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between px-6 pt-6">
        <CardTitle className="text-2xl font-bold text-white mb-4 md:mb-0">
          Transaction History
        </CardTitle>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex rounded-md bg-gray-800 p-1">
            <Button
              variant={activeTab === "sepolia" ? "default" : "outline"}
              onClick={() => setActiveTab("sepolia")}
              className={`px-4 py-2 transition-all duration-200 ${
                activeTab === "sepolia"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              Sepolia ETH
            </Button>
            <Button
              variant={activeTab === "amoy" ? "default" : "outline"}
              onClick={() => setActiveTab("amoy")}
              className={`px-4 py-2 transition-all duration-200 ${
                activeTab === "amoy"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              Amoy
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={fetchTransactions}
            title="Refresh transactions"
            className="p-2 hover:rotate-180 transition-transform duration-300 text-gray-300"
          >
            <FiRefreshCw size={24} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-md animate-pulse" />
            <Skeleton className="h-10 w-full rounded-md animate-pulse" />
            <Skeleton className="h-10 w-full rounded-md animate-pulse" />
          </div>
        ) : error ? (
          <p className="text-red-500 font-medium">{error}</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-300">No transactions found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="min-w-full border-separate" style={{ borderSpacing: "0 0.5rem" }}>
                <TableHeader className="bg-gray-800">
                  <TableRow>
                    <TableHead className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Transaction ID
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Timestamp
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      From
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      To
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Amount
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Status
                    </TableHead>
                    <TableHead className="px-6 py-3 text-center text-sm font-semibold text-gray-300">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedTransactions.map((tx, idx) => (
                    <React.Fragment key={tx.hash}>
                      <TableRow
                        className={`hover:bg-gray-700 transition-colors duration-200 ${
                          idx % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                        } rounded-md`}
                      >
                        <TableCell className="px-6 py-4 font-mono text-white">
                          {trimString(tx.hash, 6, 3)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-white">
                          {formatTimestamp(tx.timeStamp)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-white">
                          {trimString(tx.from)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-white">
                          {tx.to ? trimString(tx.to) : "N/A"}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-white">
                          {tx.value}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge variant={tx.to ? "default" : "secondary"}>
                            {tx.to ? "Completed" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Button
                            size="sm"
                            onClick={() => toggleExpand(tx.hash)}
                            className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                          >
                            {expandedTx === tx.hash ? "Less Info" : "More Info"}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedTx === tx.hash && (
                        <TableRow>
                          <TableCell colSpan={7} className="px-6 py-4 bg-gray-800 rounded-b-md">
                            <div className="bg-gray-900 p-4 rounded-md transition-all duration-300 space-y-2">
                              {activeTab === "amoy" ? (
                                <>
                                  <p className="text-sm text-gray-300">
                                    <strong>Transaction Hash:</strong>{" "}
                                    <span className="font-mono">{tx.hash}</span>
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>From:</strong> {tx.from}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>To:</strong> {tx.to || "N/A"}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>Value:</strong> {tx.value}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>Gas Used:</strong> {tx.gasUsed}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>Gas:</strong> {tx.gas}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>Gas Price:</strong> {tx.gasPrice}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>Cumulative Gas Used:</strong> {tx.cumulativeGasUsed}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>Confirmations:</strong> {tx.confirmations}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>Nonce:</strong> {tx.nonce}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>Contract Address:</strong>{" "}
                                    {tx.contractAddress || "N/A"}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>Tx Receipt Status:</strong> {tx.txreceipt_status}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>Is Error:</strong> {tx.isError}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>Timestamp:</strong> {formatTimestamp(tx.timeStamp)}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm text-gray-300">
                                    <strong>Transaction Hash:</strong>{" "}
                                    <span className="font-mono">{tx.hash}</span>
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>From:</strong> {tx.from}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>To:</strong> {tx.to || "N/A"}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>Value:</strong> {tx.value}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>Gas Used:</strong> {tx.gasUsed}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    <strong>Timestamp:</strong> {formatTimestamp(tx.timeStamp)}
                                  </p>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end space-x-4 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="border-gray-500 text-gray-300 hover:bg-gray-700"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="border-gray-500 text-gray-300 hover:bg-gray-700"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
