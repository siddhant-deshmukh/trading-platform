'use client'; // This directive marks the component as a Client Component

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter from next/navigation

import { IProject } from '@/types'; // Ensure IProject type is correctly defined
import { post } from '@/lib/apiCallClient'; // Import the client-side post function
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';

const CreateProjectForm: React.FC = () => {
  // Initialize state for form fields
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [budgetMin, setBudgetMin] = useState<string>(''); // Use string for input to handle empty state easily
  const [budgetMax, setBudgetMax] = useState<string>('');
  const [deadline, setDeadline] = useState<string>(''); // ISO 8601 date string (YYYY-MM-DD)
  const [open, setOpen] = React.useState(false);

  // State for loading, error, and success messages
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { user } = useAuth();
  // Initialize Next.js router
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Handles the form submission event.
   * @param e The form event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsLoading(true); // Set loading state to true

    const payload = {
      title,
      description,
      // Convert budget fields to numbers or null if empty
      budgetMin: budgetMin ? parseFloat(budgetMin) : undefined,
      budgetMax: budgetMax ? parseFloat(budgetMax) : undefined,
      // Format deadline to ISO 8601 string if provided, otherwise undefined
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      // Status and ownerId are typically handled on the server or derived from auth
      // For this example, they are not part of the form input as per your schema
    };

    try {
      // Make the POST request to your API endpoint
      // Assuming your API endpoint for creating projects is '/product'
      const data = await post<IProject>('/product', payload);
      if (data) {
        setOpen(false);
        router.refresh();
        setTitle('');
        setDeadline('');
        setBudgetMax('');
        setBudgetMin('');
        setDescription('');
      }
    } catch (apiError: any) {
      // Catch any unexpected errors during the fetch operation
      setError(apiError.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };
  if(!user || (pathname != '/projects' && pathname != '/')) return <div></div>;
  return (
    <div className="container flex justify-end">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild >
          <Button className=''> + Create New Project</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-2xl font-semibold' >Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>

            {/* Budget Min Field */}
            <div>
              <label htmlFor="budgetMin" className="block text-sm font-medium text-gray-700">
                Minimum Budget (Optional)
              </label>
              <input
                type="number"
                id="budgetMin"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                step="0.01" // Allow decimal values
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Budget Max Field */}
            <div>
              <label htmlFor="budgetMax" className="block text-sm font-medium text-gray-700">
                Maximum Budget (Optional)
              </label>
              <input
                type="number"
                id="budgetMax"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                step="0.01" // Allow decimal values
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Deadline Field */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                Deadline (Optional)
              </label>
              <input
                type="date" // Use type="date" for a date picker
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading} // Disable button when loading
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Project...' : 'Create Project'}
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

export default CreateProjectForm;
