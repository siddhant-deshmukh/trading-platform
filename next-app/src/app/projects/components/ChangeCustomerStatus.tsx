'use client'

import React from 'react'
import { useRouter } from 'next/navigation';
import { FaAngleDown } from 'react-icons/fa';

import { post } from '@/lib/apiCallClient';
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button';
import { BidStatus, ProjectWithRelations } from '@/types'
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

function ChangeCustomerStatus(props: ProjectWithRelations) {
  const { selectedBid, ownerId, status: project_status } = props

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

  if(!selectedBid) {
    return (
      <span className={`status-badge badge-${project_status}`}>
        {project_status}
      </span>
    )
  } else if(user?.id == ownerId) {
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
        {selectedBid.customerStatus}
      </span>
    )
  }
}

export default ChangeCustomerStatus
