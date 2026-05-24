import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview, // ◄── Keep Preview grouped right here!
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";


// const PREVIEW_DATA = {
//   monthlyReport: {
//     userName: "John Doe",
//     type: "monthly-report",
//     data: {
//       month: "December",
//       stats: {
//         totalIncome: 5000,
//         totalExpenses: 3500,
//         byCategory: {
//           housing: 1500,
//           groceries: 600,
//           transportation: 400,
//           entertainment: 300,
//           utilities: 700,
//         },
//       },
//       insights: [
//         "Your housing expenses are 43% of your total spending - consider reviewing your housing costs.",
//         "Great job keeping entertainment expenses under control this month!",
//         "Setting up automatic savings could help you save 20% more of your income.",
//       ],
//     },
//   },
//   budgetAlert: {
//     userName: "John Doe",
//     type: "budget-alert",
//     data: {
//       percentageUsed: 85,
//       budgetAmount: 4000,
//       totalExpenses: 3400,
//     },
//   },
// };

export default function EmailTemplate({
  userName= "",
  type= "monthly-report",
  data= {},
}) {
  if (type === "monthly-report") {
    return (
      <Html>
        <Head />
        <Preview>Your Monthly Financial Report</Preview>

        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>
              Monthly Financial Report
            </Heading>

            <Text style={styles.text}>
              Hello {userName},
            </Text>

            <Text style={styles.text}>
              Here&rsquo;s your financial summary for{" "}
              {data?.month}:
            </Text>

            {/* Main Stats */}
            <Section style={styles.statsContainer}>
              <Row style={{ marginBottom: "16px" }}>
                <Column style={styles.stat}>
                  <Text style={styles.statLabel}>
                    Total Income
                  </Text>

                  <Text style={styles.statValue}>
                    $
                    {Number(
                      data?.stats?.totalIncome || 0
                    ).toFixed(2)}
                  </Text>
                </Column>
              </Row>

              <Row style={{ marginBottom: "16px" }}>
                <Column style={styles.stat}>
                  <Text style={styles.statLabel}>
                    Total Expenses
                  </Text>

                  <Text
                    style={{
                      ...styles.statValue,
                      color: "#ef4444",
                    }}
                  >
                    $
                    {Number(
                      data?.stats?.totalExpenses || 0
                    ).toFixed(2)}
                  </Text>
                </Column>
              </Row>

              <Row>
                <Column style={styles.stat}>
                  <Text style={styles.statLabel}>
                    Net Savings
                  </Text>

                  <Text
                    style={{
                      ...styles.statValue,
                      color:
                        (data?.stats?.totalIncome || 0) -
                          (data?.stats?.totalExpenses || 0) >=
                        0
                          ? "#16a34a"
                          : "#ef4444",
                    }}
                  >
                    $
                    {(
                      (data?.stats?.totalIncome || 0) -
                      (data?.stats?.totalExpenses || 0)
                    ).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Category Breakdown */}
            {Object.keys(
              data?.stats?.byCategory || {}
            ).length > 0 && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>
                  Expenses by Category
                </Heading>

                {Object.entries(
                  data?.stats?.byCategory || {}
                ).map(([category, amount]) => (
                  <Row
                    key={category}
                    style={styles.row}
                  >
                    <Column>
                      <Text style={styles.text}>
                        {category}
                      </Text>
                    </Column>

                    <Column align="right">
                      <Text style={styles.text}>
                        $
                        {Number(amount).toFixed(2)}
                      </Text>
                    </Column>
                  </Row>
                ))}
              </Section>
            )}

            {/* AI Insights */}
            {data?.insights?.length > 0 && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>
                  Spend Insights
                </Heading>

                {data.insights.map(
                  (insight, index) => (
                    <Text
                      key={index}
                      style={styles.text}
                    >
                      • {insight}
                    </Text>
                  )
                )}
              </Section>
            )}

            <Text style={styles.footer}>
              Thank you for using SmartSpend.
              Keep tracking your finances for
              better financial health!
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }
  if (type === "budget-alert") {
    return (
      <Html>
        <Head />
        <Preview>⚠️ Budget Warning: {data?.percentageUsed ? Number(data.percentageUsed).toFixed(1) : "0.0"}% Limit Reached!</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Budget Alert</Heading>
            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              You&rsquo;ve used {data?.percentageUsed ? Number(data.percentageUsed).toFixed(1) : "0.0"}% of your
              monthly budget.
            </Text>
            
            {/* Table-based structural cards for email safety */}
            <Section style={styles.statsContainer}>
              <Row style={{ marginBottom: "16px" }}>
                <Column style={styles.stat}>
                  <Text style={styles.statLabel}>Budget Amount</Text>
                  <Text style={styles.statValue}>
                    ${Number(data?.budgetAmount || 0).toFixed(2)}
                  </Text>
                </Column>
              </Row>
              
              <Row style={{ marginBottom: "16px" }}>
                <Column style={styles.stat}>
                  <Text style={styles.statLabel}>Spent So Far</Text>
                  <Text style={{ ...styles.statValue, color: "#ef4444" }}>
                    ${Number(data?.totalExpenses || 0).toFixed(2)}
                  </Text>
                </Column>
              </Row>
              
              <Row>
                <Column style={styles.stat}>
                  <Text style={styles.statLabel}>Remaining</Text>
                  <Text style={{ ...styles.statValue, color: "#16a34a" }}>
                    ${((data?.budgetAmount || 0) - (data?.totalExpenses || 0)).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: "20px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "32px 24px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    maxWidth: "480px",
  },
  title: {
    color: "#1f2937",
    fontSize: "26px",
    fontWeight: "bold",
    textAlign: "center",
    margin: "0 0 24px",
  },
  heading: {
    color: "#1f2937",
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 16px",
  },
  text: {
    color: "#4b5563",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 16px",
  },
  section: {
    marginTop: "24px",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
  },
  statsContainer: {
    margin: "24px 0",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
  },
  stat: {
    padding: "16px",
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    display: "block",
    width: "100%",
  },
  statLabel: {
    margin: "0 0 4px 0",
    fontSize: "13px",
    color: "#6b7280",
  },
  statValue: {
    margin: "0",
    fontSize: "22px",
    fontWeight: "700",
    color: "#1f2937",
  },
  // ◄── Cleaned up flex layout rules (handled natively via <Row> and <Column> now)
  row: {
    padding: "8px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  footer: {
    color: "#9ca3af",
    fontSize: "13px",
    textAlign: "center",
    lineHeight: "1.5",
    marginTop: "32px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  },
  rightText: {
    textAlign: "right",
  },
};

