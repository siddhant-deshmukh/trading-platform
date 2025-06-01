'use client'

import { BidStatus, ProjectWithRelations } from '@/types'
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { post } from '@/lib/apiCallClient';
import { FaAngleDown } from 'react-icons/fa';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function SelectedBidOfProject(props: ProjectWithRelations) {
  const { selectedBid, bidMsgs } = props

  const [bidMsgList, setBidMsgList] = useState(bidMsgs);
  const [msgInput, setMsgInput] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const addMsg = async () => {
    const res = await post(`/bid/msg/${selectedBid.id}`, {
      msg: msgInput
    });
    if (res && res.data && res.data.id) {
      setBidMsgList((prev) => {
        if (prev) return [res.data, ...prev];
        else[res.data];
      });
      setMsgInput('');
    }

  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
  if (!selectedBid || !user) return <div></div>;
  return (
    <>
      <div key={selectedBid.id} className="border-b border-gray-200 py-2 px-2">
        <div className='flex items-center justify-between'>
          <p className="text-md text-gray-800 dark:text-gray-200 mb-1">
            <span className="font-semibold">{selectedBid.bidder.name}</span> @{selectedBid.bidder.username}
          </p>
          {
            selectedBid.bidderId == user.id &&
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{selectedBid.bidderStatus} <FaAngleDown /> </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuGroup className='flex flex-col'>
                  {
                    Object.keys(BidStatus)
                      .filter((ele) => {
                        //@ts-expect-error frenog oeargbos bogearon or
                        return ele && Number.isNaN(Number(ele)) && ele != selectedBid.bidderStatus
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
          }
          {
            selectedBid.bidderId != user.id &&
            <span className={`status-badge badge-${selectedBid.bidderStatus}`}>
              {selectedBid.bidderStatus}
            </span>
          }
        </div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-bold text-green-600 dark:text-green-400">
            {formatCurrency(selectedBid.quote)}
          </p>
          <p className="text-sm font-medium text-gray-700 italic dark:text-gray-300">
            Estimate: <span className="font-semibold">{selectedBid.estimatedTime}</span> day{selectedBid.estimatedTime !== 1 ? 's' : ''}
          </p>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          {selectedBid.message}
        </p>
      </div>

      <div className='flex justify-between items-end space-x-2'>
        <Input value={msgInput} onChange={(e) => { setMsgInput(e.target.value) }} className='w-full'></Input>
        <Button onClick={() => { addMsg() }}>
          Add Msg
        </Button>
      </div>

      {
        selectedBid && Array.isArray(bidMsgList) &&
        bidMsgList.map((msg) => {
          return (
            <div key={msg.id} className="border-b border-gray-200 py-2 px-2">
              <div className='flex items-center justify-between'>
                <p className="text-md text-gray-800 dark:text-gray-200 mb-1">
                  <span className="font-semibold">{msg.user.name}</span> @{msg.user.username}
                </p>
                {/* <AssignProjectBtn bid={bid} project_owner_id={project.ownerId} /> */}
              </div>

              <p className="text-gray-700 dark:text-gray-300">
                {msg.message}
              </p>
            </div>
          )
        })
      }
    </>
  )
}

export default SelectedBidOfProject
