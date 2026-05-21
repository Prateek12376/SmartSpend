"use client"; 

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { endOfDay, format, startOfDay, startOfMonth, startOfYear, subDays } from 'date-fns';
import React, { useMemo, useState } from 'react'
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const DATE_RANGES = {
  "CURRENT_MONTH": { label: "Current Month", days: "CURRENT_MONTH" }, // ◄── Add this line
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "2M": { label: "Last 2 Months", days: 60 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  "1Y": { label: "Last 1 Year", days: 365 },
  YTD: { label: "Year to Date", days: "YTD" },
  ALL: { label: "All Time", days: null },
};
const AccountChart = ({transactions}) => {
  const [dateRange, setDateRange]= useState("CURRENT_MONTH");
  

  const filteredData = useMemo(()=>{
    const range = DATE_RANGES[dateRange];
    const now = new Date();

    let startDate;

    if (range.days === null) {
      startDate = startOfDay(new Date(0));
    } else if (range.days === "YTD") {
      startDate = startOfYear(now);
    } else if (range.days === "CURRENT_MONTH") { 
      startDate = startOfMonth(now); // ◄── Forces the graph start-point to Day 1 of this month
    } else {
      startDate = startOfDay(subDays(now, range.days));
    }

     // Filter transactions within date range
    const startTimestamp = startDate.getTime();
    const endTimestamp = endOfDay(now).getTime();

    
    const filtered = transactions.filter((t) => {
      const transactionTime = new Date(t.date).getTime();
      return transactionTime >= startTimestamp && transactionTime <= endTimestamp;
    });

    // Group transactions by formatted date string
    const grouped = filtered.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd");
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0, rawDate: new Date(transaction.date) };
      }
      
      const amount = Math.abs(Number(transaction.amount)) || 0;
      if (transaction.type === "INCOME") {
        acc[date].income += amount;
      } else {
        acc[date].expense += amount;
      }
      return acc;
    }, {});

    // Convert back to array and sort wrt to date  
    return Object.values(grouped).sort((a, b) => {
      if (!a?.rawDate) return -1;
      if (!b?.rawDate) return 1;
      return a.rawDate.getTime() - b.rawDate.getTime();
    });
  },[transactions, dateRange])
    
  

  // Calculate totals for the selected tracking period
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);


return (
    <Card className="w-full shadow-sm border transition-all duration-300 hover:shadow-md bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-base font-semibold tracking-tight text-foreground">
          Transaction Overview
        </CardTitle>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40 h-9 text-sm font-medium border-muted-foreground/20">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-lg">
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key} className="text-sm cursor-pointer rounded-md">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {/* KPI Metrics Display Row */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm bg-muted/40 p-4 rounded-xl border border-dashed border-muted-foreground/20">
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Income</p>
            <p className="text-lg font-bold text-emerald-500 tracking-tight">
              ${totals.income.toFixed(2)}
            </p>
          </div>
          <div className="text-center space-y-1 border-x border-muted-foreground/10">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Expenses</p>
            <p className="text-lg font-bold text-rose-500 tracking-tight">
              ${totals.expense.toFixed(2)}
            </p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Net Balance</p>
            <p
              className={`text-lg font-bold tracking-tight ${
                totals.income - totals.expense >= 0
                  ? "text-emerald-500"
                  : "text-rose-500"
              }`}
            >
              ${(totals.income - totals.expense).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Graph Container Section Wrapper - Added structural floor heights */}
        <div className="h-80 w-full min-h-80 min-w-0">
          {filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm font-medium text-muted-foreground animate-pulse">
              No transactions recorded for this period.
            </div>
          ) : (
            
            <ResponsiveContainer width="100%" height="100%" minHeight={320}>
              <BarChart
                data={filteredData}
                
                margin={{ top: 10, right: 10, left: -15, bottom: 15 }} 
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/60" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10} 
                  className="text-muted-foreground/80 font-medium"
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  domain={[0, 'auto']} 
                  className="text-muted-foreground/80 font-medium"
                />
                <Tooltip
                  formatter={(value, name) => {
                    const formattedValue = `$${Math.abs(value).toFixed(2)}`;
                    const isIncome = name === "income" || name === "Income";

                    const style = {
                      color: isIncome ? "#22c55e" : "#ef4444",
                      fontWeight: "600",
                    };
                  return [
                    <span style={style} key={name}>{formattedValue}</span>,
                    isIncome ? "Income" : "Expense"
                  ];
                }}

                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)", 
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px", 
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)", // Soft elevation drop shadow
                    padding: "10px 14px",
                  }}
                  itemStyle={{ color: "#1e293b", fontWeight: "500", fontSize: "13px" }}
                  labelStyle={{ color: "#64748b", fontWeight: "600", fontSize: "12px", marginBottom: "4px" }}
                />
                <Legend className="text-xs font-medium pt-4" />
                <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AccountChart