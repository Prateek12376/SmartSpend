"use client";

import React, { useEffect, useState } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from './ui/input';
import { accountSchema } from '@/app/lib/schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import useFetch from '@/hooks/use-fetch';
import { createAccount } from '@/actions/dashboard';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const CreateAccountDrawer = ({children}) => {
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // 1. Add mounting state

  const router = useRouter();

  // 2. Set mounted to true on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue, 
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    loading: createAccountLoading,
    fn: createAccountFn,
    error,
    data: newAccount,
  } = useFetch(createAccount);

  const onSubmit = async (data) => {
    await createAccountFn(data);
  };

  useEffect(() => {
    if (newAccount && !createAccountLoading) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
      router.refresh();
    }
  }, [createAccountLoading, newAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [error]);

  // 3. Return children only during SSR to prevent Hydration mismatch
  if (!isMounted) return <>{children}</>;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Account</DrawerTitle>
          {/* 4. Added a hidden description to fix the aria-describedby warning */}
          <p className="text-sm text-muted-foreground px-4">
            Fill in the details to add a new account to your tracker.
          </p>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Account Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Account Name</label>
              <Input id="name" placeholder="e.g., Main Checking" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Account Type</label>
              <Select 
                onValueChange={(value) => setValue("type", value)} 
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Balance */}
            <div className="space-y-2">
              <label htmlFor="balance" className="text-sm font-medium">Initial Balance</label>
              <Input 
                id="balance" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                {...register("balance")} 
              />
              {errors.balance && <p className="text-sm text-red-500">{errors.balance.message}</p>}
            </div>

            {/* Switch */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <label htmlFor="isDefault" className="text-base font-medium cursor-pointer">
                  Set as Default
                </label>
                <p className="text-sm text-muted-foreground">Used by default for transactions</p>
              </div>
              <Switch 
                id="isDefault" 
                checked={watch("isDefault")} 
                onCheckedChange={(checked) => setValue("isDefault", checked)} 
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">Cancel</Button>
              </DrawerClose>
              <Button type="submit" className="flex-1" disabled={createAccountLoading}>
                {createAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating... 
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default CreateAccountDrawer;