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
};

export type TransactionHistoryProps = {
  address: string;
};

export const TransactionHistory = ({ address }: TransactionHistoryProps) => {
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
    if (!address) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://backend-hackiitk.itshivam.me/history?address=${address}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const data = await res.json();
      setTransactions(data.transactions);
      setCurrentPage(1); 
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [address]);

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
    <Card className="w-full bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Transaction History</CardTitle>
        <Button
          variant="ghost"
          onClick={fetchTransactions}
          title="Refresh transactions"
          className="p-2 hover:rotate-180 transition-transform"
        >
          <FiRefreshCw size={20} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
 
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedTransactions.map((tx) => (
                  <React.Fragment key={tx.hash}>
                    <TableRow>
                      <TableCell className="font-mono">
                        {trimString(tx.hash, 6, 3)}
                      </TableCell>
                      <TableCell>{formatTimestamp(tx.timeStamp)}</TableCell>
                      <TableCell>{trimString(tx.from)}</TableCell>
                      <TableCell>
                        {tx.to ? trimString(tx.to) : "N/A"}
                      </TableCell>
                      <TableCell>{tx.value}</TableCell>
                      <TableCell>
                        <Badge variant={tx.to ? "default" : "secondary"}>
                          {tx.to ? "completed" : "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => toggleExpand(tx.hash)}>
                          {expandedTx === tx.hash ? "Less Info" : "More Info"}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedTx === tx.hash && (
                      <TableRow key={`${tx.hash}-expanded`}>
                        <TableCell colSpan={7}>
                          <div className="bg-gray-800 p-4 rounded">
                            <p>
                              <strong>Transaction Hash:</strong> {tx.hash}
                            </p>
                            <p>
                              <strong>From:</strong> {tx.from}
                            </p>
                            <p>
                              <strong>To:</strong> {tx.to || "N/A"}
                            </p>
                            <p>
                              <strong>Value:</strong> {tx.value}
                            </p>
                            <p>
                              <strong>Gas Used:</strong> {tx.gasUsed}
                            </p>
                            <p>
                              <strong>Timestamp:</strong>{" "}
                              {formatTimestamp(tx.timeStamp)}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
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
