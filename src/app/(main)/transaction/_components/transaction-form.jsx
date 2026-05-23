"use client";

import { createTransaction, updateTransaction } from '@/actions/transaction';
import { transactionSchema } from '@/app/lib/schema';
import CreateAccountDrawer from '@/components/create-account-drawer';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/use-fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ReceiptScanner from './recipt-scanner';

const AddTransactionForm = ({accounts,categories,editMode = false,initialData = null,}) => {

  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const {register,handleSubmit,formState: { errors },watch,setValue,getValues,reset,}=useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        :{
          type: "EXPENSE",
          amount: "",
          description: "",
          accountId: accounts.find((ac) => ac.isDefault)?.id,
          date: new Date(),
          isRecurring: false,
        },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };
    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode]);

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
      toast.success("Receipt scanned successfully");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl border border-neutral-100 shadow-lg p-6 sm:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* AI Receipt Scanner */}
        {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

        {/* Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Type</label>
          <Select
            onValueChange={(value) => setValue("type", value)}
            defaultValue={type}
          >
            <SelectTrigger className="w-full bg-neutral-50/50">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Expense</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Amount and Account */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Amount</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="bg-neutral-50/50"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Account</label>
            <Select
              onValueChange={(value) => setValue("accountId", value)}
              defaultValue={getValues("accountId")}
            >
              <SelectTrigger className="w-full bg-neutral-50/50">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} (${parseFloat(account.balance).toFixed(2)})
                  </SelectItem>
                ))}
                <CreateAccountDrawer>
                  <Button
                    variant="ghost"
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 text-sm font-medium text-blue-600 outline-none hover:bg-blue-50 hover:text-blue-700"
                  >
                    + Create New Account
                  </Button>
                </CreateAccountDrawer>
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.accountId.message}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Category</label>
          <Select
            onValueChange={(value) => setValue("category", value)}
            value={watch("category")}
          >
            <SelectTrigger className="w-full bg-neutral-50/50">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                type="button"
                className="w-full pl-3 text-left font-normal bg-neutral-50/50 hover:bg-neutral-50"
              >
                {date ? format(date, "PPP") : <span>Pick a date</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => setValue("date", date)}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Description</label>
          <Input placeholder="Enter description" className="bg-neutral-50/50" {...register("description")} />
          {errors.description && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Recurring Toggle */}
        <div className="flex flex-row items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/30 p-4 transition-colors">
          <div className="space-y-0.5">
            <label className="text-sm font-semibold text-neutral-800">Recurring Transaction</label>
            <div className="text-xs text-neutral-500">
              Set up a recurring schedule for this transaction
            </div>
          </div>
          <Switch
            checked={isRecurring}
            onCheckedChange={(checked) => setValue("isRecurring", checked)}
          />
        </div>

        {/* Recurring Interval */}
        {isRecurring && (
          <div className="space-y-2 p-4 bg-neutral-50 border border-neutral-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="text-sm font-medium text-neutral-700">Recurring Interval</label>
            <Select
              onValueChange={(value) => setValue("recurringInterval", value)}
              defaultValue={getValues("recurringInterval")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
            {errors.recurringInterval && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {errors.recurringInterval.message}
              </p>
            )}
          </div>
        )}
        
        {/* Actions*/}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
          <Button
            type="button"
            variant="outline"
            className="w-full text-neutral-600 hover:bg-neutral-50"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="w-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
            disabled={transactionLoading}
          >
            {transactionLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editMode ? "Updating..." : "Creating..."}
              </>
            ) : editMode ? (
              "Update Transaction"
            ) : (
              "Create Transaction"
            )}
          </Button>
        </div>
      </form>
    </div> 
    
  )
}

export default AddTransactionForm