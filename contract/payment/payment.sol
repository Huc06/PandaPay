// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PaymentSystem
 * @dev Contract for managing payments between Merchants and Users via POS/QR
 * @notice Designed for U2U Network Mainnet (Chain ID: 39)
 * @notice All payments are processed in U2U native token
 */
contract PaymentSystem {
    
    // Struct defining merchant information
    struct Merchant {
        address walletAddress;
        string businessName;
        bool isActive;
        uint256 totalTransactions;
        uint256 totalRevenue;
    }
    
    // Struct defining transaction information
    struct Transaction {
        uint256 transactionId;
        address merchant;
        address user;
        uint256 amount;
        uint256 timestamp;
        string paymentMethod; // "POS" or "QR"
        TransactionStatus status;
    }
    
    // Enum for transaction status
    enum TransactionStatus {
        Pending,
        Completed,
        Refunded,
        Cancelled
    }
    
    // State variables
    address public owner;
    uint256 public platformFeePercent = 1; // Platform fee 1%
    uint256 public transactionCounter;
    
    mapping(address => Merchant) public merchants;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256[]) public userTransactions;
    mapping(address => uint256[]) public merchantTransactions;
    
    // Events
    event MerchantRegistered(address indexed merchantAddress, string businessName);
    event PaymentInitiated(uint256 indexed transactionId, address indexed merchant, address indexed user, uint256 amount, string paymentMethod);
    event PaymentCompleted(uint256 indexed transactionId, uint256 merchantAmount, uint256 platformFee);
    event PaymentRefunded(uint256 indexed transactionId, uint256 amount);
    event PlatformFeeUpdated(uint256 newFeePercent);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier onlyActiveMerchant() {
        require(merchants[msg.sender].isActive, "Merchant not active");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Register a new merchant
     * @param _businessName The name of the merchant's business
     */
    function registerMerchant(string memory _businessName) external {
        require(!merchants[msg.sender].isActive, "Merchant already registered");
        require(bytes(_businessName).length > 0, "Business name required");
        
        merchants[msg.sender] = Merchant({
            walletAddress: msg.sender,
            businessName: _businessName,
            isActive: true,
            totalTransactions: 0,
            totalRevenue: 0
        });
        
        emit MerchantRegistered(msg.sender, _businessName);
    }
    
    /**
     * @dev Create a new payment (called by user)
     * @param _merchant The merchant's address
     * @param _paymentMethod Either "POS" or "QR"
     * @notice Sends U2U tokens as payment
     */
    function createPayment(address _merchant, string memory _paymentMethod) external payable {
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(merchants[_merchant].isActive, "Merchant not active");
        require(
            keccak256(bytes(_paymentMethod)) == keccak256(bytes("POS")) || 
            keccak256(bytes(_paymentMethod)) == keccak256(bytes("QR")),
            "Invalid payment method"
        );
        
        transactionCounter++;
        
        transactions[transactionCounter] = Transaction({
            transactionId: transactionCounter,
            merchant: _merchant,
            user: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            paymentMethod: _paymentMethod,
            status: TransactionStatus.Pending
        });
        
        userTransactions[msg.sender].push(transactionCounter);
        merchantTransactions[_merchant].push(transactionCounter);
        
        emit PaymentInitiated(transactionCounter, _merchant, msg.sender, msg.value, _paymentMethod);
    }
    
    /**
     * @dev Confirm a payment (merchant or owner only)
     * @param _transactionId The ID of the transaction to confirm
     */
    function confirmPayment(uint256 _transactionId) external {
        Transaction storage txn = transactions[_transactionId];
        require(txn.status == TransactionStatus.Pending, "Transaction not pending");
        require(
            msg.sender == txn.merchant || msg.sender == owner,
            "Only merchant or owner can confirm"
        );
        
        // Calculate fees
        uint256 platformFee = (txn.amount * platformFeePercent) / 100;
        uint256 merchantAmount = txn.amount - platformFee;
        
        // Transfer funds
        payable(txn.merchant).transfer(merchantAmount);
        payable(owner).transfer(platformFee);
        
        // Update status
        txn.status = TransactionStatus.Completed;
        
        // Update merchant statistics
        Merchant storage merchant = merchants[txn.merchant];
        merchant.totalTransactions++;
        merchant.totalRevenue += merchantAmount;
        
        emit PaymentCompleted(_transactionId, merchantAmount, platformFee);
    }
    
    /**
     * @dev Refund a payment (owner or merchant only)
     * @param _transactionId The ID of the transaction to refund
     */
    function refundPayment(uint256 _transactionId) external {
        Transaction storage txn = transactions[_transactionId];
        require(txn.status == TransactionStatus.Pending, "Can only refund pending transactions");
        require(
            msg.sender == txn.merchant || msg.sender == owner,
            "Only merchant or owner can refund"
        );
        
        txn.status = TransactionStatus.Refunded;
        payable(txn.user).transfer(txn.amount);
        
        emit PaymentRefunded(_transactionId, txn.amount);
    }
    
    /**
     * @dev Deactivate a merchant (owner only)
     * @param _merchant The address of the merchant to deactivate
     */
    function deactivateMerchant(address _merchant) external onlyOwner {
        merchants[_merchant].isActive = false;
    }
    
    /**
     * @dev Update platform fee percentage (owner only)
     * @param _newFeePercent The new fee percentage (max 10%)
     */
    function updatePlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 10, "Fee cannot exceed 10%");
        platformFeePercent = _newFeePercent;
        emit PlatformFeeUpdated(_newFeePercent);
    }
    
    /**
     * @dev Get transaction history for a user
     * @param _user The user's address
     * @return Array of transaction IDs
     */
    function getUserTransactions(address _user) external view returns (uint256[] memory) {
        return userTransactions[_user];
    }
    
    /**
     * @dev Get transaction history for a merchant
     * @param _merchant The merchant's address
     * @return Array of transaction IDs
     */
    function getMerchantTransactions(address _merchant) external view returns (uint256[] memory) {
        return merchantTransactions[_merchant];
    }
    
    /**
     * @dev Get detailed transaction information
     * @param _transactionId The transaction ID
     * @return merchant The merchant's address
     * @return user The user's address
     * @return amount The transaction amount
     * @return timestamp The transaction timestamp
     * @return paymentMethod The payment method used
     * @return status The transaction status
     */
    function getTransactionDetails(uint256 _transactionId) external view returns (
        address merchant,
        address user,
        uint256 amount,
        uint256 timestamp,
        string memory paymentMethod,
        TransactionStatus status
    ) {
        Transaction memory txn = transactions[_transactionId];
        return (
            txn.merchant,
            txn.user,
            txn.amount,
            txn.timestamp,
            txn.paymentMethod,
            txn.status
        );
    }
    
    /**
     * @dev Get merchant information
     * @param _merchant The merchant's address
     * @return businessName The business name
     * @return isActive Whether the merchant is active
     * @return totalTransactions Total number of transactions
     * @return totalRevenue Total revenue earned
     */
    function getMerchantInfo(address _merchant) external view returns (
        string memory businessName,
        bool isActive,
        uint256 totalTransactions,
        uint256 totalRevenue
    ) {
        Merchant memory m = merchants[_merchant];
        return (m.businessName, m.isActive, m.totalTransactions, m.totalRevenue);
    }
}