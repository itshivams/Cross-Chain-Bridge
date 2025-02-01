import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Transaction = {
  id: string;
  timestamp: string;
  from: string;
  to: string;
  amount: string;
  status: "pending" | "completed" | "failed";
};

const mockTransactions: Transaction[] = [
  {
    id: "0x123...abc",
    timestamp: "2024-02-20 10:30:00",
    from: "Amoy",
    to: "Sepolia",
    amount: "1.5 ETH",
    status: "completed",
  },
  {
    id: "0x456...def",
    timestamp: "2024-02-20 10:25:00",
    from: "Sepolia",
    to: "Amoy",
    amount: "0.5 ETH",
    status: "pending",
  },
];

export const TransactionHistory = () => {
  return (
    <Card className="w-full bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-mono">{tx.id}</TableCell>
                <TableCell>{tx.timestamp}</TableCell>
                <TableCell>{tx.from}</TableCell>
                <TableCell>{tx.to}</TableCell>
                <TableCell>{tx.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      tx.status === "completed"
                        ? "default"
                        : tx.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {tx.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};