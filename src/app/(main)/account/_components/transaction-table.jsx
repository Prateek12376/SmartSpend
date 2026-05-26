"use client"

import { bulkDeleteTransactions } from '@/actions/account'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent,  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { categoryColors } from '@/data/categories'
import useFetch from '@/hooks/use-fetch'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, MoreHorizontalIcon, RefreshCcw, Search, Trash, X,ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { BarLoader } from 'react-spinners'
import { toast } from 'sonner'

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const ITEMS_PER_PAGE = 10;  // for max transaction at one page
const TransactionTable = ({transactions}) => {

  const router=useRouter();
  const [selectedIds,setSelectedIds] = useState([]);
  const [sortConfig,setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);  // for pagination 

  const filterAndSortedTransactions = useMemo(()=>{
    let result = [...transactions];   // we are dublicating the transactions 

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    // Apply recurring filter
    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });



    return result;
  },[transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);


  const totalPages = Math.ceil(filterAndSortedTransactions.length / ITEMS_PER_PAGE);

  // for pagination
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filterAndSortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filterAndSortedTransactions, currentPage]);

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  // for one select 
  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  
  //for bulk select 
  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === paginatedTransactions.length
        ? []
        : paginatedTransactions.map((t) => t.id)  // Check ONLY current page IDs
    );
  };
  // function for bulk delete 
      const {
        loading: deleteLoading,
        fn: deleteFn,
        data: deleted,
      } = useFetch(bulkDeleteTransactions);

  const handleBulkDelete = () => {
        if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
    )
      return;

    deleteFn(selectedIds);   // from here directly  , if we ckick on delete 
  }

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.error("Transactions deleted successfully");
    }
  }, [deleted, deleteLoading]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setCurrentPage(1); // Reset back to start, for pagination 
  }

  // for pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedIds([]); // Instantly resets your checked boxes array on page change
  };

  return (
    <div className="space-y-4">

      {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}
      
      {/* filters */}
      <div className="flex flex-col lg:flex-row gap-3 w-full">
        <div className="relative flex-1 min-w-0 w-full">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input className="pl-10"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset back to start , for pagination
              
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value)
              setCurrentPage(1); 
            }}
          >
            <SelectTrigger className="flex-1 sm:flex-initial w-full sm:w-40 min-w-35 h-10 bg-white" >
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter}
            onValueChange={(value) =>{
              setRecurringFilter(value)
              setCurrentPage(1); 
              
            }}
          >
            <SelectTrigger className="flex-1 sm:flex-initial w-full sm:w-44 min-w-41.25 h-10 bg-white" >
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length>0 && (
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <Button 
                variant='destructive' 
                size='sm' 
                onClick={handleBulkDelete}>
                <Trash className='h-4 w-4 mr-2'/>
                Delete Selected ({selectedIds.length})
              </Button>
            </div>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button 
              variant='outline' 
              size='icon' 
              onClick={handleClearFilters} 
              title="Clear Filters">
              <X className='h-4 w-5'/>
            </Button>
          )}
        </div>

      </div>

      {/* Transactions */}
      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-212.5 lg:min-w-full">
            <TableHeader className="bg-neutral-50">
              <TableRow>
                <TableHead className="w-12 text-center">
                <Checkbox 
                  onCheckedChange={handleSelectAll}
                  checked={selectedIds.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                />
                </TableHead>
                <TableHead className="cursor-pointer select-none w-32"
                onClick={()=> handleSort("date")}
                >
                  <div className='flex items-center gap-1 font-semibold text-neutral-900'>
                    Date{" "}
                    {sortConfig.field==='date'&&
                      (sortConfig.direction==="asc" ? 
                      (<ChevronUp className='h-4 w-4'/>
                      ):(
                      <ChevronDown className='h-4 w-4'/>
                      ))}
                  </div>
                </TableHead>

                <TableHead className="font-semibold text-neutral-900">Description</TableHead>

                <TableHead className="cursor-pointer select-none w-36"
                onClick={()=> handleSort("category")}
                >
                  <div className='flex items-center gap-1 font-semibold text-neutral-900'>
                    Category{" "}
                    {sortConfig.field==='category'&&
                      (sortConfig.direction==="asc" ? 
                      (<ChevronUp className='h-4 w-4'/>
                      ):(
                      <ChevronDown className='h-4 w-4'/>
                      ))}
                  </div>
                </TableHead>

                <TableHead className="cursor-pointer select-none w-36 text-right"
                onClick={()=> handleSort("amount")}
                >
                  <div className='flex items-center justify-end gap-1 font-semibold text-neutral-900'>
                    Amount{" "}
                    {sortConfig.field==='amount'&&
                      (sortConfig.direction==="asc" ? 
                      (<ChevronUp className='h-4 w-4'/>
                      ):(
                      <ChevronDown className='h-4 w-4'/>
                      ))}
                  </div>
                </TableHead>

                <TableHead className="font-semibold text-neutral-900 w-36">Recurring</TableHead>
                <TableHead className='w-12'/>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length===0?(
                <TableRow>
                  <TableCell colSpan={7} className='text-center h-24 text-muted-foreground font-medium'>
                    No Transactions Found 
                  </TableCell>
                </TableRow>
              ):(
                paginatedTransactions.map((transaction)=>(
                  <TableRow key={transaction.id} className="hover:bg-neutral-50/50 transition-colors">
                    <TableCell className="text-center">
                      <Checkbox onCheckedChange={()=>handleSelect(transaction.id)}
                        checked={selectedIds.includes(transaction.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {format(new Date(transaction.date),"PP")}
                    </TableCell>
                    <TableCell className="max-w-55 truncate font-medium text-neutral-700">{transaction.description}</TableCell>
                    <TableCell className='capitalize'>
                      <span style ={{
                        background : categoryColors[transaction.category],
                      }}
                      className='px-2.5 py-0.5 rounded-full text-white text-xs font-semibold shadow-sm tracking-wide'
                      >
                        {transaction.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold tracking-tight" 
                    style ={{
                      color : transaction.type==='EXPENSE'? "#ef4444" : "#10b981"
                    }}>
                      {transaction.type==='EXPENSE'? "-" : "+"}
                      ${transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {transaction.isRecurring? (
                        <TooltipProvider delayDuration={150}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant='outline' 
                                className='gap-1 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 rounded-full font-medium py-0.5 cursor-pointer'>
                                <RefreshCcw className='h-3 w-3'/>
                                {RECURRING_INTERVALS[transaction.recurringInterval]}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-neutral-900 text-white p-2 rounded-lg shadow-md">
                              <div className='text-xs space-y-0.5'>
                                <div className='font-semibold opacity-80'>Next Date:</div>
                                <div className="font-bold text-purple-300">
                                  {format(new Date(transaction.nextRecurringDate),"PP")}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ):(<Badge variant='outline' className='gap-1 text-muted-foreground bg-neutral-50 rounded-full font-medium py-0.5'>
                          <Clock className='h-3 w-3'/>
                          One-time
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className='h-8 w-8 p-0 hover:bg-neutral-100 rounded-full'>
                            <MoreHorizontal className='h-4 w-4'/>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl shadow-md border-neutral-100">
                            <DropdownMenuItem
                              className="cursor-pointer font-medium py-2 rounded-md"
                              onClick={()=>
                                router.push(
                                  `/transaction/create?edit=${transaction.id}`
                                )
                              }
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='text-destructive cursor-pointer font-medium py-2 rounded-md focus:bg-destructive/10' 
                            onClick={()=>deleteFn([transaction.id])}
                            >
                              Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* ─── PAGINATION SECTION NAVIGATION BAR ─── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium text-muted-foreground px-2">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default TransactionTable


