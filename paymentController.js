/**
 * Payment Controller
 * Handles coin package retrieval, payment initiation, and webhook processing.
 */
const prisma = require('./src/utils/prisma');

// Mock payment gateway services (replace with actual SDK integrations)
const paypalService = {
    initiate: async (amount, userId, transactionId) => {
        console.log(`Initiating PayPal payment for user ${userId}, amount ${amount}, transaction ${transactionId}`);
        return {
            success: true,
            redirectUrl: `https://mock-paypal.com/pay?amount=${amount}&tx=${transactionId}`,
            gatewayTransactionId: `paypal_tx_${Date.now()}`
        };
    }
};

const mobileMoneyService = {
    initiate: async (amount, phoneNumber, userId, transactionId) => {
        console.log(`Initiating Mobile Money payment for user ${userId}, phone ${phoneNumber}, amount ${amount}, transaction ${transactionId}`);
        return {
            success: true,
            message: 'STK push initiated. Awaiting confirmation.',
            gatewayTransactionId: `momo_tx_${Date.now()}`
        };
    }
};

const stripeService = {
    initiate: async (amount, userId, transactionId) => {
        console.log(`Initiating Stripe payment for user ${userId}, amount ${amount}, transaction ${transactionId}`);
        return {
            success: true,
            clientSecret: `stripe_client_secret_${Date.now()}`,
            gatewayTransactionId: `stripe_tx_${Date.now()}`
        };
    }
};

exports.getCoinPackages = async (req, res) => {
    try {
        const packages = await prisma.coinPackage.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });
        return res.json({ success: true, data: packages });
    } catch (error) {
        console.error('Error fetching coin packages:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch coin packages' });
    }
};

exports.initiatePayment = async (req, res) => {
    const { packageId, customAmount, paymentMethod, phoneNumber } = req.body;
    const userId = req.user.id;

    try {
        let amountToPay;
        let coinsToReceive;

        if (packageId) {
            const coinPackage = await prisma.coinPackage.findUnique({ where: { id: packageId } });
            if (!coinPackage || !coinPackage.isActive) {
                return res.status(404).json({ success: false, message: 'Coin package not found or inactive' });
            }
            amountToPay = coinPackage.price;
            coinsToReceive = coinPackage.coins;
        } else if (customAmount && customAmount > 0) {
            amountToPay = parseFloat(customAmount);
            coinsToReceive = Math.floor(amountToPay * 100); // Example: $1 = 100 coins
        } else {
            return res.status(400).json({ success: false, message: 'Invalid package or amount' });
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId: userId,
                amount: amountToPay,
                type: 'COIN_PURCHASE',
                status: 'PENDING',
                description: `Purchase ${coinsToReceive} coins via ${paymentMethod}`,
                paymentGateway: paymentMethod,
            }
        });

        let paymentResponse;
        switch (paymentMethod) {
            case 'PAYPAL':
                paymentResponse = await paypalService.initiate(amountToPay, userId, transaction.id);
                break;
            case 'MOBILE_MONEY':
                if (!phoneNumber) return res.status(400).json({ success: false, message: 'Phone number required' });
                paymentResponse = await mobileMoneyService.initiate(amountToPay, phoneNumber, userId, transaction.id);
                break;
            case 'STRIPE':
                paymentResponse = await stripeService.initiate(amountToPay, userId, transaction.id);
                break;
            default:
                return res.status(400).json({ success: false, message: 'Unsupported payment method' });
        }

        if (paymentResponse.success) {
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { gatewayTransactionId: paymentResponse.gatewayTransactionId }
            });
            return res.json({ success: true, message: 'Payment initiated', paymentDetails: paymentResponse });
        } else {
            await prisma.transaction.update({ where: { id: transaction.id }, data: { status: 'FAILED' } });
            return res.status(500).json({ success: false, message: 'Payment initiation failed' });
        }
    } catch (error) {
        console.error('Error initiating payment:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.handlePaymentWebhook = async (req, res) => {
    const { gatewayName } = req.params;
    console.log(`Received webhook from ${gatewayName}:`, req.body);

    try {
        const gatewayTransactionId = req.body.transactionId;
        const status = req.body.status;
        const amountPaid = req.body.amount;

        const transaction = await prisma.transaction.findFirst({
            where: { gatewayTransactionId: gatewayTransactionId, status: 'PENDING' }
        });

        if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

        if (status === 'COMPLETED' && amountPaid >= transaction.amount) {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: transaction.userId },
                    data: { walletBalance: { increment: transaction.amount * 100 } }
                }),
                prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { status: 'COMPLETED', description: `Coins purchased: ${transaction.amount * 100}` }
                })
            ]);
            return res.json({ success: true, message: 'Payment successfully processed' });
        } else {
            await prisma.transaction.update({ where: { id: transaction.id }, data: { status: 'FAILED' } });
            return res.status(200).json({ success: true, message: 'Payment marked as failed' });
        }
    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};