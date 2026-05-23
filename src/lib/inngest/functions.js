import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";


export const checkBudgetAlerts = inngest.createFunction(
  {
    id: "check-budget-alerts",   
    name: "Check Budget Alerts",
    triggers: [
      { cron: "0 */6 * * *" }      
    ]
  },
  async ({ step }) => {
    const budgets = await step.run("fetch-budget",async ()=>{
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });

    for (const budget of budgets){
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue; 

      await step.run(`check-budget-${budget.id}`, async () => {

        const currentDate = new Date();

        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );

        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );

        // Calculate total expenses for the default account only
        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id, // Only consider default account
            type: "EXPENSE",
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          _sum: {
            amount: true,
          },
        });
        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = budget.amount;
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        if (percentageUsed >= 80 &&(!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), new Date()))){
          //send email
          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: (
              <EmailTemplate
                userName={budget.user.name}
                type="budget-alert"
                data={{
                  percentageUsed,
                  budgetAmount: Number(budgetAmount),
                  totalExpenses: Number(totalExpenses),
                  accountName: defaultAccount.name,
                }}
              />
            ),
          });

          // Update last alert sent
          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        }
      });
    }

  }
);

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

// for handling recurring transaction

export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions", // Unique ID,
    name: "Trigger Recurring Transactions",
    triggers: [
      { cron: "0 0 * * *" }
    ],
  },
  // 1
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null },
              {
                nextRecurringDate: {
                  lte: endOfToday,
                },
              },
            ],
          },
        });
      }
    );

    // 2 Send events for each recurring transaction in batches
    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: {
          transactionId: transaction.id,
          userId: transaction.userId,
        },
      }));

      // 3 Send events directly using inngest.send() to batch-process with throttling active
      await step.run("emit-processing-events", async () => {
        return await inngest.send(events);
      });
    }

    return { triggered: recurringTransactions.length };
  }
);


// Recurring Transaction Processing with Throttling
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    // Inngest v3: Triggers must be defined directly inside the options configuration object
    triggers: [
      { event: "transaction.recurring.process" }
    ],
    throttle: {
      limit: 10, // Process 10 transactions
      period: "1m", // per minute
      key: "event.data.userId", // Throttle per user to prevent DB connection spikes
    },
  },
  async ({ event, step }) => {
    // Validate event data
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data:", event);
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          account: true,
        },
      });

      if (!transaction || !isTransactionDue(transaction)) return;

      // Create new transaction and update account balance 
      await db.$transaction(async (tx) => {
        // Create new transaction entry
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false, // This generated ledger entry is historical
          },
        });

        // Update account balance
        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });

        // Update last processed date
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });
      });
    });
  }
);

// Helper to double check if the transaction is due today
function isTransactionDue(transaction) {
  if (!transaction.nextRecurringDate) return true;
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return new Date(transaction.nextRecurringDate) <= endOfToday;
}

// function to calculate the next execution date
function calculateNextRecurringDate(startDate, interval) {
  const next = new Date(startDate);
  switch (interval) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}