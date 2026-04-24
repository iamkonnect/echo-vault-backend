DELETE FROM "Transaction";
DELETE FROM "Gift";
UPDATE "User" SET "walletBalance" = 0;
SELECT 'All financial data cleared' as status;
