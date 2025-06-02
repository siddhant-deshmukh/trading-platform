'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import ConfirmationDialog from '@/components/ConfirmationDialog'
import { useAuth } from '@/context/AuthContext'
import { post } from '@/lib/apiCallClient'
import { Bid } from '@/types'


function AssignProjectBtn(props: { bid: Bid, project_owner_id: number }) {
  const { project_owner_id } = props;
  const { quote, estimatedTime, id: bid_id } = props.bid;
  const router = useRouter()

  const { user } = useAuth();

  if(user?.id != project_owner_id) {
    return <div></div>
  }
  return (
    <ConfirmationDialog 
      buttonText='Select Bid' 
      dialogTitle='Are you sure about selecting this Bid?' 
      dialogDesc={`Are you sure about selecting this Bid having quote ${quote} and estimated time of ${estimatedTime} days?`}
      postConfirmationFunction={async ()=> {
        const res = await post(`/bid/change-status/${bid_id}`, { status: 'IN_PROGRESS' });
        router.refresh();
      }}
      postRejectionFunction={()=> {
      }}
      />
  )
}

export default AssignProjectBtn
