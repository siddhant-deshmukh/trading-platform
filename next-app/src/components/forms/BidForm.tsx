'use client'; // This directive marks the component as a Client Component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import { post } from '@/lib/apiCallClient'; // Import the client-side post function
import { IProject } from '@/types'; // Ensure IProject type is correctly defined
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { useAuth } from '@/context/AuthContext';
import { Bid } from '@/types'


interface IProps {
  project_id: number,
  owner_id: number,
  bids?: Bid[]
}

const BidForm = (props: IProps) => {
  // Initialize state for form fields
  const [message, setMessage] = useState<string>('');
  const [quote, setQuote] = useState<number>(0); // Use string for input to handle empty state easily
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
 
  const [open, setOpen] = React.useState(false);

  const { user } = useAuth();

  // State for loading, error, and success messages
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Initialize Next.js router
  const router = useRouter();

  /**
   * Handles the form submission event.
   * @param e The form event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsLoading(true); // Set loading state to true

    const payload = {
      message,
      quote,
      estimatedTime,
      projectId: props.project_id,
    };

    try {
      // Make the POST request to your API endpoint
      // Assuming your API endpoint for creating projects is '/project'
      const data = await post<IProject>('/bid', payload);
      if (data) {
        setOpen(false);
        router.refresh();
        setEstimatedTime(0);
        setQuote(0);
        setMessage('');
      }
    } catch (apiError: any) {
      // Catch any unexpected errors during the fetch operation
      setError(apiError.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  if( !user || user?.id == props.owner_id || (Array.isArray(props.bids) && props.bids.length == 1 && props.bids[0].bidderId == user.id)) {
    return <div></div>
  }
  return (
    <div className="container w-fit">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild >
          <Button className=''> + Add Bid</Button>
        </DialogTrigger>
        <DialogContent>undefined
        undefined
          <DialogHeader>
            <DialogTitle className='text-2xl font-semibold' >Create Bid</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>

            {/* Budget Min Field */}
            <div>
              <label htmlFor="quote" className="block text-sm font-medium text-gray-700">
                Quote <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quote"
                value={quote}
                required
                onChange={(e) => setQuote(parseFloat(e.target.value))}
                step="0.01" // Allow decimal values
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Budget Max Field */}
            <div>
              <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700">
                Estimated Time <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="estimatedTime"
                required
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(parseInt(e.target.value))}
                step="0.01" // Allow decimal values
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>


            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading} // Disable button when loading
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Bid...' : 'Create Bid'}
            </button>

            {/* Messages */}
            {error && (
              <div className="mt-4 text-red-600 text-sm p-3 bg-red-50 rounded-md">
                Error: {error}
              </div>
            )}
            {successMsg && (
              <div className="mt-4 text-green-600 text-sm p-3 bg-green-50 rounded-md">
                {successMsg}
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BidForm;
