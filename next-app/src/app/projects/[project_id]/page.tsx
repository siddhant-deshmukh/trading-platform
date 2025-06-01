import BidForm from '@/components/forms/BidForm';
import { get } from '@/lib/apiCallServer'
import { cookies } from 'next/headers';
import React from 'react'
import AssignProjectBtn from '../components/AssignProjectBtn';
import { NextServerComponentProps, ProjectWithRelations } from '@/types';

import SelectedBidOfProject from '../components/SelectedBidOfProject';
import ChangeCustomerStatus from '../components/ChangeCustomerStatus';



async function Projects({ params, searchParams }: NextServerComponentProps) {

  const { project_id } = (await params);
  const { user_type } = await searchParams;

  const auth_token = (await cookies()).get('auth_token')

  const { data } = await get<ProjectWithRelations>(`/product/${project_id}${user_type ? `?user_type=${user_type}` : ''} `, {
    headers: {
      'Authorization': auth_token?.value
    }
  });
  const project = data;
  
  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <p className="text-xl">Project not found.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl min-h-screen p-2 sm:p-3 lg:p-4 border border-gray-200 dark:border-gray-700">
      <h1 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">{project.title}</h1>
      <p className="text-md text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{project.description}</p>

      <div className="flex flex-wrap gap-3 mb-8">
        {project.budgetMin || project.budgetMax ? (
          <span className="status-badge badge-blue">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Budget: {project.budgetMin && project.budgetMax
              ? `${formatCurrency(project.budgetMin)} - ${formatCurrency(project.budgetMax)}`
              : project.budgetMin ? `Min ${formatCurrency(project.budgetMin)}` : `Max ${formatCurrency(project.budgetMax)}`}
          </span>
        ) : (
          <span className="status-badge badge-gray">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Budget: Negotiable
          </span>
        )}
        {project.deadline && (
          <span className="status-badge badge-purple">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Deadline: {new Date(project.deadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        )}
      </div>

      <div className='flex justify-between items-center py-2 border-b my-2'>
        <p className="text-gray-700 dark:text-gray-300 ">
          posted by <span className="font-semibold">{project.owner.name}</span> (@{project.owner.username})
        </p>
        <ChangeCustomerStatus {...project} />
      </div>
      


      < SelectedBidOfProject {...project} />
      {
        !project.selectedBid && <div className='flex justify-between items-center w-full py-3'>
          <p className="text-gray-600 dark:text-gray-400">{project._count.bids ? project._count.bids : 'No'} bids placed yet for this project.</p>
          <BidForm project_id={project.id} owner_id={project.ownerId} bids={project.bids} />
        </div>
      }
      {Array.isArray(project.bids) && project.bids.length > 0 &&
        <div className="">
          {project.bids.map((bid: any) => (
            <div key={bid.id} className="border-y border-gray-200 py-2 px-2">
              <div className='flex items-center justify-between'>
                <p className="text-md text-gray-800 dark:text-gray-200 mb-1">
                  <span className="font-semibold">{bid.bidder.name}</span> @{bid.bidder.username}
                </p>
                <AssignProjectBtn bid={bid} project_owner_id={project.ownerId} />
              </div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(bid.quote)}
                </p>
                <p className="text-sm font-medium text-gray-700 italic dark:text-gray-300">
                  Estimate: <span className="font-semibold">{bid.estimatedTime}</span> day{bid.estimatedTime !== 1 ? 's' : ''}
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {bid.message}
              </p>
            </div>
          ))}
        </div>
      }
    </div>
  )
}

export default Projects
