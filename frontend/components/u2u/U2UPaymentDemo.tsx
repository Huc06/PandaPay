"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    CheckCircle,
    XCircle,
    ExternalLink,
    Wallet,
    ShoppingCart,
} from "lucide-react";
import { useU2UContract } from "@/hooks/useU2UContract";
import type { CreatePaymentResult, TransactionDetails } from "@/lib/u2u-contract-api";

export default function U2UPaymentDemo() {
    // Form states
    const [merchantAddress, setMerchantAddress] = useState("");
    const [amount, setAmount] = useState("0.01");
    const [customerPrivateKey, setCustomerPrivateKey] = useState("");
    const [merchantPrivateKey, setMerchantPrivateKey] = useState("");
    const [businessName, setBusinessName] = useState("");

    // Result states
    const [paymentResult, setPaymentResult] = useState<CreatePaymentResult | null>(null);
    const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
    const [step, setStep] = useState<
        "idle" | "creating" | "confirming" | "completed"
    >("idle");

    const {
        loading,
        error,
        registerMerchant,
        createPayment,
        confirmPayment,
        getTransactionDetails,
        getMerchantInfo,
        getTransactionExplorerUrl,
    } = useU2UContract();

    // Handle merchant registration
    const handleRegisterMerchant = async () => {
        if (!businessName || !merchantPrivateKey) {
            alert("Please fill in business name and merchant private key");
            return;
        }

        try {
            const result = await registerMerchant({
                businessName,
                privateKey: merchantPrivateKey,
            });

            setMerchantAddress(result.merchantAddress);
            alert(
                `Merchant registered successfully!\nAddress: ${result.merchantAddress}\nTx: ${result.txHash}`
            );
        } catch (err) {
            console.error("Failed to register merchant:", err);
        }
    };

    // Handle payment creation
    const handleCreatePayment = async () => {
        if (!merchantAddress || !amount || !customerPrivateKey) {
            alert("Please fill in all required fields");
            return;
        }

        setStep("creating");
        setPaymentResult(null);
        setTransactionDetails(null);

        try {
            const result = await createPayment({
                merchantAddress,
                amount,
                paymentMethod: "POS",
                privateKey: customerPrivateKey,
            });

            setPaymentResult(result);
            setStep("confirming");

            // Auto-fetch transaction details
            const txDetails = await getTransactionDetails(result.transactionId);
            setTransactionDetails(txDetails);
        } catch (err) {
            console.error("Failed to create payment:", err);
            setStep("idle");
        }
    };

    // Handle payment confirmation
    const handleConfirmPayment = async () => {
        if (!paymentResult || !merchantPrivateKey) {
            alert("Please complete payment creation first");
            return;
        }

        try {
            const result = await confirmPayment({
                transactionId: paymentResult.transactionId,
                privateKey: merchantPrivateKey,
            });

            alert(
                `Payment confirmed successfully!\nTx: ${result.txHash}`
            );

            // Refresh transaction details
            const txDetails = await getTransactionDetails(
                paymentResult.transactionId
            );
            setTransactionDetails(txDetails);
            setStep("completed");
        } catch (err) {
            console.error("Failed to confirm payment:", err);
        }
    };

    // Reset form
    const handleReset = () => {
        setStep("idle");
        setPaymentResult(null);
        setTransactionDetails(null);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">
                    U2U Contract Payment Demo
                </h1>
                <p className="text-gray-600">
                    Test U2U smart contract payment flow
                </p>
            </div>

            {/* Merchant Registration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Step 1: Register Merchant (Optional)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                            id="businessName"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="My Coffee Shop"
                        />
                    </div>
                    <div>
                        <Label htmlFor="merchantPrivateKey">
                            Merchant Private Key
                        </Label>
                        <Input
                            id="merchantPrivateKey"
                            type="password"
                            value={merchantPrivateKey}
                            onChange={(e) =>
                                setMerchantPrivateKey(e.target.value)
                            }
                            placeholder="0x..."
                        />
                    </div>
                    <Button
                        onClick={handleRegisterMerchant}
                        disabled={loading || !businessName || !merchantPrivateKey}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registering...
                            </>
                        ) : (
                            "Register Merchant"
                        )}
                    </Button>
                    {merchantAddress && (
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                Merchant Address: {merchantAddress}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Payment Creation */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Step 2: Create Payment
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="merchantAddress">Merchant Address</Label>
                        <Input
                            id="merchantAddress"
                            value={merchantAddress}
                            onChange={(e) => setMerchantAddress(e.target.value)}
                            placeholder="0x..."
                        />
                    </div>
                    <div>
                        <Label htmlFor="amount">Amount (U2U)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.001"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.01"
                        />
                    </div>
                    <div>
                        <Label htmlFor="customerPrivateKey">
                            Customer Private Key
                        </Label>
                        <Input
                            id="customerPrivateKey"
                            type="password"
                            value={customerPrivateKey}
                            onChange={(e) =>
                                setCustomerPrivateKey(e.target.value)
                            }
                            placeholder="0x..."
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleCreatePayment}
                            disabled={
                                loading ||
                                step !== "idle" ||
                                !merchantAddress ||
                                !amount ||
                                !customerPrivateKey
                            }
                        >
                            {step === "creating" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Payment...
                                </>
                            ) : (
                                "Create Payment"
                            )}
                        </Button>

                        {step !== "idle" && (
                            <Button variant="outline" onClick={handleReset}>
                                Reset
                            </Button>
                        )}
                    </div>

                    {paymentResult && (
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-1">
                                    <p>
                                        <strong>Transaction ID:</strong>{" "}
                                        {paymentResult.transactionId}
                                    </p>
                                    <p className="text-xs break-all">
                                        <strong>Tx Hash:</strong>{" "}
                                        {paymentResult.txHash}
                                    </p>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="p-0 h-auto"
                                        onClick={() =>
                                            window.open(
                                                getTransactionExplorerUrl(
                                                    paymentResult.txHash
                                                ),
                                                "_blank"
                                            )
                                        }
                                    >
                                        <ExternalLink className="mr-1 h-3 w-3" />
                                        View on Explorer
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Payment Confirmation */}
            {step === "confirming" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 3: Confirm Payment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <AlertDescription>
                                Payment created successfully. Merchant can now
                                confirm the payment.
                            </AlertDescription>
                        </Alert>

                        <Button
                            onClick={handleConfirmPayment}
                            disabled={loading || !merchantPrivateKey}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Confirming...
                                </>
                            ) : (
                                "Confirm Payment"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Transaction Details */}
            {transactionDetails && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Transaction Details
                            <Badge
                                variant={
                                    transactionDetails.status === 1
                                        ? "default"
                                        : "secondary"
                                }
                            >
                                {transactionDetails.status === 0 && "Pending"}
                                {transactionDetails.status === 1 && "Completed"}
                                {transactionDetails.status === 2 && "Refunded"}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Transaction ID</p>
                                <p className="font-mono">
                                    {transactionDetails.transactionId}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Amount</p>
                                <p className="font-mono">
                                    {transactionDetails.amountFormatted}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Payment Method</p>
                                <p>{transactionDetails.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Timestamp</p>
                                <p>
                                    {new Date(
                                        transactionDetails.timestamp * 1000
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-600">Merchant</p>
                                <p className="font-mono text-xs break-all">
                                    {transactionDetails.merchant}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-600">Customer</p>
                                <p className="font-mono text-xs break-all">
                                    {transactionDetails.user}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error Display */}
            {error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
