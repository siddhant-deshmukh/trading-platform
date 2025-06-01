'use client'

import { useAuth } from '@/context/AuthContext'
import { BidStatus, ProjectWithRelations } from '@/types'
import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import { FaAngleDown } from 'react-icons/fa';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { post } from '@/lib/apiCallClient';
import { useRouter } from 'next/navigation';

function ChangeCustomerStatus(props: ProjectWithRelations) {
  const { selectedBid, ownerId } = props
  const { user } = useAuth();
  const router = useRouter();

  const getChangeStatusFunction = (status: string) => {
    return async () => {
      const res = await post(`/bid/change-status/${selectedBid.id}`, {
        status
      });
      if (res && res.success) {
        router.refresh();
      }
    }
  }

  if(user?.id == ownerId) {
    return (
      <div className={`badge-${selectedBid.customerStatus} rounded-xl`}>
        <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{selectedBid.customerStatus} <FaAngleDown /> </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuGroup className='flex flex-col'>
                  {
                    Object.keys(BidStatus)
                      .filter((ele) => {
                        //@ts-expect-error frenog oeargbos bogearon or
                        return ele && Number.isNaN(Number(ele)) && ele != selectedBid.customerStatus
                      })
                      .map((ele) => {
                        return <ConfirmationDialog
                          variant={'ghost'}
                          buttonText={ele}
                          dialogTitle={`Confirm Status Change`}
                          dialogDesc={`Are you sure wanted to change status to ${ele}?`}
                          postConfirmationFunction={() => { getChangeStatusFunction(ele)() }}
                          postRejectionFunction={() => { }}
                          dialogSubmitBtnText='Change'
                          key={ele} />
                      })
                  }
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
      </div>
    )
  } else {
    return (
      <span className={`status-badge badge-${selectedBid.customerStatus}`}>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        {selectedBid.customerStatus}
      </span>
    )
  }
}

export default ChangeCustomerStatus
